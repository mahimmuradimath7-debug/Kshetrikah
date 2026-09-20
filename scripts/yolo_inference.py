import os
import sys
import subprocess
from pathlib import Path

# Self-healing Python environment resolver
try:
    from ultralytics import YOLO
except ImportError:
    candidate_pythons = [
        "/Users/mahim/miniconda3/bin/python3",
        "/Users/mahim/anaconda3/bin/python3",
        "/opt/homebrew/bin/python3",
        "/usr/local/bin/python3",
    ]
    for c in candidate_pythons:
        if c != sys.executable and os.path.exists(c):
            try:
                probe = subprocess.run([c, "-c", "import ultralytics"], capture_output=True)
                if probe.returncode == 0:
                    os.execv(c, [c] + sys.argv)
            except Exception:
                pass

import json
import argparse
from PIL import Image
import numpy as np

def resolve_path(path_str: str) -> Path:
    p = Path(path_str)
    if p.exists():
        return p.resolve()
    repo_root = Path(__file__).resolve().parent.parent
    p2 = (repo_root / path_str).resolve()
    if p2.exists():
        return p2
    return p

def detect_lesion_boxes(image_path: str):
    """Vegetative foliar lesion localization using color gradient clustering."""
    try:
        img = Image.open(image_path).convert("RGB")
        img_thumb = img.resize((128, 128))
        rgb = np.asarray(img_thumb, dtype=np.float32)
        r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
        
        is_green = (g > r * 1.05) & (g > b * 1.05) & (g > 40)
        is_brown = (r > 70) & (g > 40) & (b < 80) & (r > g) & ((r - b) > 20)
        is_yellow = (r > 100) & (g > 100) & (b < 80) & (abs(r - g) < 40)
        is_lesion = (is_brown | is_yellow) & ~is_green

        rows, cols = 8, 8
        r_step, c_step = 128 // rows, 128 // cols
        grid = np.zeros((rows, cols), dtype=int)
        for i in range(rows):
            for j in range(cols):
                patch = is_lesion[i * r_step:(i + 1) * r_step, j * c_step:(j + 1) * c_step]
                grid[i, j] = int(np.sum(patch))

        boxes = []
        if np.any(grid > 0):
            best_cy, best_cx = np.unravel_index(np.argmax(grid), grid.shape)
            ymin = int(max(0, (best_cy - 0.5) / rows * 1000))
            xmin = int(max(0, (best_cx - 0.5) / cols * 1000))
            ymax = int(min(1000, (best_cy + 1.5) / rows * 1000))
            xmax = int(min(1000, (best_cx + 1.5) / cols * 1000))
            boxes.append({
                "box_2d": [ymin, xmin, ymax, xmax],
                "label": "Foliar Lesion Hotspot"
            })
        return boxes
    except Exception:
        return []

def main():
    parser = argparse.ArgumentParser(description="Inference with trained YOLO crop disease model.")
    parser.add_argument("--model_path", type=str, required=True, help="Path to .pt or .onnx model.")
    parser.add_argument("--image_path", type=str, required=True, help="Input crop image path.")
    parser.add_argument("--class_names_path", type=str, default=None, help="Optional classes text file.")
    parser.add_argument("--crop", type=str, default=None, help="Optional crop conditioning.")
    parser.add_argument("--json", action="store_true", help="Output in JSON format.")
    args = parser.parse_args()

    model_path = resolve_path(args.model_path)
    img_path = resolve_path(args.image_path)

    if not model_path.exists():
        print(f"Error: Model not found at {model_path}", file=sys.stderr)
        sys.exit(1)
    if not img_path.exists():
        print(f"Error: Image not found at {img_path}", file=sys.stderr)
        sys.exit(1)

    from ultralytics import YOLO
    model = YOLO(str(model_path))

    # Run prediction
    results = model.predict(source=str(img_path), verbose=False)
    if not results or len(results) == 0 or results[0].probs is None:
        print("Error: No classification prediction", file=sys.stderr)
        sys.exit(1)

    probs = results[0].probs
    top1_idx = int(probs.top1)
    top1_conf = float(probs.top1conf)
    names = results[0].names or model.names

    predicted_label = names.get(top1_idx, str(top1_idx))

    # If crop is provided, condition prediction on selected crop
    if args.crop:
        crop_norm = args.crop.lower().strip()
        crop_synonyms = {
            'corn': ['corn', 'maize'],
            'maize': ['corn', 'maize'],
            'chili': ['chili', 'chilli', 'pepper'],
            'pepper': ['chili', 'chilli', 'pepper'],
            'paddy': ['rice', 'paddy'],
            'rice': ['rice', 'paddy'],
        }
        valid_prefixes = crop_synonyms.get(crop_norm, [crop_norm])
        matches_crop = any(p in predicted_label.lower() for p in valid_prefixes)
        if not matches_crop:
            matching_indices = [
                i for i, n in names.items()
                if any(p in n.lower() for p in valid_prefixes)
            ]
            if matching_indices:
                raw_probs = probs.data.cpu().numpy()
                sub_probs = raw_probs[matching_indices]
                best_sub_idx = matching_indices[int(np.argmax(sub_probs))]
                sub_sum = float(np.sum(sub_probs))
                best_conf = float(raw_probs[best_sub_idx]) / (sub_sum + 1e-9) if sub_sum > 0 else float(raw_probs[best_sub_idx])
                predicted_label = names[best_sub_idx]
                top1_conf = min(0.98, max(0.45, best_conf))

    detected_boxes = detect_lesion_boxes(str(img_path))

    if args.json:
        print(json.dumps({
            "prediction": predicted_label,
            "confidence": round(top1_conf, 4),
            "detected_boxes": detected_boxes,
        }))
    else:
        print(f"Prediction: {predicted_label}")
        print(f"Confidence: {top1_conf:.4f}")
        print(f"Detected Boxes: {len(detected_boxes)}")

if __name__ == "__main__":
    main()
