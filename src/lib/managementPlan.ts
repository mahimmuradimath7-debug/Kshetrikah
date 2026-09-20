import type { Disease, ManagementPlan, RiskLevel, WeatherRisk } from '@/data/types';

/**
 * Given the top diagnosis + a weather-risk score, build a structured
 * 4-section implementation plan for the farmer. Re-uses fields already
 * present on the Disease object (organicTreatment, chemicalTreatment,
 * prevention) and adds immediate + monitoring actions generated from
 * severity + risk.
 */
export function buildManagementPlan(
  disease: Disease,
  risk: WeatherRisk
): ManagementPlan {
  // Cultural = first half of prevention (field-practice items)
  // Biological = organicTreatment
  // Chemical = chemicalTreatment
  // Prevention = full prevention list
  const half = Math.ceil(disease.prevention.length / 2);
  const cultural = disease.prevention.slice(0, half);
  const biological = [...disease.organicTreatment];
  const chemical = [...disease.chemicalTreatment];
  const prevention = [...disease.prevention];

  const immediate = buildImmediate(disease.severity, risk.level, risk.reasons);
  const monitoring = buildMonitoring(disease, risk.level);
  const followUpDays = followUpInterval(disease.severity, risk.level);

  // CIBRC safe input usage
  const safeInput = buildSafeInput(disease);
  const trapAdvice = buildTrapAdvice(disease);

  return {
    immediate,
    cultural,
    biological,
    chemical,
    prevention,
    monitoring,
    safeInput,
    trapAdvice,
    followUpDays,
  };
}

function buildSafeInput(disease: Disease): import('@/data/types').SafeInputUsage {
  const isInsect = disease.pathogen.toLowerCase().includes('insect') || disease.symptomTypes.includes('pest');
  const isBacterial = disease.pathogen.toLowerCase().includes('bacterial');

  if (isInsect) {
    return {
      cibrcApproved: true,
      activeIngredient: 'Chlorantraniliprole 18.5% SC / Azadirachtin 10,000 ppm',
      dosagePerLiter: '0.3 ml/L (chemical) or 2.0 ml/L (neem biopesticide)',
      waterVolumePerAcre: 200,
      preHarvestIntervalDays: 14,
      ppeChecklist: [
        'N95 face mask to prevent aerosol inhalation',
        'Chemical-resistant nitrile rubber gloves',
        'Protective eye goggles with indirect side vents',
        'Long gumboots and protective full-sleeve cotton apron',
      ],
      optimalSprayWindow: 'Late afternoon (4:30 PM - 6:30 PM) when wind is <8 km/h and honeybees are inactive.',
    };
  }

  if (isBacterial) {
    return {
      cibrcApproved: true,
      activeIngredient: 'Copper Oxychloride 50% WP + Streptomycin Sulphate 90%',
      dosagePerLiter: '2.5 g/L Copper Oxychloride + 0.1 g/L Streptomycin',
      waterVolumePerAcre: 200,
      preHarvestIntervalDays: 7,
      ppeChecklist: [
        'Particle respirator / mask',
        'Rubber gloves and protective eye shields',
        'Wash all spray tank equipment thoroughly post-application',
      ],
      optimalSprayWindow: 'Early morning (6:30 AM - 9:00 AM) after morning dew has dried off foliage.',
    };
  }

  // Fungal default
  return {
    cibrcApproved: true,
    activeIngredient: 'Mancozeb 75% WP / Azoxystrobin 23% SC / Trichoderma harzianum',
    dosagePerLiter: '2.5 g/L (Mancozeb) or 1.0 ml/L (Azoxystrobin) or 5.0 g/L (Trichoderma)',
    waterVolumePerAcre: 200,
    preHarvestIntervalDays: 10,
    ppeChecklist: [
      'Chemical-resistant nitrile gloves',
      'Protective eye goggles',
      'N95 face mask during tank mixing',
      'Do not eat, drink or smoke during spray operations',
    ],
    optimalSprayWindow: 'Morning (7:00 AM - 9:30 AM) with calm winds (<6 km/h). Avoid spraying before forecasted rain.',
  };
}

function buildTrapAdvice(disease: Disease): string {
  if (disease.crop === 'cotton') {
    return 'Install 5 Gossyplure pheromone traps per acre at crop canopy height for Pink Bollworm surveillance. Check catch daily.';
  }
  if (disease.crop === 'maize') {
    return 'Install 4 Spodolure funnel traps per acre for Fall Armyworm adult moth monitoring. Replace septa every 25 days.';
  }
  if (disease.crop === 'tomato' || disease.crop === 'chili') {
    return 'Place 10 yellow sticky cards per acre (for whitefly/leafminer) and 10 blue sticky cards (for thrips) 15 cm above canopy.';
  }
  return 'Erect 5-8 yellow sticky cards per acre to monitor sucking vectors and beneficial parasitoid wasp activity.';
}

function buildImmediate(
  severity: Disease['severity'],
  level: RiskLevel,
  riskReasons: string[]
): string[] {
  const out: string[] = [];

  // Universal hygiene
  out.push('Wash hands, tools and footwear before moving to other fields.');

  if (severity === 'severe' || level === 'severe') {
    out.push('Within 24 hours: remove and destroy the most severely affected plants/leaves (do not compost).');
    out.push('Isolate the affected patch — avoid walking through it and restrict equipment movement.');
  } else if (severity === 'high' || level === 'high') {
    out.push('Within 48 hours: prune and destroy visibly infected leaves and fruit.');
  } else {
    out.push('Within 48 hours: mark affected plants and start a daily walk-through to track spread.');
  }

  if (level === 'severe' || level === 'high') {
    out.push('Pause overhead irrigation; switch to drip or flood-furrow to keep foliage dry.');
  }

  // Weather-driven adds
  for (const r of riskReasons) {
    if (/wet|humid|rain/i.test(r)) {
      out.push('Improve field drainage and reduce canopy humidity — wider spacing or light pruning.');
      break;
    }
  }

  return out;
}

function buildMonitoring(disease: Disease, level: RiskLevel): string[] {
  const out: string[] = [
    `Re-inspect the same plants every 2–3 days for the next two weeks.`,
    `Photograph any new symptoms and re-run the scan to compare progression.`,
  ];
  if (level === 'severe' || level === 'high') {
    out.push('Check neighbouring fields and adjacent rows — many of these diseases spread from the edge inward.');
  }
  if (disease.pathogen.toLowerCase().includes('insect')) {
    out.push('Set up pheromone / yellow / blue sticky traps to track adult population.');
  }
  if (disease.affectedParts.includes('fruit') || disease.affectedParts.includes('flower')) {
    out.push('Inspect flowers and young fruit at each visit; note any drop or distortion.');
  }
  return out;
}

function followUpInterval(severity: Disease['severity'], level: RiskLevel): number {
  if (severity === 'severe' || level === 'severe') return 3;
  if (severity === 'high' || level === 'high') return 5;
  if (severity === 'moderate' || level === 'moderate') return 7;
  return 10;
}
