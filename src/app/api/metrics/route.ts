import { NextResponse } from 'next/server';
import { geminiKeyPool } from '@/lib/apiKeyPool';
import { scanDb } from '@/lib/dbPersistence';
import { computeOutbreakClusters } from '@/lib/gisClustering';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  const pool = geminiKeyPool.getMetrics();
  const db = scanDb.getStorageMetrics();
  const clusters = computeOutbreakClusters({ recentScans: scanDb.getRecentScans({ limit: 200 }) });
  const mem = process.memoryUsage();


  if (format === 'prometheus') {
    const text = [
      '# HELP kshetrikah_scans_total Total scans recorded in WAL',
      '# TYPE kshetrikah_scans_total counter',
      `kshetrikah_scans_total ${db.totalRecords}`,
      '',
      '# HELP kshetrikah_scans_disputed Total scans disputed by farmers',
      '# TYPE kshetrikah_scans_disputed counter',
      `kshetrikah_scans_disputed ${db.disputedCount}`,
      '',
      '# HELP kshetrikah_gemini_keys_healthy Number of healthy keys in pool',
      '# TYPE kshetrikah_gemini_keys_healthy gauge',
      `kshetrikah_gemini_keys_healthy ${pool.healthyKeys}`,
      '',
      '# HELP kshetrikah_gemini_keys_cooldown Number of keys in rate-limit cooldown',
      '# TYPE kshetrikah_gemini_keys_cooldown gauge',
      `kshetrikah_gemini_keys_cooldown ${pool.cooldownKeys}`,
      '',
      '# HELP kshetrikah_gemini_failovers_total Total key failover events',
      '# TYPE kshetrikah_gemini_failovers_total counter',
      `kshetrikah_gemini_failovers_total ${pool.totalFailovers}`,
      '',
      '# HELP kshetrikah_active_outbreak_clusters Number of active epidemic outbreak clusters',
      '# TYPE kshetrikah_active_outbreak_clusters gauge',
      `kshetrikah_active_outbreak_clusters ${clusters.length}`,
      '',
      '# HELP kshetrikah_memory_rss_bytes Node RSS memory in bytes',
      '# TYPE kshetrikah_memory_rss_bytes gauge',
      `kshetrikah_memory_rss_bytes ${mem.rss}`,
    ].join('\n');

    return new NextResponse(text, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; version=0.0.4; charset=utf-8' },
    });
  }

  return NextResponse.json({
    metrics: {
      totalScansRecorded: db.totalRecords,
      totalScansDisputed: db.disputedCount,
      totalScansConfirmed: db.confirmedCount,
      pendingExpertTriage: db.pendingExpertTriage,
      geminiPool: pool,
      activeEpidemicClusters: clusters.length,
      redAlertClusters: clusters.filter((c) => c.alertLevel === 'red').length,
      memory: {
        rssMb: Math.round(mem.rss / 1024 / 1024),
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      },
    },
  });
}
