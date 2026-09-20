import { NextResponse } from 'next/server';
import {
  recommendCropForSoil,
  recommendFertilizerForField,
  type CropRecommendationInput,
  type FertilizerRecommendationInput,
} from '@/lib/agriDatasets';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    let type = String(body.type ?? body.action ?? '').toLowerCase();
    
    // Auto-detect type if omitted
    if (!type) {
      if (body.cropType || body.soilType || body.moisture !== undefined) {
        type = 'fertilizer';
      } else {
        type = 'crop';
      }
    }

    if (type === 'crop') {
      const payload = body as Record<string, unknown>;
      const result = recommendCropForSoil({
        nitrogen: Number(payload.nitrogen ?? payload.N ?? 0),
        phosphorus: Number(payload.phosphorus ?? payload.P ?? payload.phosphorous ?? 0),
        potassium: Number(payload.potassium ?? payload.K ?? 0),
        temperature: Number(payload.temperature ?? 0),
        humidity: Number(payload.humidity ?? 0),
        ph: Number(payload.ph ?? 0),
        rainfall: Number(payload.rainfall ?? 0),
      });

      return NextResponse.json({ ok: true, result });
    }

    if (type === 'fertilizer' || type === 'fertiliser') {
      const payload = body as Record<string, unknown>;
      const result = recommendFertilizerForField({
        temperature: Number(payload.temperature ?? 0),
        humidity: Number(payload.humidity ?? 0),
        moisture: Number(payload.moisture ?? 0),
        soilType: String(payload.soilType ?? ''),
        cropType: String(payload.cropType ?? ''),
        nitrogen: Number(payload.nitrogen ?? payload.N ?? 0),
        potassium: Number(payload.potassium ?? payload.K ?? 0),
        phosphorous: Number(payload.phosphorous ?? payload.phosphorus ?? payload.P ?? 0),
      });

      return NextResponse.json({ ok: true, result });
    }

    return NextResponse.json(
      {
        ok: false,
        error: 'Unsupported recommendation type. Use "crop" or "fertilizer".',
      },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to recommend from dataset.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    supportedTypes: ['crop', 'fertilizer'],
    note: 'Use POST with { type: "crop" } or { type: "fertilizer" } and the corresponding field values.',
  });
}
