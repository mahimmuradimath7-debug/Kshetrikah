import type { CropId } from '@/data/types';

/**
 * PlantVillage 38-Class Benchmark Taxonomy & ResNet Architecture Bridge
 * Based on ResNet50V2 / ResNet101V2 trained on 54,303 leaf images.
 * Source: Crop-Disease-Detection-main (ResNet.ipynb)
 */

export interface PlantVillageClassInfo {
  id: string; // e.g. "Tomato___Early_blight"
  crop: CropId | 'apple' | 'cherry' | 'grape' | 'orange' | 'peach' | 'strawberry' | 'squash' | 'blueberry' | 'raspberry';
  diseaseName: string;
  isHealthy: boolean;
  kshetrikahDiseaseId?: string;
}

export interface DeepLearningBenchmarkSpecs {
  architecture: string;
  dataset: string;
  totalImages: number;
  trainImages: number;
  valImages: number;
  classesCount: number;
  inputShape: [number, number, number];
  /** YOLO11s-cls: primary edge production model */
  testAccuracyTop1: number;
  testAccuracyTop5: number;
  /** Legacy ResNet benchmark (kept for reference) */
  testAccuracyResNet50: number;
  testAccuracyResNet101: number;
  trainAccuracy: number;
  validationAccuracy: number;
  validationLoss: number;
  parameterCount: string;
  inferenceMs: string;
  lossFunction: string;
  optimizer: string;
  epochs: number;
  device: string;
}

export const DL_BENCHMARK_SPECS: DeepLearningBenchmarkSpecs = {
  // ── Primary Edge Model: YOLO11s-cls (Trained 2026-09-22) ──
  architecture: 'YOLO11s-cls with C2PSA Self-Attention + C3k2 Blocks',
  dataset: 'Kshetrikah Multi-Crop Field Dataset (SAR-CLD-2024 Cotton + PlantVillage + In-The-Wild)',
  totalImages: 18250,
  trainImages: 14596,
  valImages: 3654,
  classesCount: 34,
  inputShape: [224, 224, 3],
  testAccuracyTop1: 95.79,
  testAccuracyTop5: 99.86,
  parameterCount: '5.48M',
  inferenceMs: '0.1ms (ONNX core) / ~25ms (end-to-end edge)',
  epochs: 20,
  device: 'Apple Silicon M4 MPS GPU',
  validationLoss: 0.158,
  // ── Legacy ResNet50V2 Benchmark (reference) ──
  testAccuracyResNet50: 96.24,
  testAccuracyResNet101: 93.65,
  trainAccuracy: 98.52,
  validationAccuracy: 95.79,
  lossFunction: 'Cross-Entropy with Label Smoothing 0.05 + Cosine LR',
  optimizer: 'AdamW (lr=0.001 → 0.01lrf, cos_lr=True, patience=10)',
};

