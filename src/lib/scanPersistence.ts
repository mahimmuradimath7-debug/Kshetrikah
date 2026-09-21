import { supabase } from './supabase';
import type { CropId, Disease, ManagementPlan, WeatherRisk, RiskLevel } from '@/data/types';
import type { BoundingBox, MultiInputFusionResult } from './multiInputFusion';

export interface StoredScanRecord {
  id: string;
  timestamp: string;
  crop: CropId;
  diseaseId: string;
  diseaseName: string;
  pathogen: string;
  confidence: number;
  fusedScore: number;
  infectionGrade: 1 | 2 | 3;
  infectionGradeLabel: string;
  riskLevel: RiskLevel;
  thumbnailUrl?: string;
  reasoning: string;
  provider: 'gemini' | 'claude' | 'edge_heuristics';
  detectedBoxes?: BoundingBox[];
  userFeedback?: 'confirmed' | 'disputed' | 'monitoring' | null;
  farmerNotes?: string;
}

export interface CachedScanResult {
  disease: Disease;
  aiConfidence: number;
  aiReasoning: string;
  weatherRisk: WeatherRisk;
  plan: ManagementPlan;
  source: 'vision';
  provider: 'gemini' | 'claude' | 'edge_heuristics';
  detectedBoxes?: BoundingBox[];
  infectionGrade?: {
    grade: 1 | 2 | 3;
    label: string;
    surfacePercent: number;
  };
  fusion?: MultiInputFusionResult;
  timestamp: number;
}

const STORAGE_KEY = 'kshetrikah_scan_history_v1';
const MEMORY_CACHE = new Map<string, CachedScanResult>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes in-memory cache

/**
 * Fast string hash for image payload to recognize repeated submissions.
 */
export function computeImageHash(str: string): string {
  let hash = 5381;
  // Sample up to 2000 chars across the string for rapid hashing
  const len = str.length;
  const step = Math.max(1, Math.floor(len / 2000));
  for (let i = 0; i < len; i += step) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0x7fffffff;
  }
  return `hash_${hash.toString(16)}_${len}`;
}

/**
 * Check if a scan result is cached for this image hash.
 */
export function getCachedScan(hashKey: string): CachedScanResult | null {
  const cached = MEMORY_CACHE.get(hashKey);
  if (cached) {
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached;
    }
    MEMORY_CACHE.delete(hashKey);
  }
  return null;
}

/**
 * Store scan result in rapid memory cache.
 */
export function setCachedScan(hashKey: string, result: Omit<CachedScanResult, 'timestamp'>): void {
  // Prune if too large
  if (MEMORY_CACHE.size > 50) {
    const firstKey = MEMORY_CACHE.keys().next().value;
    if (firstKey) MEMORY_CACHE.delete(firstKey);
  }
  MEMORY_CACHE.set(hashKey, {
    ...result,
    timestamp: Date.now(),
  });
}

export interface SimplifiedCacheEntry {
  diseaseId: string;
  confidence: number;
  reasoning: string;
  crop: CropId;
  detectedBoxes: BoundingBox[];
  provider: string;
}

const RAW_SCAN_CACHE = new Map<string, SimplifiedCacheEntry & { timestamp: number }>();

export function getScanCache(base64: string): SimplifiedCacheEntry | null {
  const hash = computeImageHash(base64);
  const entry = RAW_SCAN_CACHE.get(hash);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    RAW_SCAN_CACHE.delete(hash);
    return null;
  }
  return entry;
}

export function setScanCache(base64: string, data: SimplifiedCacheEntry): void {
  const hash = computeImageHash(base64);
  if (RAW_SCAN_CACHE.size > 100) {
    const first = RAW_SCAN_CACHE.keys().next().value;
    if (first) RAW_SCAN_CACHE.delete(first);
  }
  RAW_SCAN_CACHE.set(hash, {
    ...data,
    timestamp: Date.now(),
  });
}

// ─── Supabase-backed scan history ─────────────────────────────────────────────

