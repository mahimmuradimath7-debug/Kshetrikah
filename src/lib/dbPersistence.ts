/**
 * KSHETRIKAH (क्षेत्रिकः) - Production WAL Storage & Expert Queue Persistence
 * Government of Maharashtra MSInS Challenge #26131
 * Developed by TEAM BITHEADS
 *
 * Implements an atomic Write-Ahead Log (WAL) engine:
 * - Persists scan telemetry, diagnoses, and farmer feedback to data/scans_wal.json
 * - In-memory ring buffer for sub-millisecond query responses
 * - Automatic triage: Any disputed scan or low-confidence diagnosis (<0.70)
 *   is automatically routed to the KVK Agronomist review board.
 */

import fs from 'fs';
import path from 'path';
import type { CropId, CropStage, SoilType, Severity, RiskLevel } from '@/data/types';

export interface PersistentScanRecord {
  id: string;
  timestamp: string; // ISO 8601
  crop: CropId;
  cropStage?: CropStage;
  soilType?: SoilType;
  diseaseId: string;
  diseaseName: string;
  confidence: number;
  fusedScore: number;
  severity: Severity;
  riskLevel: RiskLevel;
  provider: 'nvidia' | 'gemini' | 'claude' | 'local_model' | 'edge_heuristics';
  district?: string;
  taluka?: string;
  lat?: number;
  lng?: number;
  feedback: 'unreviewed' | 'confirmed' | 'disputed';
  disputeReason?: string;
  farmerContact?: string;
  farmerName?: string;
  kvkStatus: 'none' | 'pending_triage' | 'reviewed' | 'lab_referred';
  agronomistAdvice?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

const WAL_DIR = path.join(process.cwd(), 'data');
const WAL_FILE = path.join(WAL_DIR, 'scans_wal.json');
const MAX_IN_MEMORY_BUFFER = 500;

class ScanDatabaseEngine {
  private buffer: PersistentScanRecord[] = [];
  private isLoaded = false;
  private isWriting = false;
  private pendingWrites = false;

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    if (this.isLoaded) return;
    try {
      if (!fs.existsSync(WAL_DIR)) {
        fs.mkdirSync(WAL_DIR, { recursive: true });
      }

      if (fs.existsSync(WAL_FILE)) {
        const raw = fs.readFileSync(WAL_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.buffer = parsed.slice(-MAX_IN_MEMORY_BUFFER);
        }
      } else {
        // Seed with baseline historical data if brand new file
        this.buffer = [];
        this.flushToDisk();
      }
      this.isLoaded = true;
    } catch (err) {
      console.warn('[ScanDatabaseEngine] WAL init warning (using memory buffer):', err);
      this.isLoaded = true;
    }
  }

  private async flushToDisk(): Promise<void> {
    if (this.isWriting) {
      this.pendingWrites = true;
      return;
    }

    this.isWriting = true;
    try {
      const data = JSON.stringify(this.buffer, null, 2);
      const tempPath = `${WAL_FILE}.tmp.${Date.now()}`;
      await fs.promises.writeFile(tempPath, data, 'utf-8');
      await fs.promises.rename(tempPath, WAL_FILE);
    } catch (err) {
      console.error('[ScanDatabaseEngine] WAL atomic write error:', err);
    } finally {
      this.isWriting = false;
      if (this.pendingWrites) {
        this.pendingWrites = false;
        this.flushToDisk();
      }
    }
  }

