import { NextResponse } from 'next/server';
import { diseases, diseaseMap } from '@/data/diseases';
import { diagnose, type DiagnosisInput } from '@/data/diagnosis';
import { computeWeatherRisk } from '@/data/weatherRisk';
import { buildManagementPlan } from '@/lib/managementPlan';
import {
  calculateBayesianFusion,
  type BoundingBox,
  type MultiInputFusionResult,
  type InfectionGradeInfo,
} from '@/lib/multiInputFusion';
import { mapPlantVillageToKshetrikah } from '@/lib/plantVillageBridge';
import { geminiKeyPool } from '@/lib/apiKeyPool';
import { scanRateLimiter } from '@/lib/rateLimiter';
import { sanitizeAndValidateImage } from '@/lib/security';
import { scanDb } from '@/lib/dbPersistence';
import { getScanCache, setScanCache } from '@/lib/scanPersistence';
import { predictLocalDiseaseFromDataUrl, type LocalPredictionResult } from '@/lib/localDiseaseModel';
import type {
  CropId,
  PlantPart,
  SymptomType,
  Condition,
  WeatherId,
  Disease,
  WeatherRisk,
  ManagementPlan,
  Severity,
  RiskLevel,
  CropStage,
  SoilType,
  VarietyType,
  SensorInput,
  PestTrapInput,
} from '@/data/types';

export const runtime = 'nodejs';

interface ScanRequest {
  imageDataUrl: string;
  crop: CropId;
  symptoms: SymptomType[];
  parts: PlantPart[];
  conditions: Condition[];
  weather: WeatherId | null;
  state: string | null;
  district?: string | null;
  taluka?: string | null;
  locale?: string;
  cropStage?: CropStage;
  variety?: VarietyType;
  soilType?: SoilType;
  sensorInput?: SensorInput | null;
  trapInput?: PestTrapInput | null;
  detectedBoxes?: BoundingBox[];
}

interface ScanSuccess {
  ok: true;
  scanId: string;
  result: {
    disease: Disease;
    aiConfidence: number; // 0-1
    aiReasoning: string;
    weatherRisk: WeatherRisk;
    plan: ManagementPlan;
    source: 'vision';
    severity: Severity;
    riskLevel: RiskLevel;
    followUpDays: number;
    provider?: 'nvidia' | 'gemini' | 'claude' | 'local_model' | 'edge_heuristics';
    detectedBoxes: BoundingBox[];
    infectionGrade: InfectionGradeInfo;
    fusion: MultiInputFusionResult;
    cached?: boolean;
  };
}

interface ScanFailure {
  ok: false;
  reason: 'rate_limited' | 'ai_unconfigured' | 'ai_error' | 'bad_request';
  message?: string;
  retryAfterSec?: number;
}

