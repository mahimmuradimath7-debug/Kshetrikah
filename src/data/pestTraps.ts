import type { CropId, PestTrapInput, PestTrapType } from './types';

export interface TrapSpecification {
  id: string;
  crop: CropId;
  targetPest: string;
  targetPestScientific: string;
  targetPestMr: string;
  trapType: PestTrapType;
  lureType: string;
  recommendedDensityPerAcre: number;
  thresholdEtl: number; // Economic Threshold Level (moths/insects per trap per night)
  thresholdUnit: string;
  actionGuidanceEn: string;
  actionGuidanceMr: string;
  lureLifeDays: number;
}

export const trapSpecifications: TrapSpecification[] = [
  {
    id: 'cotton-pbw',
    crop: 'cotton',
    targetPest: 'Pink Bollworm',
    targetPestScientific: 'Pectinophora gossypiella',
    targetPestMr: 'गुलाबी बोंडअळी (Pink Bollworm)',
    trapType: 'pheromone',
    lureType: 'Gossyplure Pheromone Septa',
    recommendedDensityPerAcre: 5,
    thresholdEtl: 8, // 8 moths/trap/night for 3 consecutive days
    thresholdUnit: 'moths/trap/night',
    actionGuidanceEn: 'ETL breached (>8 moths/trap for 3 days). Spray Neem 1500ppm or release Trichogrammatoidea bactrae egg parasitoids @ 60,000/acre. Rotate with Profenofos 50% EC if larvae enter bolls.',
    actionGuidanceMr: 'आर्थिक नुकसान संकेत पातळी ओलांडली (>८ पतंग/सापळा/रात्र). १५०० पीपीएम निंबोळी अर्क किंवा ट्रायकोकार्ड वापरा. प्रादुर्भाव वाढल्यास कृषी सल्लागाराच्या सल्ल्याने शिफारशीत फवारणी करा.',
    lureLifeDays: 21,
  },
  {
    id: 'maize-faw',
    crop: 'maize',
    targetPest: 'Fall Armyworm',
    targetPestScientific: 'Spodoptera frugiperda',
    targetPestMr: 'लष्करी अळी (Fall Armyworm)',
    trapType: 'pheromone',
    lureType: 'Spodolure Funnel Trap',
    recommendedDensityPerAcre: 4,
    thresholdEtl: 10,
    thresholdUnit: 'moths/trap/night',
    actionGuidanceEn: 'ETL reached (10 moths/trap). Handpick egg masses; apply sand-lime mix (9:1) or Metarhizium rileyi @ 5g/L into whorls within 48 hours.',
    actionGuidanceMr: 'ईटीएल पातळी गाठली (१० पतंग/सापळा). पोंग्यामध्ये मेटारायझियम किंवा वाळू-चुना मिश्रण भरा. त्वरित जैविक किंवा शिफारशीत रासायनिक नियंत्रण करा.',
    lureLifeDays: 30,
  },
  {
    id: 'tomato-fruit-borer',
    crop: 'tomato',
    targetPest: 'Fruit Borer / American Bollworm',
    targetPestScientific: 'Helicoverpa armigera',
    targetPestMr: 'फळ पोखरणारी अळी (Helicoverpa)',
    trapType: 'pheromone',
    lureType: 'Helilure Sleeve Trap',
    recommendedDensityPerAcre: 5,
    thresholdEtl: 5,
    thresholdUnit: 'moths/trap/night',
    actionGuidanceEn: 'ETL reached (5 moths/trap). Install bird perches (10/acre) and spray HaNPV 250 LE/acre with 1% jaggery during evening hours.',
    actionGuidanceMr: 'ईटीएल मर्यादा ओलांडली (५ पतंग/सापळा). शेतात पक्षी थांबे उभारा आणि संध्याकाळी HaNPV विषाणू द्रावणाची गूळ मिसळून फवारणी करा.',
    lureLifeDays: 25,
  },
  {
    id: 'cotton-sucking-pests',
    crop: 'cotton',
    targetPest: 'Whitefly & Thrips',
    targetPestScientific: 'Bemisia tabaci / Thrips tabaci',
    targetPestMr: 'पांढरी माशी आणि फुलकिडे (Whitefly/Thrips)',
    trapType: 'yellow_sticky',
    lureType: 'Yellow Sticky Card (15x30 cm)',
    recommendedDensityPerAcre: 10,
    thresholdEtl: 20, // 20 insects / sq inch
    thresholdUnit: 'insects/card/day',
    actionGuidanceEn: 'High sucking pest density (>20 insects/card). Spray Neem oil 10,000 ppm @ 1 ml/L or Lecanicillium lecanii bio-fungicide to prevent CLCuV vector transmission.',
    actionGuidanceMr: 'रसशोषक किडींचे प्रमाण जास्त (>२० किडे/कार्ड). ५% निंबोळी अर्क किंवा व्हर्टिसिलियम लेकॅनी जैविक बुरशीची फवारणी करा.',
    lureLifeDays: 15,
  },
  {
    id: 'chili-thrips',
    crop: 'chili',
    targetPest: 'Chili Thrips & Mites',
    targetPestScientific: 'Scirtothrips dorsalis',
    targetPestMr: 'मिरचीवरील बोकड्या / थ्रिप्स',
    trapType: 'blue_sticky',
    lureType: 'Blue Sticky Card (15x30 cm)',
    recommendedDensityPerAcre: 12,
    thresholdEtl: 15,
    thresholdUnit: 'thrips/card/day',
    actionGuidanceEn: 'Thrips threshold reached. Blue sticky traps attract thrips 3x more than yellow. Apply Beauveria bassiana @ 5 g/L or Fipronil 5% SC @ 1 ml/L.',
    actionGuidanceMr: 'थ्रिप्स नियंत्रण पातळी गाठली. निळे चिकट सापळे वापरा आणि बिव्हेरिया बॅसियाना ५ ग्रॅम/लिटर फवारा.',
    lureLifeDays: 15,
  },
  {
    id: 'sugarcane-top-borer',
    crop: 'sugarcane',
    targetPest: 'Top Shoot Borer',
    targetPestScientific: 'Scirpophaga excerptalis',
    targetPestMr: 'ऊस शेंडा कीड (Top Borer)',
    trapType: 'pheromone',
    lureType: 'Top Borer Water Pan / Delta Trap',
    recommendedDensityPerAcre: 4,
    thresholdEtl: 6,
    thresholdUnit: 'moths/trap/night',
    actionGuidanceEn: 'Spike in top borer moths. Release Trichogramma chilonis egg parasitoids @ 50,000/ha at 10-day intervals.',
    actionGuidanceMr: 'शेंडा पोखरणारी कीड वाढली. ट्रायकोकार्डचे ५०,००० परोपजीवी प्रति हेक्टरी १० दिवसांच्या अंतराने सोडा.',
    lureLifeDays: 30,
  },
];

export function evaluatePestTrapStatus(
  trapSpecId: string,
  observedCount: number,
  consecutiveNights: number = 1
): PestTrapInput {
  const spec = trapSpecifications.find((s) => s.id === trapSpecId) || trapSpecifications[0];
  const ratio = observedCount / spec.thresholdEtl;

  let status: 'safe' | 'warning' | 'critical' = 'safe';
  let recommendation = `Trap count is low (${observedCount} ${spec.thresholdUnit}). Routine monitoring recommended.`;

  if (ratio >= 1.0 || (ratio >= 0.75 && consecutiveNights >= 3)) {
    status = 'critical';
    recommendation = `ALERT: Economic Threshold Level (ETL) breached! ${spec.actionGuidanceEn}`;
  } else if (ratio >= 0.5) {
    status = 'warning';
    recommendation = `CAUTION: Trap count approaching threshold (${observedCount}/${spec.thresholdEtl} ${spec.thresholdUnit}). Inspect field leaves for egg clusters.`;
  }

  return {
    trapType: spec.trapType,
    targetPest: spec.targetPest,
    count: observedCount,
    thresholdEtl: spec.thresholdEtl,
    consecutiveNights,
    status,
    recommendation,
  };
}
