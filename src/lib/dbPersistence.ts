/**
 * KSHETRIKAH (क्षेत्रिकः) — Production Scan Persistence via Supabase
 * Government of Maharashtra MSInS Challenge #26131
 * Developed by TEAM BITHEADS
 *
 * All scan records are stored in the `scan_records` table on Supabase (PostgreSQL).
 * The exported async API is a drop-in replacement for the previous file-system WAL engine.
 *
 * Table schema (run once in Supabase SQL editor):
 * ─────────────────────────────────────────────────────────────────────────────
 * create table if not exists public.scan_records (
 *   id              text primary key,
 *   created_at      timestamptz not null default now(),
 *   timestamp       timestamptz not null,
 *   crop            text not null,
 *   crop_stage      text,
 *   soil_type       text,
 *   disease_id      text not null,
 *   disease_name    text not null,
 *   confidence      float8 not null,
 *   fused_score     float8 not null,
 *   severity        text not null,
 *   risk_level      text not null,
 *   provider        text not null,
 *   district        text,
 *   taluka          text,
 *   lat             float8,
 *   lng             float8,
 *   feedback        text not null default 'unreviewed',
 *   dispute_reason  text,
 *   farmer_contact  text,
 *   farmer_name     text,
 *   kvk_status      text not null default 'none',
 *   agronomist_advice text,
 *   reviewed_by     text,
 *   reviewed_at     timestamptz
 * );
 *
 * alter table public.scan_records enable row level security;
 * create policy "anon read"   on public.scan_records for select using (true);
 * create policy "anon insert" on public.scan_records for insert with check (true);
 * create policy "anon update" on public.scan_records for update using (true) with check (true);
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { supabase, type ScanRow } from './supabase';
import type { CropId, CropStage, SoilType, Severity, RiskLevel } from '@/data/types';

// ─── Public-facing record type (camelCase) ────────────────────────────────────

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

// ─── Conversion helpers ───────────────────────────────────────────────────────

function toRow(r: PersistentScanRecord): ScanRow {
  return {
    id: r.id,
    timestamp: r.timestamp,
    crop: r.crop,
    crop_stage: r.cropStage ?? null,
    soil_type: r.soilType ?? null,
    disease_id: r.diseaseId,
    disease_name: r.diseaseName,
    confidence: r.confidence,
    fused_score: r.fusedScore,
    severity: r.severity,
    risk_level: r.riskLevel,
    provider: r.provider,
    district: r.district ?? null,
    taluka: r.taluka ?? null,
    lat: r.lat ?? null,
    lng: r.lng ?? null,
    feedback: r.feedback,
    dispute_reason: r.disputeReason ?? null,
    farmer_contact: r.farmerContact ?? null,
    farmer_name: r.farmerName ?? null,
    kvk_status: r.kvkStatus,
    agronomist_advice: r.agronomistAdvice ?? null,
    reviewed_by: r.reviewedBy ?? null,
    reviewed_at: r.reviewedAt ?? null,
  };
}

function fromRow(row: ScanRow): PersistentScanRecord {
  return {
    id: row.id,
    timestamp: row.timestamp,
    crop: row.crop as CropId,
    cropStage: (row.crop_stage ?? undefined) as CropStage | undefined,
    soilType: (row.soil_type ?? undefined) as SoilType | undefined,
    diseaseId: row.disease_id,
    diseaseName: row.disease_name,
    confidence: row.confidence,
    fusedScore: row.fused_score,
    severity: row.severity as Severity,
    riskLevel: row.risk_level as RiskLevel,
    provider: row.provider as PersistentScanRecord['provider'],
    district: row.district ?? undefined,
    taluka: row.taluka ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    feedback: row.feedback as PersistentScanRecord['feedback'],
    disputeReason: row.dispute_reason ?? undefined,
    farmerContact: row.farmer_contact ?? undefined,
    farmerName: row.farmer_name ?? undefined,
    kvkStatus: row.kvk_status as PersistentScanRecord['kvkStatus'],
    agronomistAdvice: row.agronomist_advice ?? undefined,
    reviewedBy: row.reviewed_by ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Records a new scan to Supabase.
 * Automatically routes low-confidence scans (< 0.70) to KVK triage.
 */
