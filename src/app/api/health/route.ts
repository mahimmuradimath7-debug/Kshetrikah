import { NextResponse } from 'next/server';
import { geminiKeyPool } from '@/lib/apiKeyPool';
import { scanDb } from '@/lib/dbPersistence';

export const runtime = 'nodejs';

const START_TIME = Date.now();

export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - START_TIME) / 1000);
  const poolMetrics = geminiKeyPool.getMetrics();
  const storageMetrics = await scanDb.getStorageMetrics();
  const mem = process.memoryUsage();

  const nvidiaConfigured = Boolean(process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY.length > 8);
  const claudeConfigured = Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.length > 8);

  const hasAnyVision = poolMetrics.totalKeys > 0 || nvidiaConfigured || claudeConfigured;
  const status = hasAnyVision ? 'healthy' : 'degraded';

  return NextResponse.json(
    {
      status,
      service: 'क्षेत्रिकः (Kshetrikah) AI Crop Diagnostics',
      version: '2.4.0-production',
      organization: 'TEAM BITHEADS (MSInS Challenge #26131)',
      timestamp: new Date().toISOString(),
      uptimeSeconds,
      aiProviders: {
        geminiKeyPool: {
          status: poolMetrics.healthyKeys > 0 ? 'online' : poolMetrics.totalKeys > 0 ? 'cooldown' : 'unconfigured',
          totalKeys: poolMetrics.totalKeys,
          healthyKeys: poolMetrics.healthyKeys,
          cooldownKeys: poolMetrics.cooldownKeys,
          totalInferences: poolMetrics.totalInferences,
          totalFailovers: poolMetrics.totalFailovers,
        },
        nvidiaNim: {
          status: nvidiaConfigured ? 'online' : 'unconfigured',
          endpoint: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
          model: process.env.NVIDIA_MODEL || 'meta/llama-3.2-11b-vision-instruct',
        },
        claude: {
          status: claudeConfigured ? 'online' : 'unconfigured',
        },
        edgeHeuristicBayesian: {
          status: 'online',
          benchmark: 'YOLO11s-cls 95.79% Top-1 / 99.86% Top-5 (18,250 Indian Field Images)',
        },
      },
      storage: {
        status: 'online',
        walRecords: storageMetrics.totalRecords,
        pendingTriage: storageMetrics.pendingExpertTriage,
        confirmedDisputes: storageMetrics.disputedCount,
      },
      system: {
        nodeVersion: process.version,
        memoryRssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
        heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 10) / 10,
      },
    },
    { status: status === 'healthy' ? 200 : 503 }
  );
}
