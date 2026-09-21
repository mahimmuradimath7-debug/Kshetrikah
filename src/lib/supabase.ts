/**
 * KSHETRIKAH (क्षेत्रिकः) — Supabase Client
 * Government of Maharashtra MSInS Challenge #26131
 * Developed by TEAM BITHEADS
 *
 * Singleton Supabase client shared across browser and server (Next.js).
 * Uses the public anon key — Row-Level Security on Supabase controls access.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Scans are fully anonymous — no user sessions needed
    persistSession: false,
    autoRefreshToken: false,
  },
});

// ─── Database row type (snake_case, mirrors the SQL schema) ──────────────────

export interface ScanRow {
  id: string;
  created_at?: string;
  timestamp: string;
  crop: string;
  crop_stage?: string | null;
  soil_type?: string | null;
  disease_id: string;
  disease_name: string;
  confidence: number;
  fused_score: number;
  severity: string;
  risk_level: string;
  provider: string;
  district?: string | null;
  taluka?: string | null;
  lat?: number | null;
  lng?: number | null;
  feedback: string;
  dispute_reason?: string | null;
  farmer_contact?: string | null;
  farmer_name?: string | null;
  kvk_status: string;
  agronomist_advice?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
}
