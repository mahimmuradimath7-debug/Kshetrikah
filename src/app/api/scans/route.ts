import { NextResponse } from 'next/server';
import { scanDb, type PersistentScanRecord } from '@/lib/dbPersistence';
import type { Severity } from '@/data/types';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const crop = searchParams.get('crop') || undefined;
    const district = searchParams.get('district') || undefined;
    const severity = (searchParams.get('severity') as Severity) || undefined;
    const kvkStatus = searchParams.get('kvkStatus') || undefined;
    const feedback = searchParams.get('feedback') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const [scans, metrics] = await Promise.all([
      scanDb.getRecentScans({
        crop,
        district,
        severity,
        kvkStatus,
        feedback,
        limit,
      }),
      scanDb.getStorageMetrics(),
    ]);

    return NextResponse.json({
      ok: true,
      count: scans.length,
      metrics,
      scans,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
    }

    // Support batch sync of offline queued scans
    if (Array.isArray(body.scans)) {
      const saved: PersistentScanRecord[] = [];
      for (const item of body.scans) {
        if (item.crop && item.diseaseId) {
          const record = await scanDb.saveScanRecord(item);
          saved.push(record);
        }
      }
      return NextResponse.json({ ok: true, synced: saved.length, records: saved });
    }

    // Single record save
    if (!body.crop || !body.diseaseId) {
      return NextResponse.json(
        { ok: false, error: 'crop and diseaseId are required' },
        { status: 400 }
      );
    }

    const record = await scanDb.saveScanRecord(body);
    return NextResponse.json({ ok: true, record }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
