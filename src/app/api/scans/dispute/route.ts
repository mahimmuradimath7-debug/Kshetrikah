import { NextResponse } from 'next/server';
import { scanDb } from '@/lib/dbPersistence';
import { sanitizeString } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const scanId = sanitizeString(body?.scanId || '', 64);
    const reason = sanitizeString(body?.reason || 'Farmer requested agronomist review.', 500);
    const farmerName = sanitizeString(body?.farmerName || 'Kisan Bandhu', 100);
    const farmerContact = sanitizeString(body?.farmerContact || '', 30);

    if (!scanId) {
      return NextResponse.json({ ok: false, error: 'scanId is required' }, { status: 400 });
    }

    const updated = scanDb.recordScanDispute(scanId, reason, {
      name: farmerName,
      contact: farmerContact,
    });

    return NextResponse.json({
      ok: true,
      escalated: true,
      ticketId: scanId,
      status: 'pending_triage',
      message:
        'Your case has been escalated to the Maharashtra KVK Agronomist network. A district specialist will review the foliar symptoms.',
      record: updated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