export async function saveScanRecord(
  record: Omit<PersistentScanRecord, 'id' | 'timestamp' | 'feedback' | 'kvkStatus'> &
    Partial<Pick<PersistentScanRecord, 'id' | 'timestamp' | 'feedback' | 'kvkStatus'>>
): Promise<PersistentScanRecord> {
  const id = record.id || `KSH-SCAN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const timestamp = record.timestamp || new Date().toISOString();
  const confidence = record.confidence ?? 0.85;
  const kvkStatus: PersistentScanRecord['kvkStatus'] =
    record.kvkStatus || (confidence < 0.70 ? 'pending_triage' : 'none');

  const fullRecord: PersistentScanRecord = {
    ...record,
    id,
    timestamp,
    confidence,
    feedback: record.feedback || 'unreviewed',
    kvkStatus,
  };

  const { error } = await supabase
    .from('scan_records')
    .upsert(toRow(fullRecord), { onConflict: 'id' });

  if (error) {
    console.error('[dbPersistence] saveScanRecord error:', error.message);
    throw error;
  }

  return fullRecord;
}

/**
 * Retrieves recent scans with optional filtering.
 */
export async function getRecentScans(filters?: {
  crop?: string;
  district?: string;
  severity?: Severity | 'all' | string;
  kvkStatus?: string;
  feedback?: string;
  limit?: number;
}): Promise<PersistentScanRecord[]> {
  let query = supabase
    .from('scan_records')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(filters?.limit ?? 50);

  if (filters?.crop && filters.crop !== 'all') {
    query = query.eq('crop', filters.crop);
  }
  if (filters?.district && filters.district !== 'all') {
    query = query.eq('district', filters.district);
  }
  if (filters?.severity && filters.severity !== 'all') {
    query = query.eq('severity', filters.severity);
  }
  if (filters?.kvkStatus && filters.kvkStatus !== 'all') {
    query = query.eq('kvk_status', filters.kvkStatus);
  }
  if (filters?.feedback && filters.feedback !== 'all') {
    query = query.eq('feedback', filters.feedback);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[dbPersistence] getRecentScans error:', error.message);
    return [];
  }

  return (data as ScanRow[]).map(fromRow);
}

/**
 * Returns a single scan by ID.
 */
export async function getScanById(id: string): Promise<PersistentScanRecord | null> {
  const { data, error } = await supabase
    .from('scan_records')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[dbPersistence] getScanById error:', error.message);
    return null;
  }

  return data ? fromRow(data as ScanRow) : null;
}

/**
 * Updates farmer feedback for active learning (confirm / dispute).
 */
export async function recordScanFeedback(
  id: string,
  feedback: 'confirmed' | 'disputed',
  note?: string
): Promise<boolean> {
  const updates: Partial<ScanRow> = { feedback };
  if (feedback === 'disputed') {
    updates.kvk_status = 'pending_triage';
    if (note) updates.dispute_reason = note;
  }

  const { error } = await supabase
    .from('scan_records')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('[dbPersistence] recordScanFeedback error:', error.message);
    return false;
  }

  return true;
}

/**
 * Creates an agronomist dispute ticket and routes to Expert Triage board.
 */
export async function recordScanDispute(
  id: string,
  reason: string,
  farmerInfo?: { name?: string; contact?: string }
): Promise<PersistentScanRecord | null> {
  const updates: Partial<ScanRow> = {
    feedback: 'disputed',
    dispute_reason: reason,
    kvk_status: 'pending_triage',
    farmer_name: farmerInfo?.name ?? null,
    farmer_contact: farmerInfo?.contact ?? null,
  };

  const { data, error } = await supabase
    .from('scan_records')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('[dbPersistence] recordScanDispute error:', error.message);
    return null;
  }

  return data ? fromRow(data as ScanRow) : null;
}

/**
 * Returns all records queued for KVK Agronomist triage.
 */
export async function getExpertReviewQueue(): Promise<PersistentScanRecord[]> {
  const { data, error } = await supabase
    .from('scan_records')
    .select('*')
    .or('kvk_status.eq.pending_triage,feedback.eq.disputed')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('[dbPersistence] getExpertReviewQueue error:', error.message);
    return [];
  }

  return (data as ScanRow[]).map(fromRow);
}

/**
 * Updates agronomist review verdict on a disputed / triaged scan.
 */
export async function updateKvkStatus(
  id: string,
  status: 'reviewed' | 'lab_referred',
  advice: string,
  agronomist: string
): Promise<boolean> {
  const { error } = await supabase
    .from('scan_records')
    .update({
      kvk_status: status,
      agronomist_advice: advice,
      reviewed_by: agronomist,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('[dbPersistence] updateKvkStatus error:', error.message);
    return false;
  }

  return true;
}

/**
 * Returns storage telemetry metrics from Supabase.
 */
export async function getStorageMetrics(): Promise<{
  totalRecords: number;
  disputedCount: number;
  confirmedCount: number;
  pendingExpertTriage: number;
  source: 'supabase';
}> {
  const [total, disputed, confirmed, pending] = await Promise.all([
    supabase.from('scan_records').select('id', { count: 'exact', head: true }),
    supabase.from('scan_records').select('id', { count: 'exact', head: true }).eq('feedback', 'disputed'),
    supabase.from('scan_records').select('id', { count: 'exact', head: true }).eq('feedback', 'confirmed'),
    supabase.from('scan_records').select('id', { count: 'exact', head: true }).eq('kvk_status', 'pending_triage'),
  ]);

  return {
    totalRecords: total.count ?? 0,
    disputedCount: disputed.count ?? 0,
    confirmedCount: confirmed.count ?? 0,
    pendingExpertTriage: pending.count ?? 0,
    source: 'supabase',
  };
}

// ─── Legacy singleton shim (for any code referencing `scanDb.xxx`) ────────────
// Wraps the async functions behind a compatible object shape.

export const scanDb = {
  saveScanRecord,
  getRecentScans,
  getScanById,
  recordScanFeedback,
  recordScanDispute,
  getExpertReviewQueue,
  updateKvkStatus,
  getStorageMetrics,
};