  /**
   * Records a new scan to the persistent logbook and buffer.
   */
  public saveScanRecord(record: Omit<PersistentScanRecord, 'id' | 'timestamp' | 'feedback' | 'kvkStatus'> & Partial<Pick<PersistentScanRecord, 'id' | 'timestamp' | 'feedback' | 'kvkStatus'>>): PersistentScanRecord {
    this.ensureInitialized();

    const id = record.id || `KSH-SCAN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const timestamp = record.timestamp || new Date().toISOString();
    const confidence = record.confidence ?? 0.85;

    // Automatically route low confidence (<0.70) or already disputed scans to KVK triage
    const initialKvkStatus: PersistentScanRecord['kvkStatus'] =
      record.kvkStatus || (confidence < 0.70 ? 'pending_triage' : 'none');

    const fullRecord: PersistentScanRecord = {
      ...record,
      id,
      timestamp,
      confidence,
      feedback: record.feedback || 'unreviewed',
      kvkStatus: initialKvkStatus,
    };

    this.buffer.push(fullRecord);
    if (this.buffer.length > MAX_IN_MEMORY_BUFFER) {
      this.buffer.shift();
    }

    this.flushToDisk();
    return fullRecord;
  }

  /**
   * Retrieves recent scans with flexible filtering.
   */
  public getRecentScans(filters?: {
    crop?: string;
    district?: string;
    severity?: Severity | 'all' | string;
    kvkStatus?: string;
    feedback?: string;
    limit?: number;
  }): PersistentScanRecord[] {

    this.ensureInitialized();

    let list = [...this.buffer].reverse(); // newest first

    if (filters?.crop && filters.crop !== 'all') {
      list = list.filter((r) => r.crop === filters.crop);
    }
    if (filters?.district && filters.district !== 'all') {
      list = list.filter((r) => r.district === filters.district);
    }
    if (filters?.severity && filters.severity !== 'all') {
      list = list.filter((r) => r.severity === filters.severity);
    }
    if (filters?.kvkStatus && filters.kvkStatus !== 'all') {
      list = list.filter((r) => r.kvkStatus === filters.kvkStatus);
    }
    if (filters?.feedback && filters.feedback !== 'all') {
      list = list.filter((r) => r.feedback === filters.feedback);
    }

    const limit = filters?.limit ?? 50;
    return list.slice(0, limit);
  }

  /**
   * Returns a single scan by ID.
   */
  public getScanById(id: string): PersistentScanRecord | null {
    this.ensureInitialized();
    return this.buffer.find((r) => r.id === id) || null;
  }

  /**
   * Updates feedback for active learning (confirm / reject).
   */
  public recordScanFeedback(id: string, feedback: 'confirmed' | 'disputed', note?: string): boolean {
    this.ensureInitialized();
    const target = this.buffer.find((r) => r.id === id);
    if (!target) return false;

    target.feedback = feedback;
    if (feedback === 'disputed') {
      target.kvkStatus = 'pending_triage';
      if (note) target.disputeReason = note;
    }
    this.flushToDisk();
    return true;
  }

  /**
   * Creates an agronomist dispute ticket and routes directly to the Expert Triage board.
   */
  public recordScanDispute(
    id: string,
    reason: string,
    farmerInfo?: { name?: string; contact?: string }
  ): PersistentScanRecord | null {
    this.ensureInitialized();
    const target = this.buffer.find((r) => r.id === id);
    if (!target) return null;

    target.feedback = 'disputed';
    target.disputeReason = reason;
    target.kvkStatus = 'pending_triage';
    if (farmerInfo?.name) target.farmerName = farmerInfo.name;
    if (farmerInfo?.contact) target.farmerContact = farmerInfo.contact;

    this.flushToDisk();
    return target;
  }

  /**
   * Retrieves all records currently queued for KVK Agronomist triage.
   */
  public getExpertReviewQueue(): PersistentScanRecord[] {
    this.ensureInitialized();
    return this.buffer
      .filter((r) => r.kvkStatus === 'pending_triage' || r.feedback === 'disputed')
      .reverse();
  }

  /**
   * Updates agronomist review verdict on a disputed/triaged scan.
   */
  public updateKvkStatus(
    id: string,
    status: 'reviewed' | 'lab_referred',
    advice: string,
    agronomist: string
  ): boolean {
    this.ensureInitialized();
    const target = this.buffer.find((r) => r.id === id);
    if (!target) return false;

    target.kvkStatus = status;
    target.agronomistAdvice = advice;
    target.reviewedBy = agronomist;
    target.reviewedAt = new Date().toISOString();

    this.flushToDisk();
    return true;
  }

  /**
   * Returns storage telemetry metrics.
   */
  public getStorageMetrics() {
    this.ensureInitialized();
    return {
      totalRecords: this.buffer.length,
      disputedCount: this.buffer.filter((r) => r.feedback === 'disputed').length,
      confirmedCount: this.buffer.filter((r) => r.feedback === 'confirmed').length,
      pendingExpertTriage: this.buffer.filter((r) => r.kvkStatus === 'pending_triage').length,
      walFilePath: WAL_FILE,
      walSizeBytes: fs.existsSync(WAL_FILE) ? fs.statSync(WAL_FILE).size : 0,
    };
  }
}

// Global singleton instance
declare global {
  // eslint-disable-next-line no-var
  var __scanDatabaseEngine: ScanDatabaseEngine | undefined;
}

export const scanDb = global.__scanDatabaseEngine ?? new ScanDatabaseEngine();
if (process.env.NODE_ENV !== 'production') {
  global.__scanDatabaseEngine = scanDb;
}
