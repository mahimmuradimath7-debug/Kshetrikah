/**
 * KSHETRIKAH (क्षेत्रिकः) - Agronomic Prior-Gating Engine
 * Biological Phenological Constraints & Epidemiological Weather Gating
 * Government of Maharashtra MSInS Challenge #26131 | TEAM BITHEADS
 *
 * Enforces biological realism on computer vision predictions:
 * - Prevents phenologically impossible diagnoses (e.g. Bollworm/Fruit Borer at Seedling stage)
 * - Restricts fungal sporulation to epidemiologically feasible microclimates (temperature/humidity/wetness)
 * - Yields Bayesian prior multipliers from 0.05 (suppressed/impossible) to 1.35 (peak epidemic conditions)
 */

import type { CropStage, WeatherId, Condition, SensorInput } from '@/data/types';

export interface AgronomicConstraint {
  validStages: CropStage[];
  optimalStages: CropStage[];
  impossibleStages: CropStage[];
  optimalWeather: WeatherId[];
  hostileWeather: WeatherId[];
  temperatureRange?: { min: number; max: number; optimal: number }; // Celsius
  minHumidityPercent?: number;
  favorableConditions?: Condition[];
  unfavorableConditions?: Condition[];
  biologicalReason: string;
}

export interface PriorEvaluationResult {
  isBiologicallyPossible: boolean;
  priorMultiplier: number; // 0.05 - 1.35
  stageCompatibility: 'optimal' | 'compatible' | 'improbable' | 'impossible';
  weatherCompatibility: 'optimal' | 'favorable' | 'unfavorable' | 'hostile';
  agronomicReasoning: string;
}

