import { NextResponse } from 'next/server';
import { scanDb } from '@/lib/dbPersistence';
import { sanitizeString } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const scanId = sanitizeString(body?.scanId || '', 64);
    const feedback = body?.feedback;
    const note = sanitizeString(body?.note || '', 500);

    if (!scanId || (feedback !== 'confirmed' && feedback !== 'disputed')) {
      return NextResponse.json(
        { ok: false, error: 'scanId and valid feedback (confirmed/disputed) are required' },
        { status: 400 }
      );
    }

    const success = scanDb.recordScanFeedback(scanId, feedback, note);

    return NextResponse.json({
      ok: true,
      updated: success,
      message: success
        ? feedback === 'confirmed'
          ? 'Ground-truth confirmation logged to active learning repository'
          : 'Diagnosis disputed and automatically escalated to KVK agronomist triage'
        : 'Scan record not found in active logbook, but feedback noted',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
