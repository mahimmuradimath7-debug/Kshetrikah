import type {
  CropId,
  CropStage,
  SoilType,
  WeatherRisk,
  PestTrapInput,
  SensorInput,
  RiskLevel,
  WeatherId,
  Condition,
} from '@/data/types';
import { evaluateAgronomicPriors, type PriorEvaluationResult } from './agronomicPriors';

export interface BoundingBox {
  x: number; // 0 - 100%
  y: number; // 0 - 100%
  width: number; // 0 - 100%
  height: number; // 0 - 100%
  label: string;
  confidence?: number;
}

export interface InfectionGradeInfo {
  grade: 1 | 2 | 3;
  label: string;
  badgeColor: string;
  surfacePercent: number;
  actionProtocol: string;
  primaryRecommendation: string;
}

export interface FusionFactorBreakdown {
  id: 'vision' | 'weather' | 'trap' | 'phenology' | 'soil';
  name: string;
  weight: number; // e.g. 0.40
  rawScore: number; // 0 - 1
  weightedScore: number;
  description: string;
}

export interface MultiInputFusionResult {
  fusedScore: number; // 0 - 1
  fusedConfidence: number; // 0 - 1
  riskLevel: RiskLevel;
  infectionGrade: InfectionGradeInfo;
  breakdown: FusionFactorBreakdown[];
  protocolSummary: string;
  reasons: string[];
  agronomicPriors?: PriorEvaluationResult;
}

/**
 * Determine dynamic infection severity grade based on percentage of leaf or canopy area affected.
 * Follows ICAR & State Agricultural Universities disease severity rating scale.
 */
export function calculateInfectionGrade(surfacePercent: number): InfectionGradeInfo {
  const clamped = Math.max(0, Math.min(100, Math.round(surfacePercent * 10) / 10));

  if (clamped < 5) {
    return {
      grade: 1,
      label: 'Grade 1 (Mild / Early)',
      badgeColor: 'emerald',
      surfacePercent: clamped,
      actionProtocol: 'Eco-Friendly Biocontrol & Cultural Sanitation',
      primaryRecommendation:
        'Infection is in initial localized phase (<5% leaf surface). Prioritize non-chemical biocontrol (Trichoderma viride / Neem Azadirachtin 10,000 ppm) to prevent secondary sporulation without chemical residue.',
    };
  }

  if (clamped <= 20) {
    return {
      grade: 2,
      label: 'Grade 2 (Moderate)',
      badgeColor: 'amber',
      surfacePercent: clamped,
      actionProtocol: 'Targeted Spot Treatment & Barrier Pruning',
      primaryRecommendation:
        'Active disease spread detected (5% - 20% leaf surface). Prune severely infected lower leaves, install yellow/blue sticky traps, and execute targeted spot application of approved protective formulation.',
    };
  }

  return {
    grade: 3,
    label: 'Grade 3 (Severe / Critical)',
    badgeColor: 'rose',
    surfacePercent: clamped,
    actionProtocol: 'Immediate Systemic Intervention & Strict PHI Monitoring',
    primaryRecommendation:
      'Critical canopy damage (>20% leaf surface). Immediate CIBRC-approved systemic treatment required within 24-48 hours. Enforce strict Pre-Harvest Interval (PHI) waiting periods and establish containment perimeter.',
  };
}

/**
 * Stage vulnerability mapping across crops based on agronomic susceptibility.
 */
function getStageVulnerability(crop?: CropId | null, stage?: CropStage | null): number {
  if (!stage) return 0.5;

  switch (stage) {
    case 'flowering':
    case 'fruiting':
      // Highly vulnerable to borer pests, fruit rot, blights
      return 0.85;
    case 'vegetative':
      return 0.55;
    case 'nursery':
      return 0.7; // susceptible to damping-off / wilt
    case 'maturity':
      return 0.4;
    default:
      return 0.5;
  }
}

/**
 * Soil vulnerability based on soil texture and drainage.
 * Heavy black cotton soil with waterlogging retains pathogen spores longer.
 */
function getSoilVulnerability(soilType?: SoilType | null, conditions?: string[]): number {
  let score = 0.5;
  if (soilType === 'black_cotton') score += 0.2;
  if (soilType === 'sandy') score -= 0.15;
  if (conditions?.includes('poorDrainage')) score += 0.25;
  return Math.max(0, Math.min(1, score));
}

