import { readFileSync } from 'node:fs';
import path from 'node:path';

export interface CropRecommendationInput {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

export interface CropRecommendationResult {
  label: string;
  confidence: number;
  input: CropRecommendationInput;
}

export interface FertilizerRecommendationInput {
  temperature: number;
  humidity: number;
  moisture: number;
  soilType: string;
  cropType: string;
  nitrogen: number;
  potassium: number;
  phosphorous: number;
}

export interface FertilizerRecommendationResult {
  name: string;
  score: number;
  input: FertilizerRecommendationInput;
}

type CropCsvRow = {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  label: string;
};

type FertilizerCsvRow = {
  Temparature: number;
  Humidity: number;
  Moisture: number;
  'Soil Type': string;
  'Crop Type': string;
  Nitrogen: number;
  Potassium: number;
  Phosphorous: number;
  'Fertilizer Name': string;
};

function readCsvFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

function parseCsvRows(csvText: string): string[][] {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  return lines.map((line) => {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    cells.push(current.trim());
    return cells;
  });
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function parseNumber(value: string | undefined): number {
  const parsed = Number(value ?? '');
  return Number.isFinite(parsed) ? parsed : 0;
}

function scoreConfidence(distance: number, featureCount: number): number {
  const maxDistance = Math.sqrt(featureCount) * 120;
  const normalized = Math.max(0, 1 - distance / Math.max(maxDistance, 1));
  return Number((Math.max(0.55, normalized) * 100).toFixed(2)) / 100;
}

function toTitleCase(input: string): string {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function computeEuclideanDistance(a: number[], b: number[]): number {
  let total = 0;
  for (let i = 0; i < a.length; i += 1) {
    const diff = a[i] - b[i];
    total += diff * diff;
  }
  return Math.sqrt(total);
}

function getCropDataset(): CropCsvRow[] {
  const rows = parseCsvRows(readCsvFile('data/Datasets/Crop_recommendation.csv'));
  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeKey);
  return rows.slice(1).map((row) => {
    const entry: Record<string, string> = {};
    headers.forEach((header, index) => {
      entry[header] = row[index] ?? '';
    });

    return {
      N: parseNumber(entry.n),
      P: parseNumber(entry.p),
      K: parseNumber(entry.k),
      temperature: parseNumber(entry.temperature),
      humidity: parseNumber(entry.humidity),
      ph: parseNumber(entry.ph),
      rainfall: parseNumber(entry.rainfall),
      label: (entry.label ?? '').trim().toLowerCase(),
    };
  });
}

function getFertilizerDataset(): FertilizerCsvRow[] {
  const rows = parseCsvRows(readCsvFile('data/Datasets/Fertilizer_recommendation.csv'));
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((row) => {
    const entry: Record<string, string> = {};
    headers.forEach((header, index) => {
      entry[header] = row[index] ?? '';
    });

    const soilType = (entry['Soil Type'] ?? '').trim();
    const cropType = (entry['Crop Type'] ?? '').trim();

    return {
      Temparature: parseNumber(entry['Temparature']),
      Humidity: parseNumber(entry['Humidity ']),
      Moisture: parseNumber(entry['Moisture']),
      'Soil Type': soilType,
      'Crop Type': cropType,
      Nitrogen: parseNumber(entry['Nitrogen']),
      Potassium: parseNumber(entry['Potassium']),
      Phosphorous: parseNumber(entry['Phosphorous']),
      'Fertilizer Name': (entry['Fertilizer Name'] ?? '').trim(),
    };
  });
}

export function recommendCropForSoil(input: CropRecommendationInput): CropRecommendationResult {
  const dataset = getCropDataset();
  if (dataset.length === 0) {
    return {
      label: 'unknown',
      confidence: 0,
      input,
    };
  }

  const candidate = dataset.reduce(
    (best, row) => {
      const current = [
        row.N,
        row.P,
        row.K,
        row.temperature,
        row.humidity,
        row.ph,
        row.rainfall,
      ];
      const target = [
        input.nitrogen,
        input.phosphorus,
        input.potassium,
        input.temperature,
        input.humidity,
        input.ph,
        input.rainfall,
      ];

      const distance = computeEuclideanDistance(current, target);
      if (distance < best.distance) {
        return { row, distance };
      }
      return best;
    },
    { row: dataset[0], distance: Number.POSITIVE_INFINITY }
  );

  return {
    label: candidate.row.label,
    confidence: scoreConfidence(candidate.distance, 7),
    input,
  };
}

export function recommendFertilizerForField(
  input: FertilizerRecommendationInput
): FertilizerRecommendationResult {
  const dataset = getFertilizerDataset();
  if (dataset.length === 0) {
    return {
      name: 'No recommendation available',
      score: 0,
      input,
    };
  }

  const normalizedSoil = toTitleCase(input.soilType.replace(/_/g, ' '));
  const normalizedCrop = toTitleCase(input.cropType.replace(/_/g, ' '));

  const candidate = dataset.reduce(
    (best, row) => {
      const soilMatch = row['Soil Type'] ? toTitleCase(row['Soil Type']) : '';
      const cropMatch = row['Crop Type'] ? toTitleCase(row['Crop Type']) : '';
      const target = [
        input.temperature,
        input.humidity,
        input.moisture,
        Number(normalizedSoil === soilMatch),
        Number(normalizedCrop === cropMatch),
        input.nitrogen,
        input.potassium,
        input.phosphorous,
      ];
      const current = [
        row.Temparature,
        row.Humidity,
        row.Moisture,
        Number(soilMatch === normalizedSoil),
        Number(cropMatch === normalizedCrop),
        row.Nitrogen,
        row.Potassium,
        row.Phosphorous,
      ];

      const distance = computeEuclideanDistance(current, target);
      if (distance < best.distance) {
        return { row, distance };
      }
      return best;
    },
    { row: dataset[0], distance: Number.POSITIVE_INFINITY }
  );

  return {
    name: candidate.row['Fertilizer Name'],
    score: scoreConfidence(candidate.distance, 8),
    input,
  };
}
