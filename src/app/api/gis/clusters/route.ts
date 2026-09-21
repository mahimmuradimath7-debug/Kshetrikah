import { NextResponse } from 'next/server';
import { computeOutbreakClusters } from '@/lib/gisClustering';
import { scanDb } from '@/lib/dbPersistence';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const crop = searchParams.get('crop') || undefined;
    const radius = searchParams.get('radius') ? parseInt(searchParams.get('radius')!, 10) : 15;
    const minIncidents = searchParams.get('min') ? parseInt(searchParams.get('min')!, 10) : 3;

    const recentScans = await scanDb.getRecentScans({ limit: 200 });

    const clusters = computeOutbreakClusters({
      crop,
      clusterRadiusKm: radius,
      minIncidents,
      recentScans,
    });


    const highAlertCount = clusters.filter((c) => c.alertLevel === 'red').length;
    const orangeAlertCount = clusters.filter((c) => c.alertLevel === 'orange').length;

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      state: 'Maharashtra',
      clustersCount: clusters.length,
      redAlerts: highAlertCount,
      orangeAlerts: orangeAlertCount,
      clusters,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