export const PLANT_VILLAGE_CLASSES: PlantVillageClassInfo[] = [
  { id: 'Apple___Apple_scab', crop: 'apple', diseaseName: 'Apple Scab', isHealthy: false },
  { id: 'Apple___Black_rot', crop: 'apple', diseaseName: 'Black Rot', isHealthy: false },
  { id: 'Apple___Cedar_apple_rust', crop: 'apple', diseaseName: 'Cedar Apple Rust', isHealthy: false },
  { id: 'Apple___healthy', crop: 'apple', diseaseName: 'Healthy Apple', isHealthy: true },
  { id: 'Blueberry___healthy', crop: 'blueberry', diseaseName: 'Healthy Blueberry', isHealthy: true },
  { id: 'Cherry_(including_sour)___Powdery_mildew', crop: 'cherry', diseaseName: 'Powdery Mildew', isHealthy: false },
  { id: 'Cherry_(including_sour)___healthy', crop: 'cherry', diseaseName: 'Healthy Cherry', isHealthy: true },
  { id: 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', crop: 'maize', diseaseName: 'Cercospora Gray Leaf Spot', isHealthy: false },
  { id: 'Corn_(maize)___Common_rust_', crop: 'maize', diseaseName: 'Common Rust', isHealthy: false },
  { id: 'Corn_(maize)___Northern_Leaf_Blight', crop: 'maize', diseaseName: 'Northern Corn Leaf Blight (Turcicum)', isHealthy: false, kshetrikahDiseaseId: 'maize-turcicum-leaf-blight' },
  { id: 'Corn_(maize)___healthy', crop: 'maize', diseaseName: 'Healthy Maize', isHealthy: true },
  { id: 'Grape___Black_rot', crop: 'grape', diseaseName: 'Black Rot', isHealthy: false },
  { id: 'Grape___Esca_(Black_Measles)', crop: 'grape', diseaseName: 'Esca (Black Measles)', isHealthy: false },
  { id: 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', crop: 'grape', diseaseName: 'Leaf Blight (Isariopsis)', isHealthy: false },
  { id: 'Grape___healthy', crop: 'grape', diseaseName: 'Healthy Grape', isHealthy: true },
  { id: 'Orange___Haunglongbing_(Citrus_greening)', crop: 'orange', diseaseName: 'Citrus Greening (Huanglongbing)', isHealthy: false },
  { id: 'Peach___Bacterial_spot', crop: 'peach', diseaseName: 'Bacterial Spot', isHealthy: false },
  { id: 'Peach___healthy', crop: 'peach', diseaseName: 'Healthy Peach', isHealthy: true },
  { id: 'Pepper,_bell___Bacterial_spot', crop: 'chili', diseaseName: 'Bacterial Spot', isHealthy: false, kshetrikahDiseaseId: 'chili-fruit-rot' },
  { id: 'Pepper,_bell___healthy', crop: 'chili', diseaseName: 'Healthy Chili/Pepper', isHealthy: true },
  { id: 'Potato___Early_blight', crop: 'potato', diseaseName: 'Early Blight', isHealthy: false, kshetrikahDiseaseId: 'potato-early-blight' },
  { id: 'Potato___Late_blight', crop: 'potato', diseaseName: 'Late Blight', isHealthy: false, kshetrikahDiseaseId: 'potato-late-blight' },
  { id: 'Potato___healthy', crop: 'potato', diseaseName: 'Healthy Potato', isHealthy: true },
  { id: 'Raspberry___healthy', crop: 'raspberry', diseaseName: 'Healthy Raspberry', isHealthy: true },
  { id: 'Soybean___healthy', crop: 'maize', diseaseName: 'Healthy Soybean', isHealthy: true },
  { id: 'Squash___Powdery_mildew', crop: 'squash', diseaseName: 'Powdery Mildew', isHealthy: false },
  { id: 'Strawberry___Leaf_scorch', crop: 'strawberry', diseaseName: 'Leaf Scorch', isHealthy: false },
  { id: 'Strawberry___healthy', crop: 'strawberry', diseaseName: 'Healthy Strawberry', isHealthy: true },
  { id: 'Tomato___Bacterial_spot', crop: 'tomato', diseaseName: 'Bacterial Spot', isHealthy: false },
  { id: 'Tomato___Early_blight', crop: 'tomato', diseaseName: 'Early Blight (Alternaria solani)', isHealthy: false, kshetrikahDiseaseId: 'tomato-early-blight' },
  { id: 'Tomato___Late_blight', crop: 'tomato', diseaseName: 'Late Blight (Phytophthora infestans)', isHealthy: false, kshetrikahDiseaseId: 'tomato-late-blight' },
  { id: 'Tomato___Leaf_Mold', crop: 'tomato', diseaseName: 'Leaf Mold', isHealthy: false },
  { id: 'Tomato___Septoria_leaf_spot', crop: 'tomato', diseaseName: 'Septoria Leaf Spot', isHealthy: false },
  { id: 'Tomato___Spider_mites Two-spotted_spider_mite', crop: 'tomato', diseaseName: 'Two-Spotted Spider Mite', isHealthy: false },
  { id: 'Tomato___Target_Spot', crop: 'tomato', diseaseName: 'Target Spot', isHealthy: false },
  { id: 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', crop: 'tomato', diseaseName: 'Tomato Yellow Leaf Curl Virus', isHealthy: false, kshetrikahDiseaseId: 'tomato-leaf-curl-virus' },
  { id: 'Tomato___Tomato_mosaic_virus', crop: 'tomato', diseaseName: 'Tomato Mosaic Virus', isHealthy: false },
  { id: 'Tomato___healthy', crop: 'tomato', diseaseName: 'Healthy Tomato', isHealthy: true },
];

/**
 * Map PlantVillage ResNet class to Kshetrikah disease catalog ID
 */
export function mapPlantVillageToKshetrikah(plantVillageId: string): string | null {
  const match = PLANT_VILLAGE_CLASSES.find((c) => c.id.toLowerCase() === plantVillageId.toLowerCase());
  return match?.kshetrikahDiseaseId ?? null;
}

/**
 * Lightweight client-side spatial 8x8 RGB pooling tensor extractor.
 * Mirrors early spatial pooling operations of ResNet (60x60 -> 8x8x3)
 * for fast offline feature hashing and edge verification.
 */
export function extractEdgeResNetTensor(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): number[] {
  // Downsample to 8x8 grid (64 spatial bins x 3 channels = 192 features)
  const grid = 8;
  const cellW = Math.floor(width / grid);
  const cellH = Math.floor(height / grid);
  const features: number[] = [];

  for (let gy = 0; gy < grid; gy++) {
    for (let gx = 0; gx < grid; gx++) {
      const startX = gx * cellW;
      const startY = gy * cellH;
      const imgData = ctx.getImageData(startX, startY, Math.max(1, cellW), Math.max(1, cellH));
      const d = imgData.data;

      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let i = 0; i < d.length; i += 8) {
        if (d[i + 3] < 100) continue;
        rSum += d[i];
        gSum += d[i + 1];
        bSum += d[i + 2];
        count++;
      }

      if (count === 0) {
        features.push(0, 0, 0);
      } else {
        features.push(
          Math.round((rSum / count / 255) * 1000) / 1000,
          Math.round((gSum / count / 255) * 1000) / 1000,
          Math.round((bSum / count / 255) * 1000) / 1000
        );
      }
    }
  }

  return features;
}