function normalizeBoundingBoxes(rawBoxes: unknown): BoundingBox[] {
  if (!Array.isArray(rawBoxes)) return [];
  const boxes: BoundingBox[] = [];

  for (const b of rawBoxes) {
    if (!b) continue;
    let ymin = 0,
      xmin = 0,
      ymax = 0,
      xmax = 0;
    let label = 'Pathological Lesion';

    if (Array.isArray(b) && b.length === 4) {
      [ymin, xmin, ymax, xmax] = b.map(Number);
    } else if (typeof b === 'object') {
      const item = b as Record<string, unknown>;
      if (typeof item.label === 'string' && item.label.trim().length > 0) {
        label = item.label.trim();
      }

      if (Array.isArray(item.box_2d) && item.box_2d.length === 4) {
        [ymin, xmin, ymax, xmax] = item.box_2d.map(Number);
      } else if (Array.isArray(item.bbox) && item.bbox.length === 4) {
        // [xmin, ymin, xmax, ymax]
        const [c0, c1, c2, c3] = item.bbox.map(Number);
        xmin = c0;
        ymin = c1;
        xmax = c2;
        ymax = c3;
      } else if (typeof item.ymin === 'number' && typeof item.xmin === 'number') {
        ymin = item.ymin as number;
        xmin = item.xmin as number;
        ymax = (item.ymax as number) ?? ymin + 150;
        xmax = (item.xmax as number) ?? xmin + 150;
      } else if (typeof item.top === 'number' && typeof item.left === 'number') {
        ymin = item.top as number;
        xmin = item.left as number;
        ymax = ymin + (Number(item.height) || 150);
        xmax = xmin + (Number(item.width) || 150);
      } else if (typeof item.x === 'number' && typeof item.y === 'number') {
        const xVal = Number(item.x);
        const yVal = Number(item.y);
        const wVal = Number(item.width) || 20;
        const hVal = Number(item.height) || 20;
        const scale = xVal > 100 || yVal > 100 ? 0.1 : xVal <= 1.05 && wVal <= 1.05 ? 100 : 1;

        const normX = Math.max(0, Math.min(92, xVal * scale));
        const normY = Math.max(0, Math.min(92, yVal * scale));
        const normW = Math.max(6, Math.min(100 - normX, wVal * scale));
        const normH = Math.max(6, Math.min(100 - normY, hVal * scale));

        // Reject boxes that cover the entire image
        if (normW > 85 && normH > 85) continue;

        boxes.push({
          x: Math.round(normX * 10) / 10,
          y: Math.round(normY * 10) / 10,
          width: Math.round(normW * 10) / 10,
          height: Math.round(normH * 10) / 10,
          label: label.slice(0, 36),
        });
        continue;
      } else {
        continue;
      }
    } else {
      continue;
    }

    // Determine scale: 0-1000 scale vs 0-100 percentage vs 0-1 normalized
    const maxVal = Math.max(ymin, xmin, ymax, xmax);
    let scale = 1;
    if (maxVal > 100) {
      scale = 0.1; // 0-1000 -> 0-100%
    } else if (maxVal <= 1.05 && maxVal > 0) {
      scale = 100; // 0-1 -> 0-100%
    }

    // Ensure proper ordering of min and max
    const normYmin = Math.min(ymin, ymax) * scale;
    const normYmax = Math.max(ymin, ymax) * scale;
    const normXmin = Math.min(xmin, xmax) * scale;
    const normXmax = Math.max(xmin, xmax) * scale;

    const x = Math.max(0, Math.min(92, normXmin));
    const y = Math.max(0, Math.min(92, normYmin));
    const width = Math.max(6, Math.min(100 - x, normXmax - normXmin));
    const height = Math.max(6, Math.min(100 - y, normYmax - normYmin));

    // Reject boxes that cover the entire image (>85% width and >85% height)
    if (width > 85 && height > 85) continue;

    boxes.push({
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      width: Math.round(width * 10) / 10,
      height: Math.round(height * 10) / 10,
      label: label.slice(0, 36),
    });
  }

  return boxes.slice(0, 5);
}


