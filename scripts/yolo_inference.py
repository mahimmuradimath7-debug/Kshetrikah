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
    """Vegetative foliar lesion localization using multi-symptom color gradient clustering with NMS."""
    try:
        img = Image.open(image_path).convert("RGB")
        img_thumb = img.resize((160, 160))
        rgb = np.asarray(img_thumb, dtype=np.float32)
        r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
        
        # Suppress human skin tones (hands holding leaf) and extreme specular glare
        is_skin = (r > 95) & (g > 40) & (b > 20) & (r > g) & (r > b) & ((r - g) > 15)
        is_glare = (r > 240) & (g > 240) & (b > 240)
        
        is_green = (g > r * 1.05) & (g > b * 1.05) & (g > 40) & ~is_skin & ~is_glare
        is_brown = (r > 65) & (g > 35) & (b < 85) & (r > g) & ((r - b) > 18) & ~is_skin & ~is_glare
        is_rust = (r > 90) & (g > 45) & (b < 55) & (r > g * 1.25) & ~is_skin & ~is_glare
        is_yellow = (r > 95) & (g > 95) & (b < 85) & (abs(r - g) < 42) & ~is_green & ~is_skin & ~is_glare

        rows, cols = 16, 16
        r_step, c_step = 160 // rows, 160 // cols
        
        candidates = []
        for i in range(rows):
            for j in range(cols):
                patch_brown = np.sum(is_brown[i * r_step:(i + 1) * r_step, j * c_step:(j + 1) * c_step])
                patch_yellow = np.sum(is_yellow[i * r_step:(i + 1) * r_step, j * c_step:(j + 1) * c_step])
                patch_rust = np.sum(is_rust[i * r_step:(i + 1) * r_step, j * c_step:(j + 1) * c_step])
                
                score = patch_brown * 1.3 + patch_rust * 1.4 + patch_yellow * 1.0
                if score >= 8:
                    if patch_rust > patch_brown and patch_rust > patch_yellow:
                        lbl = "Fungal Rust Pustule"
                    elif patch_brown >= patch_yellow:
                        lbl = "Necrotic Blight Spot"
                    else:
                        lbl = "Chlorotic Yellowing"
                    candidates.append((score, i, j, lbl))

        candidates.sort(key=lambda x: x[0], reverse=True)
        
        boxes = []
        for score, cy, cx, lbl in candidates:
            ymin = int(max(0, (cy - 0.75) / rows * 1000))
            xmin = int(max(0, (cx - 0.75) / cols * 1000))
            ymax = int(min(1000, (cy + 1.75) / rows * 1000))
            xmax = int(min(1000, (cx + 1.75) / cols * 1000))
            
            # Simple NMS check: skip if overlaps > 30% with any existing box
            overlap = False
            for b in boxes:
                by1, bx1, by2, bx2 = b["box_2d"]
                inter_x = max(0, min(xmax, bx2) - max(xmin, bx1))
                inter_y = max(0, min(ymax, by2) - max(ymin, by1))
                inter_area = inter_x * inter_y
                area1 = (xmax - xmin) * (ymax - ymin)
                area2 = (bx2 - bx1) * (by2 - by1)
                union_area = area1 + area2 - inter_area
                if union_area > 0 and (inter_area / union_area) > 0.28:
                    overlap = True
                    break
            if not overlap:
                boxes.append({
                    "box_2d": [ymin, xmin, ymax, xmax],
                    "label": lbl
                })
                if len(boxes) >= 3:
                    break
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
