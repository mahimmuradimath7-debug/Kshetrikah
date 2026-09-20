// Domain types for crops, diseases, and the diagnosis wizard

export type CropId =
  | 'rice'
  | 'wheat'
  | 'maize'
  | 'cotton'
  | 'sugarcane'
  | 'tomato'
  | 'potato'
  | 'chili';

export type SymptomType =
  | 'spots'
  | 'yellowing'
  | 'wilting'
  | 'rot'
  | 'powder'
  | 'pest'
  | 'deformity'
  | 'blight';

export type PlantPart =
  | 'leaves'
  | 'stem'
  | 'root'
  | 'fruit'
  | 'flower'
  | 'whole';

export type Condition =
  | 'wet'
  | 'dry'
  | 'cold'
  | 'pestsNearby'
  | 'monoculture'
  | 'poorDrainage';

export type Season = 'kharif' | 'rabi' | 'zaid' | 'year-round';

export type Severity = 'low' | 'moderate' | 'high' | 'severe';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'severe';

export type WeatherId = 'humid' | 'rainy' | 'hot_dry' | 'cool_dry' | 'normal';

export interface Region {
  id: string; // ISO-like slug, e.g. 'IN-MH'
  nameEn: string;
  nameHi: string;
  nameMr: string;
}

export type CropStage =
  | 'nursery'
  | 'vegetative'
  | 'flowering'
  | 'fruiting'
  | 'maturity';

export type SoilType =
  | 'black_cotton'
  | 'red_loamy'
  | 'alluvial'
  | 'laterite'
  | 'sandy';

export type VarietyType =
  | 'hybrid'
  | 'desi_traditional'
  | 'bt_resistant'
  | 'susceptible';

export type PestTrapType =
  | 'pheromone'
  | 'yellow_sticky'
  | 'blue_sticky'
  | 'light_trap';

export interface PestTrapInput {
  trapType: PestTrapType;
  targetPest: string;
  count: number;
  thresholdEtl: number; // Economic Threshold Level (e.g. 8 moths/trap/night)
  consecutiveNights?: number;
  status: 'safe' | 'warning' | 'critical';
  recommendation: string;
}

export interface SensorInput {
  leafWetnessHours: number; // continuous wetness in hours (>6h = high fungal risk)
  relativeHumidity: number; // % RH
  ambientTemp: number; // °C
  soilMoisture: number; // %
  sporeGerminationRisk: 'low' | 'moderate' | 'high' | 'critical';
}

export interface SafeInputUsage {
  cibrcApproved: boolean;
  activeIngredient: string;
  dosagePerLiter: string;
  waterVolumePerAcre: number; // standard 200 L / acre
  preHarvestIntervalDays: number; // PHI waiting period before harvest
  ppeChecklist: string[];
  optimalSprayWindow: string;
}

export interface WeatherRisk {
  score: number; // 0-1
  level: RiskLevel;
  reasons: string[]; // short human-readable reasons
  sensorAlert?: string;
  trapAlert?: string;
}

export interface ImageHint {
  /** Approximate brown-spot coverage (0-1) — typical of fungal lesions */
  brown: number;
  /** Approximate yellow / chlorotic coverage (0-1) */
  yellow: number;
  /** Approximate white / powdery coverage (0-1) */
  white: number;
  /** Average brightness 0-1 — proxy for "leaf vs background" */
  brightness: number;
  /** Dominant hue family: 'green' | 'yellow' | 'brown' | 'mixed' */
  hue: 'green' | 'yellow' | 'brown' | 'mixed';
}

export interface ManagementPlan {
  immediate: string[]; // do these within 24-48h
  cultural: string[]; // field-practice changes
  biological: string[]; // biocontrol / organic options
  chemical: string[]; // approved chemical options
  prevention: string[]; // next-season / ongoing prevention
  monitoring: string[]; // what to watch for in the next 7-14 days
  safeInput?: SafeInputUsage;
  trapAdvice?: string;
  followUpDays: number; // suggested re-scan interval
}

export interface SeasonMonth {
  month: number; // 1-12
  tip: string;
}

export interface Disease {
  id: string;
  name: string; // English fallback
  nameMr?: string;
  crop: CropId;
  pathogen: string; // e.g. "Fungal", "Bacterial", "Viral", "Insect"
  severity: Severity;
  bestSeason: Season;
  affectedParts: PlantPart[];
  symptomTypes: SymptomType[];
  /** Conditions that increase likelihood */
  conditions: Condition[];
  /** Bullet points used both in checklist and on detail page */
  symptoms: string[];
  causes: string;
  organicTreatment: string[];
  chemicalTreatment: string[];
  prevention: string[];
  /** 1-2 sentence description used on cards */
  shortDesc: string;
  safeInput?: SafeInputUsage;
}

export interface Crop {
  id: CropId;
  emoji: string;
  image: string;
  shortDesc: string;
  /** Typical sowing & harvest months for seasonal advisory */
  sowingMonths: number[];
  harvestMonths: number[];
  season: Season;
}

export interface GeospatialOutbreak {
  id: string;
  district: string;
  districtMr: string;
  taluka: string;
  talukaMr: string;
  lat: number;
  lng: number;
  crop: CropId;
  diseaseId: string;
  diseaseName: string;
  severity: Severity;
  activeCases: number;
  containmentRadiusKm: number;
  trapCountAverage: number;
  reportedAt: string;
  status: 'active' | 'monitoring' | 'contained';
}

export interface ExpertReferral {
  id: string;
  farmerName: string;
  contactNumber: string;
  district: string;
  taluka: string;
  village: string;
  crop: CropId;
  cropStage: CropStage;
  soilType?: SoilType;
  suspectedDiseaseId: string;
  imageUrl: string;
  notes: string;
  status: 'pending' | 'reviewed' | 'lab_referred' | 'resolved';
  assignedKvk: string;
  agronomistName?: string;
  agronomistAdvice?: string;
  labTestReport?: string;
  audioAdviceUrl?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface FollowUpRecord {
  id: string;
  referralId?: string;
  farmerName: string;
  village: string;
  district: string;
  crop: CropId;
  diseaseId: string;
  treatmentUsed: string;
  treatmentType: 'organic' | 'chemical' | 'integrated';
  dayInterval: 3 | 7 | 14;
  outcome: 'cured' | 'improved' | 'no_change' | 'worsened';
  farmerFeedback: string;
  followUpDate: string;
}