export async function POST(request: Request) {
  // 1. Sliding-Window Rate Limiting check
  const clientId = scanRateLimiter.getClientIdentifier(request);
  const rateCheck = scanRateLimiter.check(clientId);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'rate_limited',
        message: `High request volume. Please wait ${rateCheck.retryAfterSec}s before scanning again.`,
        retryAfterSec: rateCheck.retryAfterSec,
      } satisfies ScanFailure,
      {
        status: 429,
        headers: { 'Retry-After': String(rateCheck.retryAfterSec) },
      }
    );
  }

  // 2. Parse payload
  let body: ScanRequest;
  try {
    body = (await request.json()) as ScanRequest;
  } catch {
    return NextResponse.json(
      { ok: false, reason: 'bad_request', message: 'Invalid JSON body.' } satisfies ScanFailure,
      { status: 400 }
    );
  }

  if (!body || !body.imageDataUrl || !body.crop) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'bad_request',
        message: 'imageDataUrl and crop are required.',
      } satisfies ScanFailure,
      { status: 400 }
    );
  }

  // 3. Security, Magic Bytes & EXIF Sanitization (DPDP Act 2023)
  const imageValidation = sanitizeAndValidateImage(body.imageDataUrl);
  if (!imageValidation.valid || !imageValidation.cleanBase64) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'bad_request',
        message: imageValidation.error || 'Image validation failed.',
      } satisfies ScanFailure,
      { status: 400 }
    );
  }
  const mediaType = imageValidation.mimeType;
  const base64 = imageValidation.cleanBase64;

  // 4. In-Memory LRU Cache check (<15ms response)
  const cachedHit = getScanCache(base64);
  if (cachedHit && cachedHit.crop === body.crop) {
    const cachedDisease = diseaseMap[cachedHit.diseaseId] || diseases.find((d) => d.crop === body.crop);
    if (cachedDisease) {
      const weatherRisk = computeWeatherRisk(
        body.crop,
        cachedDisease,
        body.conditions ?? [],
        body.weather ?? null,
        {
          cropStage: body.cropStage,
          variety: body.variety,
          soilType: body.soilType,
          sensorInput: body.sensorInput,
          trapInput: body.trapInput,
        }
      );
      const plan = buildManagementPlan(cachedDisease, weatherRisk);
      const fusion = calculateBayesianFusion({
        visionConfidence: cachedHit.confidence,
        weatherRisk,
        sensorInput: body.sensorInput,
        trapInput: body.trapInput,
        crop: body.crop,
        cropStage: body.cropStage,
        soilType: body.soilType,
        conditions: body.conditions,
        detectedBoxes: cachedHit.detectedBoxes,
      });

      const scanRecord = scanDb.saveScanRecord({
        crop: body.crop,
        cropStage: body.cropStage,
        soilType: body.soilType,
        diseaseId: cachedDisease.id,
        diseaseName: cachedDisease.name,
        confidence: fusion.fusedConfidence,
        fusedScore: fusion.fusedScore,
        severity: cachedDisease.severity,
        riskLevel: fusion.riskLevel,
        provider: cachedHit.provider as 'nvidia' | 'gemini' | 'claude' | 'edge_heuristics',
        district: body.district || body.state || undefined,
        taluka: body.taluka || undefined,
      });

      return NextResponse.json(
        {
          ok: true,
          scanId: scanRecord.id,
          result: {
            disease: cachedDisease,
            aiConfidence: fusion.fusedConfidence,
            aiReasoning: `${cachedHit.reasoning} (Loaded from fast edge cache)`,
            weatherRisk,
            plan,
            source: 'vision',
            severity: cachedDisease.severity,
            riskLevel: fusion.riskLevel,
            followUpDays: plan.followUpDays,
            provider: cachedHit.provider as 'nvidia' | 'gemini' | 'claude' | 'edge_heuristics',
            detectedBoxes: cachedHit.detectedBoxes,
            infectionGrade: fusion.infectionGrade,
            fusion,
            cached: true,
          },
        } satisfies ScanSuccess,
        { status: 200 }
      );
    }
  }

  // Local fallback baseline
  const localResults = diagnose({
    crop: body.crop,
    affectedParts: body.parts ?? [],
    symptomTypes: body.symptoms ?? [],
    conditions: body.conditions ?? [],
  } satisfies DiagnosisInput);
  const topLocal = localResults[0];

  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const hasGemini = geminiKeyPool.hasKeys();
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const clientBoxes = normalizeBoundingBoxes(body.detectedBoxes);

  const localModelResult = await predictLocalDiseaseFromDataUrl(body.imageDataUrl, body.crop);
  // High-confidence local inference (>= 0.65) is served immediately
  if (localModelResult && localModelResult.confidence >= 0.65) {
    const localDisease = diseaseMap[localModelResult.diseaseId] ?? diseases.find((d) => d.id === localModelResult.diseaseId);
    if (localDisease && localDisease.crop === body.crop) {
      return buildLocalModelResponse(body, localDisease, localModelResult, clientBoxes);
    }
  }

  if (!hasGemini && !nvidiaKey && !anthropicKey) {
    if (localModelResult) {
      const localDisease = diseaseMap[localModelResult.diseaseId] ?? diseases.find((d) => d.id === localModelResult.diseaseId);
      if (localDisease && localDisease.crop === body.crop) {
        return buildLocalModelResponse(body, localDisease, localModelResult, clientBoxes);
      }
    }
    if (topLocal) {
      return buildEdgeFallbackResponse(body, topLocal);
    }
    return NextResponse.json(
      {
        ok: false,
        reason: 'ai_unconfigured',
        message: 'No AI vision key found. Add GEMINI_API_KEY or NVIDIA_API_KEY in .env.local.',
      } satisfies ScanFailure,
      { status: 503 }
    );
  }

  if (!topLocal) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'ai_error',
        message: 'No candidate disease for the selected crop — check wizard inputs.',
      } satisfies ScanFailure,
      { status: 422 }
    );
  }

  // Disease catalog for strict constraint
  const diseaseCatalog = diseases
    .filter((d) => d.crop === body.crop)
    .map((d) => ({
      id: d.id,
      name: d.name,
      pathogen: d.pathogen,
      symptoms: d.symptoms,
    }));
  const diseaseIdList = diseaseCatalog.map((d) => d.id).join(', ');

  const systemPrompt = [
    'You are क्षेत्रिकः (Kshetrikah), an expert agronomist AI computer vision diagnostic system developed by TEAM BITHEADS for the Government of Maharashtra MSInS Challenge #26131.',
    'You are inspecting crop foliage, stems, or fruit specimens submitted by Indian smallholder farmers.',
    'Your objective is commercial-grade diagnostic accuracy, bounding box lesion localization, and disease severity grading.',
    '',
    'RULES & REQUIREMENTS:',
    `1. Pick diseaseId STRICTLY from this valid catalog for crop=${body.crop}: [${diseaseIdList}].`,
    '2. TARGETED BOUNDING BOX GROUNDING ("detectedBoxes"):',
    '   - Locate 1 to 4 SPECIFIC, TIGHT visual lesions, spots, blights, boreholes, or chlorotic halos on the leaf/fruit.',
    '   - Do NOT draw a single huge box around the entire plant or image.',
    '   - Coordinates MUST be normalized integer coordinates in "box_2d": [ymin, xmin, ymax, xmax] on a 0-1000 scale (ymin=top, xmin=left, ymax=bottom, xmax=right).',
    '   - Label each box with the exact pathological hallmark (e.g., "Concentric Fungal Lesion", "Bacterial Water-soaked Spot", "Necrotic Blight Zone", "Chlorotic Margin").',
    '3. Estimate "infectionSurfacePercent" (1 to 100) based on percentage of visible foliar tissue showing chlorosis, necrosis, or lesions.',

    '',
    'KEY PATHOLOGICAL HALLMARKS FOR REFERENCE:',
    '- Cotton Pink Bollworm: Rosetted flowers, premature boll opening, double seeds, internal stained lint, boreholes with dark frass.',
    '- Cotton Bacterial Blight: Vein-bound water-soaked angular lesions turning dark reddish-brown with yellow halo, black arm on stems.',
    '- Cotton Alternaria Leaf Spot: Concentric target-board rings with yellow halo and purplish margins.',
    '- Tomato Early Blight: Concentric target-like rings surrounded by chlorotic yellow zone on older leaves.',
    '- Tomato Late Blight: Rapid olive-brown water-soaked lesions, greasy stem decay, white sporulation under moist canopy.',
    '- Tomato Leaf Curl Virus: Upward/inward curling, leaf crumpling, thickened veins, bushy stunting.',
    '- Sugarcane Red Rot: Red internal pith with white horizontal cross-bands, alcoholic fermentation aroma.',
    '- Sugarcane Smut: Black whip-like sorus curved from the central shoot.',
    '- Soybean Yellow Mosaic Virus: Bright yellow mosaic alternating with dark green patches along veins.',
    '- Rice Blast: Diamond/spindle-shaped lesions with gray center and reddish-brown margin.',
    '- Maize Fall Armyworm: Shot holes, pin-holes, ragged defoliation of whorl with copious moist frass.',
    '- Wheat Stripe Rust: Linear yellow-orange pustules arranged in parallel stripes along leaf veins.',
    '',
    'OUTPUT FORMAT:',
    'Return strictly a JSON object with this exact structure:',
    '{',
    '  "diseaseId": "string from catalog",',
    '  "confidence": number between 0.0 and 1.0,',
    '  "reasoning": "2-3 concise sentences detailing specific agronomic hallmarks observed",',
    '  "detectedBoxes": [',
    '    {',
    '      "box_2d": [ymin, xmin, ymax, xmax],',
    '      "label": "Lesion / Chlorosis / Borehole / Rust Pustule / White Sporulation"',
    '    }',
    '  ],',
    '  "infectionSurfacePercent": number between 1 and 100',
    '}',
    'Do NOT include any markdown fences or explanation outside the JSON object.',
  ].join('\n');

  const userText = [
    `Crop: ${body.crop}`,
    `Affected parts: ${(body.parts ?? []).join(', ') || 'unspecified'}`,
    `Symptoms seen: ${(body.symptoms ?? []).join(', ') || 'unspecified'}`,
    `Field conditions: ${(body.conditions ?? []).join(', ') || 'unspecified'}`,
    `Current weather: ${body.weather ?? 'unspecified'}`,
    `Region: ${body.district || body.state || 'Maharashtra'}`,
    `Crop stage: ${body.cropStage ?? 'unspecified'}`,
    `Soil type: ${body.soilType ?? 'unspecified'}`,
    'Analyze the image, locate lesions with bounding boxes, and return the closest diseaseId from catalog.',
  ].join('\n');

  // ─────────────────────────────────────────────────────────────
  // 1. GOOGLE GEMINI VISION PROVIDER (WITH KEY POOL & FAILOVER)
  // ─────────────────────────────────────────────────────────────
  if (hasGemini) {
    try {
      const poolResult = await geminiKeyPool.executeWithFailover(async (key, masked) => {
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
        const res = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemPrompt}\n\n${userText}` },
                  {
                    inline_data: {
                      mime_type: mediaType,
                      data: base64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.15,
              maxOutputTokens: 4096,
              responseMimeType: 'application/json',
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
            ],
          }),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          return { ok: false, status: res.status, data: null, errorText: errText };
        }

        const data = await res.json();
        return { ok: true, status: 200, data };
      });

      if ('data' in poolResult && poolResult.data) {
        const candidate = poolResult.data?.candidates?.[0];
        const rawContent = candidate?.content?.parts?.[0]?.text;

        if (rawContent) {
          const parsed = safeParseJson(rawContent);
          if (parsed && typeof parsed === 'object') {
            const diseaseIdCandidate = String(parsed.diseaseId || '').trim();
            const rawBoxes = parsed.detectedBoxes;
            const rawSurfacePercent =
              typeof parsed.infectionSurfacePercent === 'number'
                ? parsed.infectionSurfacePercent
                : undefined;

            let disease = diseaseMap[diseaseIdCandidate];
            if (!disease || disease.crop !== body.crop) {
              const pvMappedId = mapPlantVillageToKshetrikah(diseaseIdCandidate);
              if (pvMappedId && diseaseMap[pvMappedId]) {
                disease = diseaseMap[pvMappedId];
              }
            }

            if (!disease || disease.crop !== body.crop) {
              disease = topLocal.disease;
            }

            const aiConfidence = clamp01(
              typeof parsed.confidence === 'number' ? parsed.confidence : 0.85
            );
            const aiReasoning =
              typeof parsed.reasoning === 'string' && parsed.reasoning.trim().length > 0
                ? parsed.reasoning.trim()
                : `AI detected symptoms consistent with ${disease.name}.`;

            let detectedBoxes = normalizeBoundingBoxes(rawBoxes);
            if (detectedBoxes.length === 0 && clientBoxes.length > 0) {
              detectedBoxes = clientBoxes;
            }

            // Compute weather risk & management plan
            const weatherRisk = computeWeatherRisk(
              body.crop,
              disease,
              body.conditions ?? [],
              body.weather ?? null,
              {
                cropStage: body.cropStage,
                variety: body.variety,
                soilType: body.soilType,
                sensorInput: body.sensorInput,
                trapInput: body.trapInput,
              }
            );
            const plan = buildManagementPlan(disease, weatherRisk);

            // Bayesian Multi-Input Fusion
            const fusion = calculateBayesianFusion({
              visionConfidence: aiConfidence,
              weatherRisk,
              sensorInput: body.sensorInput,
              trapInput: body.trapInput,
              crop: body.crop,
              cropStage: body.cropStage,
              soilType: body.soilType,
              conditions: body.conditions,
              detectedBoxes,
              estimatedSurfacePercent: rawSurfacePercent,
            });

            // Cache in memory for fast lookup
            setScanCache(base64, {
              diseaseId: disease.id,
              confidence: fusion.fusedConfidence,
              reasoning: aiReasoning,
              crop: body.crop,
              detectedBoxes,
              provider: 'gemini',
            });

            // Save to persistent WAL database
            const scanRecord = scanDb.saveScanRecord({
              crop: body.crop,
              cropStage: body.cropStage,
              soilType: body.soilType,
              diseaseId: disease.id,
              diseaseName: disease.name,
              confidence: fusion.fusedConfidence,
              fusedScore: fusion.fusedScore,
              severity: disease.severity,
              riskLevel: fusion.riskLevel,
              provider: 'gemini',
              district: body.district || body.state || undefined,
              taluka: body.taluka || undefined,
            });

            return NextResponse.json(
              {
                ok: true,
                scanId: scanRecord.id,
                result: {
                  disease,
                  aiConfidence: fusion.fusedConfidence,
                  aiReasoning,
                  weatherRisk,
                  plan,
                  source: 'vision',
                  severity: disease.severity,
                  riskLevel: fusion.riskLevel,
                  followUpDays: plan.followUpDays,
                  provider: 'gemini',
                  detectedBoxes,
                  infectionGrade: fusion.infectionGrade,
                  fusion,
                },
              } satisfies ScanSuccess,
              { status: 200 }
            );
          }
        }
      }
    } catch (err) {
      console.warn('[ScanAPI] Gemini Key Pool failed, evaluating NVIDIA NIM / Claude fallback:', err);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. NVIDIA NIM ENTERPRISE VISION PROVIDER (LLAMA-3.2-11B-VISION)
  // ─────────────────────────────────────────────────────────────
  if (nvidiaKey) {
    try {
      const nvidiaBaseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
      const nvidiaModel = process.env.NVIDIA_MODEL || 'meta/llama-3.2-11b-vision-instruct';

      const nvidiaEndpoint = `${nvidiaBaseUrl.replace(/\/+$/, '')}/chat/completions`;

      const nvidiaPrompt = `${systemPrompt}\n\n${userText}\n\nStrictly return only valid JSON without markdown formatting.`;

      const nvidiaRes = await fetch(nvidiaEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${nvidiaKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: nvidiaModel,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: nvidiaPrompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mediaType};base64,${base64}`,
                  },
                },
              ],
            },
          ],
          temperature: 0.15,
          max_tokens: 2048,
        }),
      });

      if (nvidiaRes.ok) {
        const nvidiaData = await nvidiaRes.json();
        const rawContent = nvidiaData?.choices?.[0]?.message?.content;

        if (rawContent) {
          const parsed = safeParseJson(rawContent);
          if (parsed && typeof parsed === 'object') {
            const diseaseIdCandidate = String(parsed.diseaseId || '').trim();
            const rawBoxes = parsed.detectedBoxes;
            const rawSurfacePercent =
              typeof parsed.infectionSurfacePercent === 'number'
                ? parsed.infectionSurfacePercent
                : undefined;

            let disease = diseaseMap[diseaseIdCandidate];
            if (!disease || disease.crop !== body.crop) {
              const pvMappedId = mapPlantVillageToKshetrikah(diseaseIdCandidate);
              if (pvMappedId && diseaseMap[pvMappedId]) {
                disease = diseaseMap[pvMappedId];
              }
            }

            if (!disease || disease.crop !== body.crop) {
              disease = topLocal.disease;
            }

            const aiConfidence = clamp01(
              typeof parsed.confidence === 'number' ? parsed.confidence : 0.88
            );
            const aiReasoning =
              typeof parsed.reasoning === 'string' && parsed.reasoning.trim().length > 0
                ? parsed.reasoning.trim()
                : `NVIDIA NIM Vision detected hallmarks of ${disease.name}.`;

            let detectedBoxes = normalizeBoundingBoxes(rawBoxes);
            if (detectedBoxes.length === 0 && clientBoxes.length > 0) {
              detectedBoxes = clientBoxes;
            }

            const weatherRisk = computeWeatherRisk(
              body.crop,
              disease,
              body.conditions ?? [],
              body.weather ?? null,
              {
                cropStage: body.cropStage,
                variety: body.variety,
                soilType: body.soilType,
                sensorInput: body.sensorInput,
                trapInput: body.trapInput,
              }
            );
            const plan = buildManagementPlan(disease, weatherRisk);

            const fusion = calculateBayesianFusion({
              visionConfidence: aiConfidence,
              weatherRisk,
              sensorInput: body.sensorInput,
              trapInput: body.trapInput,
              crop: body.crop,
              cropStage: body.cropStage,
              soilType: body.soilType,
              conditions: body.conditions,
              detectedBoxes,
              estimatedSurfacePercent: rawSurfacePercent,
            });

            setScanCache(base64, {
              diseaseId: disease.id,
              confidence: fusion.fusedConfidence,
              reasoning: aiReasoning,
              crop: body.crop,
              detectedBoxes,
              provider: 'nvidia',
            });

            const scanRecord = scanDb.saveScanRecord({
              crop: body.crop,
              cropStage: body.cropStage,
              soilType: body.soilType,
              diseaseId: disease.id,
              diseaseName: disease.name,
              confidence: fusion.fusedConfidence,
              fusedScore: fusion.fusedScore,
              severity: disease.severity,
              riskLevel: fusion.riskLevel,
              provider: 'nvidia',
              district: body.district || body.state || undefined,
              taluka: body.taluka || undefined,
            });

            return NextResponse.json(
              {
                ok: true,
                scanId: scanRecord.id,
                result: {
                  disease,
                  aiConfidence: fusion.fusedConfidence,
                  aiReasoning,
                  weatherRisk,
                  plan,
                  source: 'vision',
                  severity: disease.severity,
                  riskLevel: fusion.riskLevel,
                  followUpDays: plan.followUpDays,
                  provider: 'nvidia',
                  detectedBoxes,
                  infectionGrade: fusion.infectionGrade,
                  fusion,
                },
              } satisfies ScanSuccess,
              { status: 200 }
            );
          }
        }
      } else {
        const errText = await nvidiaRes.text().catch(() => '');
        console.warn('[ScanAPI] NVIDIA NIM returned non-200:', nvidiaRes.status, errText.slice(0, 160));
      }
    } catch (err) {
      console.warn('[ScanAPI] NVIDIA NIM vision error:', err);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. ANTHROPIC CLAUDE 3.5 SONNET FALLBACK (IF CONFIGURED)
  // ─────────────────────────────────────────────────────────────
  if (anthropicKey) {
    try {
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mediaType,
                    data: base64,
                  },
                },
                { type: 'text', text: userText },
              ],
            },
          ],
        }),
      });

      if (claudeRes.ok) {
        const data = await claudeRes.json();
        const text = data?.content?.[0]?.text;
        const parsed = text ? safeParseJson(text) : null;

        if (parsed && typeof parsed === 'object') {
          const diseaseIdCandidate = String(parsed.diseaseId || '').trim();
          let disease = diseaseMap[diseaseIdCandidate];
          if (!disease || disease.crop !== body.crop) disease = topLocal.disease;

          const aiConfidence = clamp01(Number(parsed.confidence) || 0.85);
          const aiReasoning = String(parsed.reasoning || `Detected hallmarks of ${disease.name}`);
          let detectedBoxes = normalizeBoundingBoxes(parsed.detectedBoxes);
          if (detectedBoxes.length === 0 && clientBoxes.length > 0) {
            detectedBoxes = clientBoxes;
          }

          const weatherRisk = computeWeatherRisk(
            body.crop,
            disease,
            body.conditions ?? [],
            body.weather ?? null,
            {
              cropStage: body.cropStage,
              variety: body.variety,
              soilType: body.soilType,
              sensorInput: body.sensorInput,
              trapInput: body.trapInput,
            }
          );
          const plan = buildManagementPlan(disease, weatherRisk);
          const fusion = calculateBayesianFusion({
            visionConfidence: aiConfidence,
            weatherRisk,
            sensorInput: body.sensorInput,
            trapInput: body.trapInput,
            crop: body.crop,
            cropStage: body.cropStage,
            soilType: body.soilType,
            conditions: body.conditions,
            detectedBoxes,
          });

          const scanRecord = scanDb.saveScanRecord({
            crop: body.crop,
            cropStage: body.cropStage,
            soilType: body.soilType,
            diseaseId: disease.id,
            diseaseName: disease.name,
            confidence: fusion.fusedConfidence,
            fusedScore: fusion.fusedScore,
            severity: disease.severity,
            riskLevel: fusion.riskLevel,
            provider: 'claude',
            district: body.district || body.state || undefined,
            taluka: body.taluka || undefined,
          });

          return NextResponse.json(
            {
              ok: true,
              scanId: scanRecord.id,
              result: {
                disease,
                aiConfidence: fusion.fusedConfidence,
                aiReasoning,
                weatherRisk,
                plan,
                source: 'vision',
                severity: disease.severity,
                riskLevel: fusion.riskLevel,
                followUpDays: plan.followUpDays,
                provider: 'claude',
                detectedBoxes,
                infectionGrade: fusion.infectionGrade,
                fusion,
              },
            } satisfies ScanSuccess,
            { status: 200 }
          );
        }
      }
    } catch (err) {
      console.warn('[ScanAPI] Claude fallback failed:', err);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4. ROBUST RESILIENT EDGE BAYESIAN FALLBACK
  // ─────────────────────────────────────────────────────────────
  if (localModelResult) {
    const localDisease = diseaseMap[localModelResult.diseaseId] ?? diseases.find((d) => d.id === localModelResult.diseaseId);
    if (localDisease && localDisease.crop === body.crop) {
      return buildLocalModelResponse(body, localDisease, localModelResult, clientBoxes);
    }
  }

  return buildEdgeFallbackResponse(body, topLocal);
}

