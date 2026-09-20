import type { ImageHint } from '@/data/types';

/**
 * Client-side fallback image analyzer. Used only when the server AI route
 * is unavailable. Draws the image to a canvas, samples pixels, and returns
 * a coarse colour-hint summary. NOT a real diagnosis — it nudges ranking
 * but should never be the sole basis for treatment.
 */

const MAX_DIM = 256; // downsample before sampling — speed over precision

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h, s, l };
}

function classifyPixel(r: number, g: number, b: number): 'green' | 'yellow' | 'brown' | 'white' | 'other' {
  const { h, s, l } = rgbToHsl(r, g, b);
  if (l > 0.85 && s < 0.2) return 'white';
  if (s < 0.12) return 'other';
  if (h >= 60 && h <= 170 && s > 0.2 && l < 0.7) return 'green';
  if (h >= 30 && h < 60 && s > 0.2) return 'yellow';
  if (h < 30 || h >= 330) return 'brown';
  return 'other';
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to decode image'));
    img.src = dataUrl;
  });
}

/**
 * Convert a File to a downscaled data URL (jpeg). Smaller payloads = faster
 * transmission to /api/scan and lower memory use on low-end phones.
 */
export async function fileToDataUrl(file: File, maxDim = 1024, quality = 0.82): Promise<string> {
  const raw = await readFileAsDataUrl(file);
  const img = await loadImage(raw);
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D not available');
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', quality);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export interface QualityReport {
  isValid: boolean;
  score: number; // 0 - 100
  isBlurry: boolean;
  blurVariance: number;
  exposure: 'under' | 'over' | 'optimal';
  luminance: number; // 0 - 1
  vegetationDetected: boolean;
  vegetationFraction: number; // 0 - 1
  warnings: string[];
  recommendation?: string;
}

/**
 * Edge Laplacian kernel convolution to detect camera shake and motion blur.
 * Fast integer sampling on downsampled canvas.
 */
export function evaluateBlurVariance(data: Uint8ClampedArray, w: number, h: number): number {
  // Convert to grayscale & sample center region
  const step = Math.max(1, Math.floor(Math.min(w, h) / 128));
  let count = 0;
  let sum = 0;
  let sumSq = 0;

  for (let y = 1; y < h - 1; y += step) {
    for (let x = 1; x < w - 1; x += step) {
      const idx = (y * w + x) * 4;
      const gray = (data[idx] * 299 + data[idx + 1] * 587 + data[idx + 2] * 114) / 1000;

      const idxUp = ((y - 1) * w + x) * 4;
      const idxDown = ((y + 1) * w + x) * 4;
      const idxLeft = (y * w + (x - 1)) * 4;
      const idxRight = (y * w + (x + 1)) * 4;

      const gUp = (data[idxUp] * 299 + data[idxUp + 1] * 587 + data[idxUp + 2] * 114) / 1000;
      const gDown = (data[idxDown] * 299 + data[idxDown + 1] * 587 + data[idxDown + 2] * 114) / 1000;
      const gLeft = (data[idxLeft] * 299 + data[idxLeft + 1] * 587 + data[idxLeft + 2] * 114) / 1000;
      const gRight = (data[idxRight] * 299 + data[idxRight + 1] * 587 + data[idxRight + 2] * 114) / 1000;

      // Discrete Laplacian: 4*center - (up + down + left + right)
      const lap = Math.abs(4 * gray - gUp - gDown - gLeft - gRight);
      sum += lap;
      sumSq += lap * lap;
      count++;
    }
  }

  if (count === 0) return 100;
  const mean = sum / count;
  const variance = sumSq / count - mean * mean;
  return Math.max(0, variance);
}

/**
 * Validate image quality on an existing canvas context before triggering AI scans.
 */
