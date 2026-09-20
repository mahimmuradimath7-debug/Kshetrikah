import { diseases } from './diseases';
import type { CropId, SymptomType, PlantPart, Condition, Disease } from './types';

export interface DiagnosisInput {
  crop: CropId;
  affectedParts: PlantPart[];
  symptomTypes: SymptomType[];
  conditions: Condition[];
}

export interface DiagnosisResult {
  disease: Disease;
  score: number; // 0–1
  matches: number; // total criteria matched
  total: number; // total criteria considered
}

/**
 * Score each disease against the user's inputs.
 *
 * The scoring is a weighted sum:
 *   - Each matched `affectedPart` counts
 *   - Each matched `symptomType` counts more (this is what the farmer actually saw)
 *   - Each matched `condition` counts (risk multiplier)
 *
 * We normalize against a maximum so the result is a 0–1 confidence.
 */
export function diagnose(input: DiagnosisInput): DiagnosisResult[] {
  const candidates = diseases.filter((d) => d.crop === input.crop);
  if (candidates.length === 0) return [];

  const SYMPTOM_WEIGHT = 3;
  const PART_WEIGHT = 1.5;
  const CONDITION_WEIGHT = 1;
  const MAX_PER_DISEASE =
    SYMPTOM_WEIGHT * 3 + PART_WEIGHT * 2 + CONDITION_WEIGHT * 2;

  const results: DiagnosisResult[] = candidates.map((disease) => {
    let score = 0;
    let matches = 0;

    // Symptoms — most important
    for (const s of input.symptomTypes) {
      if (disease.symptomTypes.includes(s)) {
        score += SYMPTOM_WEIGHT;
        matches++;
      }
    }
    // Affected parts
    for (const p of input.affectedParts) {
      if (disease.affectedParts.includes(p)) {
        score += PART_WEIGHT;
        matches++;
      }
    }
    // Conditions — risk factors
    for (const c of input.conditions) {
      if (disease.conditions.includes(c)) {
        score += CONDITION_WEIGHT;
        matches++;
      }
    }

    return {
      disease,
      score: Math.min(1, score / MAX_PER_DISEASE),
      matches,
      total:
        input.symptomTypes.length +
        input.affectedParts.length +
        input.conditions.length,
    };
  });

  // Sort by score desc, then keep meaningful results only
  return results
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