/**
 * Retrieve persistent scan history from Supabase.
 * Falls back to localStorage if running server-side or if Supabase is unavailable.
 */
export async function getScanHistory(): Promise<StoredScanRecord[]> {
  try {
    const { data, error } = await supabase
      .from('scan_records')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) throw error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((row: any): StoredScanRecord => ({
      id: row.id,
      timestamp: row.timestamp,
      crop: row.crop as CropId,
      diseaseId: row.disease_id,
      diseaseName: row.disease_name,
      pathogen: row.pathogen ?? '',
      confidence: row.confidence,
      fusedScore: row.fused_score,
      infectionGrade: (row.infection_grade ?? 1) as 1 | 2 | 3,
      infectionGradeLabel: row.infection_grade_label ?? '',
      riskLevel: row.risk_level as RiskLevel,
      thumbnailUrl: row.thumbnail_url ?? undefined,
      reasoning: row.reasoning ?? '',
      provider: (row.provider ?? 'edge_heuristics') as StoredScanRecord['provider'],
      detectedBoxes: row.detected_boxes ?? undefined,
      userFeedback: row.feedback === 'unreviewed' ? null : (row.feedback as StoredScanRecord['userFeedback']),
      farmerNotes: row.dispute_reason ?? undefined,
    }));
  } catch (err) {
    console.warn('[scanPersistence] Supabase getScanHistory failed, using localStorage:', err);
    return getScanHistoryLocal();
  }
}

/**
 * Save a new scan record to Supabase (with localStorage fallback).
 */
export async function saveScanRecord(record: StoredScanRecord): Promise<void> {
  // Always persist locally for instant UI
  saveScanRecordLocal(record);

  try {
    const { error } = await supabase.from('scan_records').upsert(
      {
        id: record.id,
        timestamp: record.timestamp,
        crop: record.crop,
        disease_id: record.diseaseId,
        disease_name: record.diseaseName,
        confidence: record.confidence,
        fused_score: record.fusedScore,
        severity: 'moderate', // default — updated by caller via dbPersistence if needed
        risk_level: record.riskLevel,
        provider: record.provider,
        feedback: record.userFeedback ?? 'unreviewed',
        kvk_status: 'none',
      },
      { onConflict: 'id' }
    );

    if (error) throw error;
  } catch (err) {
    console.warn('[scanPersistence] Supabase saveScanRecord failed (saved locally):', err);
  }
}

/**
 * Update farmer feedback on a recorded scan for active learning / KVK follow-up.
 */
export async function updateScanFeedback(
  id: string,
  feedback: 'confirmed' | 'disputed' | 'monitoring',
  notes?: string
): Promise<void> {
  // Update localStorage immediately for fast UI
  updateScanFeedbackLocal(id, feedback, notes);

  try {
    const updates: Record<string, string> = { feedback };
    if (feedback === 'disputed') {
      updates.kvk_status = 'pending_triage';
      if (notes) updates.dispute_reason = notes;
    }

    const { error } = await supabase.from('scan_records').update(updates).eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.warn('[scanPersistence] Supabase updateScanFeedback failed (updated locally):', err);
  }
}

// ─── localStorage fallback helpers ───────────────────────────────────────────

function getScanHistoryLocal(): StoredScanRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredScanRecord[];
  } catch {
    return [];
  }
}

function saveScanRecordLocal(record: StoredScanRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getScanHistoryLocal().filter((r) => r.id !== record.id);
    history.unshift(record);
    if (history.length > 50) history.pop();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    console.warn('Could not persist scan record locally:', err);
  }
}

function updateScanFeedbackLocal(
  id: string,
  feedback: 'confirmed' | 'disputed' | 'monitoring',
  notes?: string
): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getScanHistoryLocal();
    const target = history.find((r) => r.id === id);
    if (target) {
      target.userFeedback = feedback;
      if (notes !== undefined) target.farmerNotes = notes;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  } catch (err) {
    console.warn('Could not update scan feedback locally:', err);
  }
}