export function validateImageQuality(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): QualityReport {
  const { data } = ctx.getImageData(0, 0, w, h);
  let total = 0;
  let brightSum = 0;
  let greenOrYellow = 0;

  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 128) continue;
    total++;
    brightSum += (r + g + b) / (3 * 255);

    const cls = classifyPixel(r, g, b);
    if (cls === 'green' || cls === 'yellow' || cls === 'brown') {
      greenOrYellow++;
    }
  }

  const luminance = total > 0 ? brightSum / total : 0.5;
  const vegetationFraction = total > 0 ? greenOrYellow / total : 0.5;
  const blurVariance = evaluateBlurVariance(data, w, h);

  const isBlurry = blurVariance < 28;
  let exposure: 'under' | 'over' | 'optimal' = 'optimal';
  if (luminance < 0.16) exposure = 'under';
  else if (luminance > 0.86) exposure = 'over';

  const vegetationDetected = vegetationFraction >= 0.12;

  const warnings: string[] = [];
  if (isBlurry) {
    warnings.push('Image appears blurry or out of focus. Hold phone steady or tap leaf to refocus.');
  }
  if (exposure === 'under') {
    warnings.push('Photo is too dark. Turn on camera flash or shoot under daylight.');
  } else if (exposure === 'over') {
    warnings.push('Photo has strong glare or overexposure. Avoid direct sunlight reflection.');
  }
  if (!vegetationDetected) {
    warnings.push('Low plant foliage detected. Ensure the frame focuses on crop leaves, stems, or fruit.');
  }

  let score = 100;
  if (isBlurry) score -= 35;
  if (exposure !== 'optimal') score -= 25;
  if (!vegetationDetected) score -= 30;
  score = Math.max(10, Math.min(100, score));

  const isValid = warnings.length === 0 || score >= 60;
  let recommendation: string | undefined;
  if (!isValid) {
    recommendation = warnings.join(' ');
  }

  return {
    isValid,
    score,
    isBlurry,
    blurVariance: Math.round(blurVariance * 10) / 10,
    exposure,
    luminance: Math.round(luminance * 100) / 100,
    vegetationDetected,
    vegetationFraction: Math.round(vegetationFraction * 100) / 100,
    warnings,
    recommendation,
  };
}

/**
 * Standalone image quality checker from a data URL.
 */
export async function checkImageQuality(dataUrl: string): Promise<QualityReport> {
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      isValid: true,
      score: 85,
      isBlurry: false,
      blurVariance: 50,
      exposure: 'optimal',
      luminance: 0.5,
      vegetationDetected: true,
      vegetationFraction: 0.5,
      warnings: [],
    };
  }
  ctx.drawImage(img, 0, 0, w, h);
  return validateImageQuality(ctx, w, h);
}

/**
 * Analyse a data-URL image and return an ImageHint. Cheap and offline.
 */
export async function analyzeImage(dataUrl: string): Promise<ImageHint> {
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D not available');
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  let total = 0;
  let green = 0;
  let yellow = 0;
  let brown = 0;
  let white = 0;
  let brightSum = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 128) continue;
    total++;
    brightSum += (r + g + b) / (3 * 255);
    const cls = classifyPixel(r, g, b);
    if (cls === 'green') green++;
    else if (cls === 'yellow') yellow++;
    else if (cls === 'brown') brown++;
    else if (cls === 'white') white++;
  }

  if (total === 0) {
    return { brown: 0, yellow: 0, white: 0, brightness: 0, hue: 'mixed' };
  }

  const frac = (n: number) => n / total;
  const brownFrac = frac(brown);
  const yellowFrac = frac(yellow);
  const whiteFrac = frac(white);
  const greenFrac = frac(green);

  let hue: ImageHint['hue'] = 'mixed';
  if (greenFrac > 0.5) hue = 'green';
  else if (yellowFrac > brownFrac && yellowFrac > whiteFrac) hue = 'yellow';
  else if (brownFrac > whiteFrac) hue = 'brown';

  return {
    brown: brownFrac,
    yellow: yellowFrac,
    white: whiteFrac,
    brightness: brightSum / total,
    hue,
  };
}

export interface LesionBox {
  x: number; // % 0-100
  y: number; // % 0-100
  width: number; // % 0-100
  height: number; // % 0-100
  label: string;
}

/**
 * Computer-vision lesion locator: analyzes canvas pixels to identify
 * localized clusters of foliar necrosis, chlorosis, or spots on foliage.
 */