export const AGRONOMIC_DISEASE_CONSTRAINTS: Record<string, AgronomicConstraint> = {
  // ───── RICE ─────
  'rice-blast': {
    validStages: ['nursery', 'vegetative', 'flowering', 'fruiting', 'maturity'],
    optimalStages: ['nursery', 'flowering'], // leaf blast in nursery, neck blast in flowering
    impossibleStages: [],
    optimalWeather: ['humid', 'rainy'],
    hostileWeather: ['hot_dry'],
    temperatureRange: { min: 18, max: 28, optimal: 24 },
    minHumidityPercent: 85,
    favorableConditions: ['wet', 'cold', 'monoculture'],
    unfavorableConditions: ['dry'],
    biologicalReason: 'Pyricularia oryzae conidia require >85% relative humidity and free leaf moisture for germination.',
  },
  'rice-bacterial-blight': {
    validStages: ['vegetative', 'flowering', 'fruiting', 'maturity'],
    optimalStages: ['vegetative', 'flowering'],
    impossibleStages: [],
    optimalWeather: ['rainy', 'humid'],
    hostileWeather: ['cool_dry'],
    temperatureRange: { min: 24, max: 34, optimal: 30 },
    minHumidityPercent: 75,
    favorableConditions: ['wet', 'monoculture', 'poorDrainage'],
    unfavorableConditions: ['dry'],
    biologicalReason: 'Xanthomonas oryzae spreads through wind-driven rains and guttation droplets in warm, overcast weather.',
  },
  'rice-shekhar-rot': {
    validStages: ['vegetative', 'flowering', 'fruiting'],
    optimalStages: ['flowering', 'fruiting'],
    impossibleStages: ['nursery'],
    optimalWeather: ['humid', 'rainy'],
    hostileWeather: ['hot_dry'],
    temperatureRange: { min: 25, max: 32, optimal: 28 },
    minHumidityPercent: 80,
    favorableConditions: ['wet', 'poorDrainage', 'monoculture'],
    unfavorableConditions: ['dry'],
    biologicalReason: 'Sheath rot fungus Sarocladium infects the boot leaf sheath enclosing the young panicle.',
  },
  'rice-brown-plant-hopper': {
    validStages: ['vegetative', 'flowering', 'fruiting', 'maturity'],
    optimalStages: ['flowering', 'fruiting'],
    impossibleStages: ['nursery'],
    optimalWeather: ['humid', 'normal'],
    hostileWeather: ['cool_dry'],
    temperatureRange: { min: 22, max: 32, optimal: 28 },
    favorableConditions: ['wet', 'monoculture', 'poorDrainage', 'pestsNearby'],
    unfavorableConditions: ['dry'],
    biologicalReason: 'BPH populations proliferate in dense, microclimate-humid canopies with stagnant water.',
  },

  // ───── WHEAT ─────
  'wheat-yellow-rust': {
    validStages: ['vegetative', 'flowering', 'fruiting'],
    optimalStages: ['vegetative', 'flowering'],
    impossibleStages: ['nursery'],
    optimalWeather: ['cool_dry', 'normal', 'humid'],
    hostileWeather: ['hot_dry'],
    temperatureRange: { min: 8, max: 20, optimal: 15 },
    minHumidityPercent: 70,
    favorableConditions: ['cold', 'wet'],
    unfavorableConditions: ['dry'],
    biologicalReason: 'Puccinia striiformis is cold-adapted; spore germination ceases when temperatures exceed 25°C.',
  },
  'wheat-brown-rust': {
    validStages: ['vegetative', 'flowering', 'fruiting', 'maturity'],
    optimalStages: ['flowering', 'fruiting'],
    impossibleStages: ['nursery'],
    optimalWeather: ['normal', 'humid'],
    hostileWeather: ['cool_dry'],
    temperatureRange: { min: 18, max: 30, optimal: 24 },
    minHumidityPercent: 65,
    favorableConditions: ['wet', 'monoculture'],
    unfavorableConditions: ['dry'],
    biologicalReason: 'Puccinia triticina favors moderate warm temperatures during late vegetative and grain fill.',
  },
  'wheat-loose-smut': {
    validStages: ['flowering', 'fruiting', 'maturity'],
    optimalStages: ['flowering'],
    impossibleStages: ['nursery', 'vegetative'],
    optimalWeather: ['normal', 'humid'],
    hostileWeather: ['hot_dry'],
    temperatureRange: { min: 16, max: 24, optimal: 20 },
    biologicalReason: 'Loose smut symptoms only express visually upon ear emergence (flowering stage), converting kernels to black sooty powder.',
  },
  'wheat-karnal-bunt': {
    validStages: ['flowering', 'fruiting', 'maturity'],
    optimalStages: ['flowering'],
    impossibleStages: ['nursery', 'vegetative'],
    optimalWeather: ['humid', 'rainy', 'normal'],
    hostileWeather: ['hot_dry'],
    temperatureRange: { min: 15, max: 22, optimal: 19 },
    biologicalReason: 'Tilletia indica infects strictly during anthesis (flowering) when cool showers coincide with ear emergence.',
  },

  // ───── MAIZE ─────
  'maize-fall-armyworm': {
    validStages: ['vegetative', 'flowering', 'fruiting', 'maturity'],
    optimalStages: ['vegetative', 'flowering'],
    impossibleStages: ['nursery'],
    optimalWeather: ['normal', 'humid', 'hot_dry'],
    hostileWeather: ['cool_dry'],
    temperatureRange: { min: 20, max: 35, optimal: 28 },
    favorableConditions: ['pestsNearby', 'monoculture'],
    biologicalReason: 'Spodoptera frugiperda larvae aggressively feed in the central whorl of young to mid-stage corn plants.',
  },
  'maize-turcicum-leaf-blight': {
    validStages: ['vegetative', 'flowering', 'fruiting', 'maturity'],
    optimalStages: ['vegetative', 'flowering'],
    impossibleStages: [],
    optimalWeather: ['humid', 'rainy'],
    hostileWeather: ['hot_dry'],
    temperatureRange: { min: 18, max: 27, optimal: 22 },
    minHumidityPercent: 80,
    favorableConditions: ['wet', 'cold', 'monoculture'],
    unfavorableConditions: ['dry'],
    biologicalReason: 'Exserohilum turcicum conidia germinate under cool, wet conditions with heavy morning dew.',
  },
  'maize-stalk-rot': {
    validStages: ['fruiting', 'maturity'],
    optimalStages: ['maturity'],
    impossibleStages: ['nursery', 'vegetative'],
    optimalWeather: ['hot_dry', 'normal'],
    hostileWeather: ['cool_dry'],
    temperatureRange: { min: 28, max: 38, optimal: 32 },
    favorableConditions: ['dry', 'poorDrainage', 'monoculture'],
    biologicalReason: 'Fusarium/Macrophomina stalk rot develops as plants senesce under post-flowering moisture stress.',
  },

  // ───── COTTON ─────
  'cotton-pink-bollworm': {
    validStages: ['flowering', 'fruiting', 'maturity'],
    optimalStages: ['fruiting', 'maturity'],
    impossibleStages: ['nursery', 'vegetative'],
    optimalWeather: ['normal', 'humid'],
    hostileWeather: ['cool_dry'],
    temperatureRange: { min: 22, max: 36, optimal: 30 },
    favorableConditions: ['pestsNearby', 'monoculture'],
    biologicalReason: 'Pectinophora gossypiella specifically targets flower squares and developing green bolls; impossible before flowering.',
  },
  'cotton-boll-rot': {
    validStages: ['fruiting', 'maturity'],
    optimalStages: ['fruiting', 'maturity'],
    impossibleStages: ['nursery', 'vegetative', 'flowering'],
    optimalWeather: ['rainy', 'humid'],
    hostileWeather: ['hot_dry', 'cool_dry'],
    temperatureRange: { min: 24, max: 32, optimal: 28 },
    minHumidityPercent: 85,
    favorableConditions: ['wet', 'poorDrainage'],
    biologicalReason: 'Boll rot complex requires formed cotton bolls coupled with prolonged canopy humidity and insect punctures.',
  },
  'cotton-leaf-curl-virus': {
    validStages: ['nursery', 'vegetative', 'flowering', 'fruiting'],
    optimalStages: ['vegetative', 'flowering'],
    impossibleStages: ['maturity'],
    optimalWeather: ['hot_dry', 'normal'],
    hostileWeather: ['cool_dry'],
    temperatureRange: { min: 26, max: 38, optimal: 32 },
    favorableConditions: ['dry', 'pestsNearby', 'monoculture'],
    biologicalReason: 'CLCuV is vectored by whiteflies (Bemisia tabaci), which peak in warm, dry weather on active tender foliage.',
  },

  // ───── SUGARCANE ─────
  'sugarcane-red-rot': {
    validStages: ['vegetative', 'flowering', 'fruiting', 'maturity'],
    optimalStages: ['fruiting', 'maturity'],
    impossibleStages: ['nursery'],
    optimalWeather: ['rainy', 'humid'],
    hostileWeather: ['cool_dry'],
    temperatureRange: { min: 25, max: 33, optimal: 29 },
    minHumidityPercent: 80,
    favorableConditions: ['wet', 'poorDrainage', 'monoculture'],
    unfavorableConditions: ['dry'],
    biologicalReason: 'Colletotrichum falcatum spreads rapidly in monsoon season through waterlogged cane stalks with nodal crack ingress.',
  },
  'sugarcane-top-borer': {
    validStages: ['vegetative', 'flowering', 'fruiting'],
    optimalStages: ['vegetative'],
    impossibleStages: ['nursery', 'maturity'],
    optimalWeather: ['humid', 'normal'],
    hostileWeather: ['cool_dry'],
    temperatureRange: { min: 24, max: 34, optimal: 30 },
    favorableConditions: ['pestsNearby'],
    biologicalReason: 'Scirpophaga excerptalis attacks actively growing spindle leaves and terminal shoots of young sugarcane.',
  },
  'sugarcane-pyrilla': {
    validStages: ['vegetative', 'flowering', 'fruiting', 'maturity'],
    optimalStages: ['vegetative', 'flowering'],
    impossibleStages: ['nursery'],
    optimalWeather: ['humid', 'normal'],
    hostileWeather: ['hot_dry', 'cool_dry'],
    temperatureRange: { min: 24, max: 32, optimal: 28 },
    favorableConditions: ['pestsNearby', 'monoculture'],
    biologicalReason: 'Pyrilla perpusilla leafhoppers multiply rapidly in humid microclimates with dense green canopy foliage.',
  },

  // ───── TOMATO ─────
  'tomato-early-blight': {
    validStages: ['vegetative', 'flowering', 'fruiting', 'maturity'],
    optimalStages: ['flowering', 'fruiting'],
    impossibleStages: ['nursery'],
    optimalWeather: ['normal', 'humid', 'hot_dry'],
    hostileWeather: ['cool_dry'],
    temperatureRange: { min: 22, max: 32, optimal: 27 },
    favorableConditions: ['monoculture', 'dry'],
    biologicalReason: 'Alternaria solani targets older lower leaves during fruit load as plant nutrient demands peak.',
  },
  'tomato-late-blight': {
    validStages: ['nursery', 'vegetative', 'flowering', 'fruiting', 'maturity'],
    optimalStages: ['vegetative', 'flowering', 'fruiting'],
    impossibleStages: [],
    optimalWeather: ['humid', 'rainy'],
    hostileWeather: ['hot_dry'], // Phytophthora sporangia die above 30°C in dry air
    temperatureRange: { min: 12, max: 24, optimal: 18 },
    minHumidityPercent: 85,
    favorableConditions: ['wet', 'cold'],
    unfavorableConditions: ['dry'],
    biologicalReason: 'Phytophthora infestans requires cool temperatures (12-22°C) and >85% relative humidity; rapid die-off in hot arid heat.',
  },
  'tomato-leaf-curl-virus': {
    validStages: ['nursery', 'vegetative', 'flowering', 'fruiting'],
    optimalStages: ['vegetative', 'flowering'],
    impossibleStages: ['maturity'],
    optimalWeather: ['hot_dry', 'normal'],
    hostileWeather: ['cool_dry', 'rainy'],
    temperatureRange: { min: 25, max: 38, optimal: 32 },
    favorableConditions: ['dry', 'pestsNearby'],
    unfavorableConditions: ['wet'],
    biologicalReason: 'ToLCV is transmitted by whiteflies which thrive in hot dry weather and are washed away by heavy rainfall.',
  },
  'tomato-fruit-borer': {
    validStages: ['flowering', 'fruiting', 'maturity'],
    optimalStages: ['fruiting'],
    impossibleStages: ['nursery', 'vegetative'],
    optimalWeather: ['normal', 'humid'],
    hostileWeather: ['cool_dry'],
    temperatureRange: { min: 20, max: 32, optimal: 26 },
    favorableConditions: ['pestsNearby'],
    biologicalReason: 'Helicoverpa armigera lays eggs on flowers and larvae bore into green developing tomato fruits; impossible before flowering.',
  },

  // ───── POTATO ─────
  'potato-late-blight': {
    validStages: ['vegetative', 'flowering', 'fruiting', 'maturity'],
    optimalStages: ['flowering', 'fruiting'],
    impossibleStages: ['nursery'],
    optimalWeather: ['humid', 'rainy'],
    hostileWeather: ['hot_dry'],
    temperatureRange: { min: 10, max: 22, optimal: 17 },
    minHumidityPercent: 85,
    favorableConditions: ['wet', 'cold'],
    unfavorableConditions: ['dry'],
    biologicalReason: 'Potato Late Blight is devastating in cool humid cloudy conditions; inhibited completely above 30°C.',
  },
  'potato-early-blight': {
    validStages: ['vegetative', 'flowering', 'fruiting', 'maturity'],
    optimalStages: ['fruiting', 'maturity'],
    impossibleStages: ['nursery'],
    optimalWeather: ['normal', 'humid'],
    hostileWeather: ['cool_dry'],
    temperatureRange: { min: 24, max: 32, optimal: 28 },
    favorableConditions: ['dry', 'monoculture'],
    biologicalReason: 'Alternaria solani concentric ring target spots develop as lower foliage ages under stress.',
  },
  'potato-black-scurf': {
    validStages: ['nursery', 'vegetative', 'flowering', 'maturity'],
    optimalStages: ['nursery', 'maturity'],
    impossibleStages: [],
    optimalWeather: ['cool_dry', 'normal'],
    hostileWeather: ['hot_dry'],
    temperatureRange: { min: 14, max: 24, optimal: 18 },
    favorableConditions: ['wet', 'cold', 'poorDrainage'],
    biologicalReason: 'Rhizoctonia solani sclerotia survive on seed tubers in cold wet soils, causing sprout damping and tuber sclerotia.',
  },

  // ───── CHILI ─────
  'chili-thrips': {
    validStages: ['vegetative', 'flowering', 'fruiting', 'maturity'],
    optimalStages: ['vegetative', 'flowering'],
    impossibleStages: ['nursery'],
    optimalWeather: ['hot_dry', 'normal'],
    hostileWeather: ['rainy'],
    temperatureRange: { min: 24, max: 38, optimal: 32 },
    favorableConditions: ['dry', 'pestsNearby'],
    unfavorableConditions: ['wet'],
    biologicalReason: 'Scirtothrips dorsalis feeds on growing tips causing upward leaf curling; washed off by heavy rains.',
  },
  'chili-fruit-rot': {
    validStages: ['fruiting', 'maturity'],
    optimalStages: ['fruiting', 'maturity'],
    impossibleStages: ['nursery', 'vegetative', 'flowering'],
    optimalWeather: ['rainy', 'humid'],
    hostileWeather: ['hot_dry', 'cool_dry'],
    temperatureRange: { min: 25, max: 32, optimal: 28 },
    minHumidityPercent: 80,
    favorableConditions: ['wet', 'poorDrainage'],
    unfavorableConditions: ['dry'],
    biologicalReason: 'Colletotrichum capsici anthracnose forms sunken circular necrotic lesions strictly on ripening chili pods.',
  },
  'chili-leaf-curl-virus': {
    validStages: ['nursery', 'vegetative', 'flowering', 'fruiting'],
    optimalStages: ['vegetative', 'flowering'],
    impossibleStages: ['maturity'],
    optimalWeather: ['hot_dry', 'normal'],
    hostileWeather: ['cool_dry', 'rainy'],
    temperatureRange: { min: 26, max: 38, optimal: 32 },
    favorableConditions: ['dry', 'pestsNearby'],
    unfavorableConditions: ['wet'],
    biologicalReason: 'Begomovirus downward curling and puckering vectored by whiteflies in warm dry conditions.',
  },
};

