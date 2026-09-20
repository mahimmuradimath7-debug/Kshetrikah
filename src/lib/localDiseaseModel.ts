import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { diseaseMap } from '@/data/diseases';

const execFileAsync = promisify(execFile);

const repoRoot = path.resolve(process.cwd());
const modelCandidates = [
  path.join(repoRoot, 'artifacts', 'resnet50_crop_disease.keras'),
  path.join(repoRoot, 'artifacts', 'resnet50_crop_disease_subset.keras'),
  path.join(repoRoot, 'Crop-Disease-Detection-main', 'artifacts', 'resnet50_crop_disease.keras'),
];

function getPythonExecutable(): string {
  if (process.env.PYTHON_PATH && fs.existsSync(process.env.PYTHON_PATH)) {
    return process.env.PYTHON_PATH;
  }
  const candidates = [
    '/usr/bin/python3',
    '/usr/local/bin/python3',
    '/opt/homebrew/bin/python3',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return 'python3';
}

function getModelPath(): string | null {
  for (const candidate of modelCandidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function getClassNamesPath(modelPath: string): string | null {
  const candidates = [
    path.join(path.dirname(modelPath), 'resnet50_crop_disease_classes.txt'),
    path.join(repoRoot, 'artifacts', 'resnet50_crop_disease_classes.txt'),
    path.join(repoRoot, 'Crop-Disease-Detection-main', 'artifacts', 'resnet50_crop_disease_classes.txt'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function parsePredictionOutput(output: string): { label: string; confidence: number } | null {
  // 1. Try parsing JSON lines first
  for (const line of output.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.prediction && typeof parsed.confidence === 'number') {
          return { label: String(parsed.prediction).trim(), confidence: parsed.confidence };
        }
      } catch {
        // Fall back to line regex
      }
    }
  }

  // 2. Fall back to standard key-value output
  const labelLine = output.split(/\r?\n/).find((line) => line.toLowerCase().startsWith('prediction:'));
  const confidenceLine = output.split(/\r?\n/).find((line) => line.toLowerCase().startsWith('confidence:'));
  if (!labelLine || !confidenceLine) return null;

  const label = labelLine.replace(/^prediction:\s*/i, '').trim();
  const confidence = Number(confidenceLine.replace(/^confidence:\s*/i, '').trim());
  if (!label || Number.isNaN(confidence)) return null;
  return { label, confidence };
}

const CROP_FALLBACK_MAP: Record<string, Record<string, string>> = {
  tomato: {
    'bacterial spot': 'tomato-early-blight',
    'septoria leaf spot': 'tomato-early-blight',
    'leaf mold': 'tomato-early-blight',
    'target spot': 'tomato-early-blight',
    'verticulium wilt': 'tomato-late-blight',
    'mosaic virus': 'tomato-leaf-curl-virus',
    'spider mites': 'tomato-leaf-curl-virus',
    'leaf curl': 'tomato-leaf-curl-virus',
    'yellow leaf curl': 'tomato-leaf-curl-virus',
    'healthy': 'tomato-early-blight',
  },
  potato: {
    'black scurf': 'potato-black-scurf',
    'healthy': 'potato-early-blight',
  },
  rice: {
    'brown spot': 'rice-blast',
    'hispa': 'rice-brown-plant-hopper',
    'neck blast': 'rice-blast',
    'leaf blast': 'rice-blast',
    'healthy': 'rice-blast',
  },
  wheat: {
    'septoria': 'wheat-yellow-rust',
    'stripe rust': 'wheat-yellow-rust',
    'leaf rust': 'wheat-brown-rust',
    'healthy': 'wheat-brown-rust',
  },
  maize: {
    'common rust': 'maize-turcicum-leaf-blight',
    'gray leaf spot': 'maize-turcicum-leaf-blight',
    'northern leaf blight': 'maize-turcicum-leaf-blight',
    'leaf blight': 'maize-turcicum-leaf-blight',
    'streak virus': 'maize-stalk-rot',
    'grasshopper': 'maize-fall-armyworm',
    'leaf beetle': 'maize-fall-armyworm',
    'healthy': 'maize-fall-armyworm',
  },
  cotton: {
    'healthy': 'cotton-pink-bollworm',
  },
  sugarcane: {
    'bacterial blight': 'sugarcane-red-rot',
    'red stripe': 'sugarcane-red-rot',
    'rust': 'sugarcane-red-rot',
    'healthy': 'sugarcane-red-rot',
  },
  chili: {
    'whitefly': 'chili-thrips',
    'yellowish': 'chili-leaf-curl-virus',
    'leaf spot': 'chili-fruit-rot',
    'leaf curl': 'chili-leaf-curl-virus',
    'healthy': 'chili-fruit-rot',
  },
};

function mapLabelToDiseaseId(label: string, crop?: string): string | null {
  const normLabel = label
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

  const cleanedLabel = normLabel
    .replace(/\b(healthy|diseased|disease)\b/g, '')
    .trim();

  const allDiseases = Object.values(diseaseMap);

  // If crop is specified, prioritize matching within that crop
  const pool = crop
    ? [...allDiseases.filter((d) => d.crop === crop), ...allDiseases.filter((d) => d.crop !== crop)]
    : allDiseases;

  for (const d of pool) {
    const normName = d.name.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
    const normId = d.id.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
    const fullWithCrop = `${d.crop} ${normName}`.trim();

    if (normLabel === normName || normLabel === normId || normLabel === fullWithCrop) {
      return d.id;
    }
    if (cleanedLabel && (cleanedLabel === normName || cleanedLabel === fullWithCrop)) {
      return d.id;
    }
  }

  for (const d of pool) {
    const normName = d.name.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
    const normId = d.id.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
    const fullWithCrop = `${d.crop} ${normName}`.trim();

    if (normLabel.includes(normName) || (normName.length > 3 && normName.includes(normLabel))) {
      return d.id;
    }
    if (normLabel.includes(normId) || fullWithCrop.includes(normLabel) || normLabel.includes(fullWithCrop)) {
      return d.id;
    }
    if (cleanedLabel && cleanedLabel.length > 3 && (normName.includes(cleanedLabel) || cleanedLabel.includes(normName))) {
      return d.id;
    }
  }

  if (crop && CROP_FALLBACK_MAP[crop]) {
    const fallbacks = CROP_FALLBACK_MAP[crop];
    for (const [symptom, targetId] of Object.entries(fallbacks)) {
      if (normLabel.includes(symptom)) {
        return targetId;
      }
    }
    // Default fallback to first disease of crop
    const firstOfCrop = allDiseases.find((d) => d.crop === crop);
    if (firstOfCrop) return firstOfCrop.id;
  }

  return null;
}

export async function predictLocalDiseaseFromDataUrl(dataUrl: string, crop: string): Promise<null | { diseaseId: string; confidence: number }> {
  const modelPath = getModelPath();
  if (!modelPath) return null;

  const classNamesPath = getClassNamesPath(modelPath);
  if (!classNamesPath) return null;

  try {
    const commaIndex = dataUrl.indexOf(',');
    const base64Content = commaIndex !== -1 ? dataUrl.slice(commaIndex + 1) : dataUrl;
    if (!base64Content || base64Content.length < 50) return null;

    const buffer = Buffer.from(base64Content, 'base64');
    const tempPath = path.join(os.tmpdir(), `kshetrikah-scan-${Date.now()}-${Math.random().toString(16).slice(2)}.jpg`);
    fs.writeFileSync(tempPath, buffer);

    const pythonBin = getPythonExecutable();
    const scriptPath = path.join(repoRoot, 'Crop-Disease-Detection-main', 'resnet50_inference.py');
    const args = [
      scriptPath,
      '--model_path', modelPath,
      '--image_path', tempPath,
      '--class_names_path', classNamesPath,
      '--json',
    ];
    if (crop) {
      args.push('--crop', crop);
    }

    const result = await execFileAsync(pythonBin, args);

    fs.unlink(tempPath, () => undefined);

    const parsed = parsePredictionOutput(result.stdout + '\n' + result.stderr);
    if (!parsed) return null;

    const diseaseId = mapLabelToDiseaseId(parsed.label, crop);
    if (!diseaseId) return null;

    return {
      diseaseId,
      confidence: Math.max(0.05, Math.min(0.99, parsed.confidence)),
    };
  } catch (error) {
    console.warn('[LocalModel] Unable to run local inference:', error);
    return null;
  }
}