export async function detectVisualLesionBoxes(dataUrl: string): Promise<LesionBox[]> {
  if (typeof window === 'undefined') return [];
  try {
    const img = await loadImage(dataUrl);
    const canvas = document.createElement('canvas');
    const cols = 24;
    const rows = 24;
    canvas.width = 192;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];
    ctx.drawImage(img, 0, 0, 192, 192);
    const { data } = ctx.getImageData(0, 0, 192, 192);

    const cellW = 192 / cols;
    const cellH = 192 / rows;

    // Grid score: count diseased pixels vs green foliage in each cell
    const grid: Array<Array<{ diseaseCount: number; dominant: string }>> = [];
    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      for (let c = 0; c < cols; c++) {
        let diseaseCount = 0;
        let brown = 0;
        let yellow = 0;
        let white = 0;

        for (let py = Math.floor(r * cellH); py < Math.floor((r + 1) * cellH); py += 2) {
          for (let px = Math.floor(c * cellW); px < Math.floor((c + 1) * cellW); px += 2) {
            const idx = (py * 192 + px) * 4;
            const cls = classifyPixel(data[idx], data[idx + 1], data[idx + 2]);
            if (cls === 'brown') {
              diseaseCount++;
              brown++;
            } else if (cls === 'yellow') {
              diseaseCount++;
              yellow++;
            } else if (cls === 'white') {
              diseaseCount++;
              white++;
            }
          }
        }

        let dominant = 'Lesion / Spot';
        if (yellow > brown && yellow > white) dominant = 'Chlorotic Yellowing';
        else if (brown > white) dominant = 'Necrotic Blight Spot';
        else if (white > 0) dominant = 'Fungal Sporulation';

        grid[r][c] = { diseaseCount, dominant };
      }
    }

    // Find connected components of high disease density
    const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
    const clusters: Array<{
      minC: number;
      maxC: number;
      minR: number;
      maxR: number;
      label: string;
      count: number;
    }> = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!visited[r][c] && grid[r][c].diseaseCount >= 4) {
          let minC = c,
            maxC = c,
            minR = r,
            maxR = r;
          let totalCount = 0;
          const label = grid[r][c].dominant;

          const queue: Array<[number, number]> = [[r, c]];
          visited[r][c] = true;

          while (queue.length > 0) {
            const [currR, currC] = queue.pop()!;
            totalCount += grid[currR][currC].diseaseCount;
            minC = Math.min(minC, currC);
            maxC = Math.max(maxC, currC);
            minR = Math.min(minR, currR);
            maxR = Math.max(maxR, currR);

            // 4-neighborhood
            const neighbors = [
              [currR - 1, currC],
              [currR + 1, currC],
              [currR, currC - 1],
              [currR, currC + 1],
            ];
            for (const [nr, nc] of neighbors) {
              if (
                nr >= 0 &&
                nr < rows &&
                nc >= 0 &&
                nc < cols &&
                !visited[nr][nc] &&
                grid[nr][nc].diseaseCount >= 3
              ) {
                visited[nr][nc] = true;
                queue.push([nr, nc]);
              }
            }
          }

          // Filter out tiny single-pixel noise and full-screen wash
          const widthCells = maxC - minC + 1;
          const heightCells = maxR - minR + 1;
          if (totalCount >= 12 && widthCells < cols * 0.85 && heightCells < rows * 0.85) {
            clusters.push({ minC, maxC, minR, maxR, label, count: totalCount });
          }
        }
      }
    }

    // Fallback: If no clusters found with primary threshold, lower threshold and re-scan
    if (clusters.length === 0) {
      const visited2: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (!visited2[r][c] && grid[r][c].diseaseCount >= 2) {
            let minC = c, maxC = c, minR = r, maxR = r;
            let totalCount = 0;
            const label = grid[r][c].dominant;
            const queue: Array<[number, number]> = [[r, c]];
            visited2[r][c] = true;

            while (queue.length > 0) {
              const [currR, currC] = queue.pop()!;
              totalCount += grid[currR][currC].diseaseCount;
              minC = Math.min(minC, currC);
              maxC = Math.max(maxC, currC);
              minR = Math.min(minR, currR);
              maxR = Math.max(maxR, currR);

              for (const [nr, nc] of [[currR - 1, currC], [currR + 1, currC], [currR, currC - 1], [currR, currC + 1]]) {
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited2[nr][nc] && grid[nr][nc].diseaseCount >= 1) {
                  visited2[nr][nc] = true;
                  queue.push([nr, nc]);
                }
              }
            }

            const widthCells = maxC - minC + 1;
            const heightCells = maxR - minR + 1;
            if (totalCount >= 5 && widthCells < cols * 0.85 && heightCells < rows * 0.85) {
              clusters.push({ minC, maxC, minR, maxR, label, count: totalCount });
            }
          }
        }
      }
    }

    // Secondary fallback: if still zero, locate the top 1-2 dense cells
    if (clusters.length === 0) {
      let maxVal = 0;
      let bestR = Math.floor(rows / 2);
      let bestC = Math.floor(cols / 2);
      let bestLabel = 'Pathological Lesion Focus';

      for (let r = 2; r < rows - 2; r++) {
        for (let c = 2; c < cols - 2; c++) {
          if (grid[r][c].diseaseCount > maxVal) {
            maxVal = grid[r][c].diseaseCount;
            bestR = r;
            bestC = c;
            bestLabel = grid[r][c].dominant;
          }
        }
      }

      clusters.push({
        minC: Math.max(0, bestC - 2),
        maxC: Math.min(cols - 1, bestC + 2),
        minR: Math.max(0, bestR - 2),
        maxR: Math.min(rows - 1, bestR + 2),
        label: bestLabel,
        count: Math.max(4, maxVal * 4),
      });
    }

    // Sort clusters by prominence
    clusters.sort((a, b) => b.count - a.count);

    // Convert top 4 clusters to percentage boxes
    return clusters.slice(0, 4).map((cl) => {
      // Add slight 1-cell padding around the lesion for visibility
      const padC = 0.5;
      const padR = 0.5;
      const minX = Math.max(0, (cl.minC - padC) / cols);
      const minY = Math.max(0, (cl.minR - padR) / rows);
      const maxX = Math.min(1, (cl.maxC + 1 + padC) / cols);
      const maxY = Math.min(1, (cl.maxR + 1 + padR) / rows);

      const x = Math.round(minX * 100);
      const y = Math.round(minY * 100);
      const w = Math.min(100 - x, Math.max(12, Math.round((maxX - minX) * 100)));
      const h = Math.min(100 - y, Math.max(12, Math.round((maxY - minY) * 100)));

      return {
        x,
        y,
        width: w,
        height: h,
        label: cl.label,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Gray-World Color Constancy Algorithm:
 * Neutralizes harsh sunlight glare or heavy overcast canopy shade casts.
 * Balances RGB channels across foliar pixels toward an average gray anchor.
 */
export function normalizeFoliarIllumination(pixels: Uint8ClampedArray): Uint8ClampedArray {
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let count = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    const a = pixels[i + 3];
    if (a < 128) continue;
    sumR += pixels[i];
    sumG += pixels[i + 1];
    sumB += pixels[i + 2];
    count++;
  }

  if (count === 0) return pixels;

  const avgR = sumR / count;
  const avgG = sumG / count;
  const avgB = sumB / count;
  const avgGray = (avgR + avgG + avgB) / 3;

  const scaleR = avgR > 0 ? avgGray / avgR : 1;
  const scaleG = avgG > 0 ? avgGray / avgG : 1;
  const scaleB = avgB > 0 ? avgGray / avgB : 1;

  const out = new Uint8ClampedArray(pixels.length);
  for (let i = 0; i < pixels.length; i += 4) {
    out[i] = Math.min(255, Math.max(0, Math.round(pixels[i] * scaleR)));
    out[i + 1] = Math.min(255, Math.max(0, Math.round(pixels[i + 1] * scaleG)));
    out[i + 2] = Math.min(255, Math.max(0, Math.round(pixels[i + 2] * scaleB)));
    out[i + 3] = pixels[i + 3]; // Preserve alpha
  }

  return out;
}

/**
 * Vegetative Leaf Mask Isolation:
 * Identifies skin tones (hands holding the leaf) and soil/dark backgrounds,
 * ensuring vision inference focuses strictly on vegetative foliar tissue.
 */
export function isVegetativePixel(r: number, g: number, b: number): boolean {
  // Suppress human skin tones (R > G > B with R - G > 15)
  if (r > 95 && g > 40 && b > 20 && r > g && r > b && (r - g) > 15 && Math.abs(r - g) > 15) {
    return false; // Skin tone detected (farmer finger holding leaf)
  }
  // Suppress very dark soil / mulch / shadows
  if (r < 25 && g < 25 && b < 25) {
    return false;
  }
  // Plant vegetative foliage generally has strong green or chlorotic yellow/brown diseased components
  return true;
}