/**
 * Multi-Input Bayesian Fusion Engine
 * Combines 5 distinct field telemetry inputs:
 * 1. Vision Prior (w = 0.40): Gemini 2.5 Flash / Edge CV visual confidence
 * 2. Weather & Spore Risk (w = 0.25): Microclimatic temperature, humidity, and continuous leaf wetness hours
 * 3. Pest-Trap ETL Ratio (w = 0.20): Pheromone / Sticky trap catches vs Economic Threshold Level
 * 4. Crop Phenology Stage (w = 0.10): Developmental stage vulnerability
 * 5. Soil & Drainage Dynamics (w = 0.05): Soil type spore-retention index
 */
export function calculateBayesianFusion(params: {
  visionConfidence: number; // 0 - 1
  weatherRisk?: WeatherRisk | null;
  sensorInput?: SensorInput | null;
  trapInput?: PestTrapInput | null;
  crop?: CropId | null;
  cropStage?: CropStage | null;
  soilType?: SoilType | null;
  conditions?: string[];
  detectedBoxes?: BoundingBox[];
  estimatedSurfacePercent?: number;
  diseaseId?: string;
  weather?: WeatherId | null;
}): MultiInputFusionResult {
  const {
    visionConfidence,
    weatherRisk,
    sensorInput,
    trapInput,
    crop,
    cropStage,
    soilType,
    conditions = [],
    detectedBoxes = [],
    estimatedSurfacePercent,
    diseaseId,
    weather,
  } = params;

  // 1. Vision Prior (w1 = 0.40)
  const wVision = 0.4;
  const rawVision = Math.max(0, Math.min(1, visionConfidence || 0.75));

  // 2. Weather / Spore Germination Risk (w2 = 0.25)
  const wWeather = 0.25;
  let rawWeather = weatherRisk?.score ?? 0.45;
  if (sensorInput) {
    if (sensorInput.leafWetnessHours >= 6) {
      rawWeather = Math.max(rawWeather, 0.85);
    } else if (sensorInput.leafWetnessHours >= 4) {
      rawWeather = Math.max(rawWeather, 0.65);
    }
  }

  // 3. Pest Trap vs ETL (w3 = 0.20)
  const wTrap = 0.2;
  let rawTrap = 0.35;
  if (trapInput) {
    const etlRatio = trapInput.count / Math.max(1, trapInput.thresholdEtl);
    if (etlRatio >= 1.5) rawTrap = 0.95;
    else if (etlRatio >= 1.0) rawTrap = 0.78;
    else if (etlRatio >= 0.5) rawTrap = 0.5;
    else rawTrap = 0.2;
  }

  // 4. Crop Phenology (w4 = 0.10)
  const wPhenology = 0.1;
  const rawPhenology = getStageVulnerability(crop, cropStage);

  // 5. Soil & Field Conditions (w5 = 0.05)
  const wSoil = 0.05;
  const rawSoil = getSoilVulnerability(soilType, conditions);

  // 6. Agronomic Prior Gating (Biological & Meteorological Constraints)
  let agronomicEvaluation: PriorEvaluationResult | undefined;
  let priorMultiplier = 1.0;
  if (diseaseId) {
    agronomicEvaluation = evaluateAgronomicPriors({
      diseaseId,
      cropStage: cropStage ?? undefined,
      weather: weather ?? undefined,
      conditions: conditions as Condition[],
      sensorInput,
    });
    priorMultiplier = agronomicEvaluation.priorMultiplier;
  }

  // Weighted fusion calculation
  const weightedSum =
    rawVision * wVision +
    rawWeather * wWeather +
    rawTrap * wTrap +
    rawPhenology * wPhenology +
    rawSoil * wSoil;

  const totalWeights = wVision + wWeather + wTrap + wPhenology + wSoil;
  const fusedScore = Math.max(0, Math.min(1, weightedSum / totalWeights));

  // Fused confidence (Bayesian updated confidence considering telemetry agreement & agronomic priors)
  const agreementBonus = Math.abs(rawVision - rawWeather) < 0.25 ? 0.04 : -0.02;
  let baseConfidence = rawVision * 0.85 + (fusedScore * 0.15) + agreementBonus;
  if (priorMultiplier < 0.2) {
    baseConfidence *= priorMultiplier; // Hard agronomic impossibility penalty
  } else {
    // Proportional prior adjustment: modulates based on microclimate and phenology (+/- 10%)
    baseConfidence = baseConfidence + (priorMultiplier - 1.0) * 0.12;
  }
  const fusedConfidence = Math.max(
    0.1,
    Math.min(0.99, Math.round(baseConfidence * 1000) / 1000)
  );

  // Risk Level determination
  let riskLevel: RiskLevel = 'low';
  if (fusedScore >= 0.75) riskLevel = 'severe';
  else if (fusedScore >= 0.52) riskLevel = 'high';
  else if (fusedScore >= 0.32) riskLevel = 'moderate';

  // Disease infection surface percentage:
  // Estimate from detected bounding boxes if provided, or use estimatedSurfacePercent, or default from vision score
  let surfacePercent = estimatedSurfacePercent;
  if (surfacePercent === undefined || surfacePercent === null) {
    if (detectedBoxes.length > 0) {
      // Sum area of bounding boxes clamped
      const boxArea = detectedBoxes.reduce((acc, b) => acc + (b.width * b.height) / 100, 0);
      surfacePercent = Math.min(75, Math.max(3, Math.round(boxArea * 0.75)));
    } else {
      surfacePercent = Math.round(fusedScore * 28 + 2);
    }
  }

  const infectionGrade = calculateInfectionGrade(surfacePercent);

  // Transparency breakdown
  const breakdown: FusionFactorBreakdown[] = [
    {
      id: 'vision',
      name: 'Computer Vision Prior',
      weight: wVision,
      rawScore: Math.round(rawVision * 100) / 100,
      weightedScore: Math.round(rawVision * wVision * 100) / 100,
      description: `Gemini 2.5 Flash pathological lesion & symptom visual confidence (${Math.round(rawVision * 100)}%).`,
    },
    {
      id: 'weather',
      name: 'Microclimate & Spore Risk',
      weight: wWeather,
      rawScore: Math.round(rawWeather * 100) / 100,
      weightedScore: Math.round(rawWeather * wWeather * 100) / 100,
      description: sensorInput?.leafWetnessHours
        ? `${sensorInput.leafWetnessHours}h continuous leaf wetness with ${sensorInput.relativeHumidity}% RH accelerates fungal incubation.`
        : `Atmospheric humidity and temperature suitability index (${Math.round(rawWeather * 100)}%).`,
    },
    {
      id: 'trap',
      name: 'Pest Trap vs. ETL Ratio',
      weight: wTrap,
      rawScore: Math.round(rawTrap * 100) / 100,
      weightedScore: Math.round(rawTrap * wTrap * 100) / 100,
      description: trapInput
        ? `${trapInput.count} catches vs ${trapInput.thresholdEtl} ETL threshold (${trapInput.status.toUpperCase()} level).`
        : 'Default regional pest baseline tracking.',
    },
    {
      id: 'phenology',
      name: 'Crop Phenology Stage',
      weight: wPhenology,
      rawScore: Math.round(rawPhenology * 100) / 100,
      weightedScore: Math.round(rawPhenology * wPhenology * 100) / 100,
      description: cropStage
        ? `Stage '${cropStage}' vulnerability index (${Math.round(rawPhenology * 100)}%).`
        : 'Vegetative growth baseline.',
    },
    {
      id: 'soil',
      name: 'Soil Spore Retention',
      weight: wSoil,
      rawScore: Math.round(rawSoil * 100) / 100,
      weightedScore: Math.round(rawSoil * wSoil * 100) / 100,
      description: soilType
        ? `${soilType.replace('_', ' ')} soil drainage and spore persistence factor.`
        : 'Standard field drainage assumption.',
    },
  ];

  const reasons: string[] = [];
  if (rawVision > 0.8) {
    reasons.push(`High visual match (${Math.round(rawVision * 100)}%) with characteristic foliar hallmarks.`);
  }
  if (sensorInput && sensorInput.leafWetnessHours >= 6) {
    reasons.push(`Critical spore incubation warning: continuous leaf wetness exceeds 6 hours.`);
  }
  if (trapInput && trapInput.count >= trapInput.thresholdEtl) {
    reasons.push(`Pheromone trap count (${trapInput.count}) breaches Economic Threshold Level (${trapInput.thresholdEtl}).`);
  }
  if (infectionGrade.grade === 3) {
    reasons.push(`Canopy surface involvement (${infectionGrade.surfacePercent}%) triggers Grade 3 emergency protocol.`);
  }
  if (agronomicEvaluation) {
    if (!agronomicEvaluation.isBiologicallyPossible) {
      reasons.unshift(`Agronomic Alert: ${agronomicEvaluation.agronomicReasoning}`);
    } else if (agronomicEvaluation.stageCompatibility === 'optimal') {
      reasons.push(`Phenology Validation: ${agronomicEvaluation.agronomicReasoning}`);
    }
  }

  return {
    fusedScore,
    fusedConfidence,
    riskLevel,
    infectionGrade,
    breakdown,
    protocolSummary: infectionGrade.actionProtocol,
    reasons,
    agronomicPriors: agronomicEvaluation,
  };
}