/**
 * Evaluate biological possibility and calculate prior probability multiplier.
 */
export function evaluateAgronomicPriors(params: {
  diseaseId: string;
  cropStage?: CropStage;
  weather?: WeatherId | null;
  conditions?: Condition[];
  sensorInput?: SensorInput | null;
}): PriorEvaluationResult {
  const { diseaseId, cropStage, weather, conditions = [], sensorInput } = params;
  const constraint = AGRONOMIC_DISEASE_CONSTRAINTS[diseaseId];

  // If no constraint defined for disease, return neutral prior
  if (!constraint) {
    return {
      isBiologicallyPossible: true,
      priorMultiplier: 1.0,
      stageCompatibility: 'compatible',
      weatherCompatibility: 'favorable',
      agronomicReasoning: 'Neutral agronomic prior applied (disease without specific phenological constraint).',
    };
  }

  let stageCompat: PriorEvaluationResult['stageCompatibility'] = 'compatible';
  let weatherCompat: PriorEvaluationResult['weatherCompatibility'] = 'favorable';
  let multiplier = 1.0;
  const reasons: string[] = [];

  // 1. Phenological Growth Stage Evaluation
  if (cropStage) {
    if (constraint.impossibleStages.includes(cropStage)) {
      stageCompat = 'impossible';
      multiplier *= 0.05; // 95% penalty for biologically impossible stage
      reasons.push(
        `Biologically impossible at ${cropStage} stage: ${constraint.biologicalReason}`
      );
    } else if (constraint.optimalStages.includes(cropStage)) {
      stageCompat = 'optimal';
      multiplier *= 1.25; // 25% boost for peak vulnerability stage
      reasons.push(`Optimal vulnerability: plant is at peak susceptible ${cropStage} stage.`);
    } else if (!constraint.validStages.includes(cropStage)) {
      stageCompat = 'improbable';
      multiplier *= 0.25;
      reasons.push(`Improbable at ${cropStage} stage.`);
    } else {
      stageCompat = 'compatible';
    }
  }

  // 2. Weather & Temperature Evaluation
  if (weather) {
    if (constraint.hostileWeather.includes(weather)) {
      weatherCompat = 'hostile';
      multiplier *= 0.15; // 85% penalty for adverse ambient microclimate
      reasons.push(`Microclimate suppression: ${weather} ambient weather inhibits pathogen proliferation.`);
    } else if (constraint.optimalWeather.includes(weather)) {
      weatherCompat = 'optimal';
      multiplier *= 1.2; // 20% boost for favorable microclimate
      reasons.push(`Microclimate alignment: ambient ${weather} conditions actively support pathogen sporulation.`);
    }
  }

  // 3. Sensor Input Evaluation (Live IoT telemetry)
  if (sensorInput) {
    // Temperature bounds check
    if (constraint.temperatureRange) {
      const { min, max, optimal } = constraint.temperatureRange;
      const temp = sensorInput.ambientTemp;
      if (temp < min - 4 || temp > max + 5) {
        multiplier *= 0.25;
        reasons.push(`Temperature out of bounds: canopy temp (${temp}°C) outside viable pathogen range (${min}-${max}°C).`);
      } else if (Math.abs(temp - optimal) <= 3) {
        multiplier *= 1.15;
        reasons.push(`Optimal thermal condition: canopy temp (${temp}°C) matches pathogen optimum (${optimal}°C).`);
      }
    }

    // Humidity check
    if (constraint.minHumidityPercent) {
      if (sensorInput.relativeHumidity < constraint.minHumidityPercent - 15) {
        multiplier *= 0.35;
        reasons.push(`Insufficient humidity: ${sensorInput.relativeHumidity}% RH below required spore germination threshold (${constraint.minHumidityPercent}% RH).`);
      } else if (sensorInput.relativeHumidity >= constraint.minHumidityPercent) {
        multiplier *= 1.15;
      }
    }
  }

  // 4. Field Condition Modifiers
  if (conditions.length > 0) {
    if (constraint.favorableConditions?.some((c) => conditions.includes(c))) {
      multiplier *= 1.1;
    }
    if (constraint.unfavorableConditions?.some((c) => conditions.includes(c))) {
      multiplier *= 0.7;
    }
  }

  // Clamp multiplier to [0.05, 1.35]
  multiplier = Math.max(0.05, Math.min(1.35, Math.round(multiplier * 100) / 100));
  const isBiologicallyPossible = stageCompat !== 'impossible' && multiplier > 0.1;

  const summaryReason =
    reasons.length > 0
      ? reasons.join(' ')
      : `Agronomically compatible with observed ${cropStage || 'current'} stage and microclimate.`;

  return {
    isBiologicallyPossible,
    priorMultiplier: multiplier,
    stageCompatibility: stageCompat,
    weatherCompatibility: weatherCompat,
    agronomicReasoning: summaryReason,
  };
}