function buildLocalModelResponse(
  body: ScanRequest,
  localDisease: Disease,
  localModelResult: LocalPredictionResult,
  clientBoxes: BoundingBox[]
) {
  const detectedBoxes = localModelResult.detectedBoxes && localModelResult.detectedBoxes.length > 0
    ? localModelResult.detectedBoxes
    : clientBoxes;

  const weatherRisk = computeWeatherRisk(
    body.crop,
    localDisease,
    body.conditions ?? [],
    body.weather ?? null,
    {
      cropStage: body.cropStage,
      variety: body.variety,
      soilType: body.soilType,
      sensorInput: body.sensorInput,
      trapInput: body.trapInput,
    }
  );
  const plan = buildManagementPlan(localDisease, weatherRisk);
  const fusion = calculateBayesianFusion({
    visionConfidence: localModelResult.confidence,
    weatherRisk,
    sensorInput: body.sensorInput,
    trapInput: body.trapInput,
    crop: body.crop,
    cropStage: body.cropStage,
    soilType: body.soilType,
    conditions: body.conditions,
    detectedBoxes,
  });

  const scanRecord = scanDb.saveScanRecord({
    crop: body.crop,
    cropStage: body.cropStage,
    soilType: body.soilType,
    diseaseId: localDisease.id,
    diseaseName: localDisease.name,
    confidence: fusion.fusedConfidence,
    fusedScore: fusion.fusedScore,
    severity: localDisease.severity,
    riskLevel: fusion.riskLevel,
    provider: 'local_model',
    district: body.district || body.state || undefined,
    taluka: body.taluka || undefined,
  });

  return NextResponse.json(
    {
      ok: true,
      scanId: scanRecord.id,
      result: {
        disease: localDisease,
        aiConfidence: fusion.fusedConfidence,
        aiReasoning: `Local ResNet-50 deep learning model classified foliar specimen as ${localDisease.name} (${Math.round(localModelResult.confidence * 100)}% visual confidence) with localized pathological lesion boundaries.`,
        weatherRisk,
        plan,
        source: 'vision',
        severity: localDisease.severity,
        riskLevel: fusion.riskLevel,
        followUpDays: plan.followUpDays,
        provider: 'local_model',
        detectedBoxes,
        infectionGrade: fusion.infectionGrade,
        fusion,
      },
    } satisfies ScanSuccess,
    { status: 200 }
  );
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function safeParseJson(text: string): {
  diseaseId?: unknown;
  confidence?: unknown;
  reasoning?: unknown;
  detectedBoxes?: unknown;
  infectionSurfacePercent?: unknown;
} | null {
  const cleaned = text
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = /\{[\s\S]*\}/.exec(cleaned);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function buildEdgeFallbackResponse(
  body: ScanRequest,
  topLocal: { disease: Disease; score: number }
) {
  const disease = topLocal.disease;
  const clientBoxes = normalizeBoundingBoxes(body.detectedBoxes);
  const weatherRisk = computeWeatherRisk(
    body.crop,
    disease,
    body.conditions ?? [],
    body.weather ?? null,
    {
      cropStage: body.cropStage,
      variety: body.variety,
      soilType: body.soilType,
      sensorInput: body.sensorInput,
      trapInput: body.trapInput,
    }
  );
  const plan = buildManagementPlan(disease, weatherRisk);
  const fusion = calculateBayesianFusion({
    visionConfidence: topLocal.score,
    weatherRisk,
    sensorInput: body.sensorInput,
    trapInput: body.trapInput,
    crop: body.crop,
    cropStage: body.cropStage,
    soilType: body.soilType,
    conditions: body.conditions,
    detectedBoxes: clientBoxes,
  });

  const scanRecord = scanDb.saveScanRecord({
    crop: body.crop,
    cropStage: body.cropStage,
    soilType: body.soilType,
    diseaseId: disease.id,
    diseaseName: disease.name,
    confidence: fusion.fusedConfidence,
    fusedScore: fusion.fusedScore,
    severity: disease.severity,
    riskLevel: fusion.riskLevel,
    provider: 'edge_heuristics',
    district: body.district || body.state || undefined,
    taluka: body.taluka || undefined,
  });

  return NextResponse.json(
    {
      ok: true,
      scanId: scanRecord.id,
      result: {
        disease,
        aiConfidence: fusion.fusedConfidence,
        aiReasoning: `Resilient edge multi-input Bayesian fusion mapped observed field conditions and microclimate telemetry to ${disease.name}.`,
        weatherRisk,
        plan,
        source: 'vision',
        severity: disease.severity,
        riskLevel: fusion.riskLevel,
        followUpDays: plan.followUpDays,
        provider: 'edge_heuristics',
        detectedBoxes: clientBoxes,
        infectionGrade: fusion.infectionGrade,
        fusion,
      },
    } satisfies ScanSuccess,
    { status: 200 }
  );
}
