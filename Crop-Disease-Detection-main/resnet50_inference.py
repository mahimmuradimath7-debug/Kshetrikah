#!/usr/bin/env python3
"""Run inference with a trained ResNet50 crop disease model.

Example:
    python resnet50_inference.py --model_path ../artifacts/resnet50_crop_disease.keras --image_path sample.jpg
"""

import os
import sys
import json
import subprocess
import warnings
import argparse
from pathlib import Path

# Suppress harmless OpenSSL/urllib3 warnings and TF info noise
warnings.filterwarnings("ignore")
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

# If a YOLO model (.pt or .onnx) is requested, forward immediately to yolo_inference.py
if any(arg.endswith('.pt') or arg.endswith('.onnx') for arg in sys.argv):
    yolo_script = Path(__file__).resolve().parent.parent / "scripts" / "yolo_inference.py"
    if yolo_script.exists():
        res = subprocess.run([sys.executable, str(yolo_script)] + sys.argv[1:], capture_output=True, text=True)
        print(res.stdout, end="")
        if res.stderr:
            print(res.stderr, file=sys.stderr, end="")
        sys.exit(res.returncode)

try:
    import numpy as np
    from PIL import Image
    import tensorflow as tf
except ImportError:
    # Auto-fallback: Check if another Python environment (e.g. system Python 3.9) has TensorFlow
    candidate_pythons = [
        "/usr/bin/python3",
        "/usr/local/bin/python3",
        "/opt/homebrew/bin/python3",
    ]
    for candidate in candidate_pythons:
        if candidate != sys.executable and os.path.exists(candidate):
            try:
                probe = subprocess.run([candidate, "-c", "import tensorflow"], capture_output=True)
                if probe.returncode == 0:
                    os.execv(candidate, [candidate] + sys.argv)
            except Exception:
                pass

    raise SystemExit(
        "TensorFlow is required to run this script. Please install it using: pip install tensorflow\n"
        f"Active Python: {sys.executable}\n"
        "If you have TensorFlow installed under another Python (e.g. /usr/bin/python3), run:\n"
        f"    /usr/bin/python3 {' '.join(sys.argv)}"
    )


def resolve_existing_path(path_str: str) -> Path:
    p = Path(path_str)
    if p.exists():
        return p
    repo_alt = Path(__file__).resolve().parent.parent / path_str
    if repo_alt.exists():
        return repo_alt
    return p


def load_model_and_classes(model_path: str, class_names_path: str = None):
    m_path = resolve_existing_path(model_path)
    if not m_path.exists():
        raise FileNotFoundError(f"Model file not found at: {model_path}")

    model = tf.keras.models.load_model(str(m_path))
    class_names = []

    # 1. If explicit class names path is provided
    if class_names_path:
        c_path = resolve_existing_path(class_names_path)
        if c_path.exists():
            class_names = [line.strip() for line in c_path.read_text().splitlines() if line.strip()]

    # 2. If omitted, search alongside model or in artifacts/
    if not class_names:
        sibling = m_path.parent / "resnet50_crop_disease_classes.txt"
        if sibling.exists():
            class_names = [line.strip() for line in sibling.read_text().splitlines() if line.strip()]
        else:
            artifacts_classes = Path(__file__).resolve().parent.parent / "artifacts" / "resnet50_crop_disease_classes.txt"
            if artifacts_classes.exists():
                class_names = [line.strip() for line in artifacts_classes.read_text().splitlines() if line.strip()]

    return model, class_names


def preprocess_image(image_path: str, image_size: int = 224):
    img_path = resolve_existing_path(image_path)
    if not img_path.exists():
        raise FileNotFoundError(f"Image file not found at: {image_path}")

    image = Image.open(img_path).convert("RGB")
    image = image.resize((image_size, image_size))
    arr = np.asarray(image, dtype=np.float32) / 255.0
    arr = np.expand_dims(arr, axis=0)
    return arr


CROP_SYNONYMS = {
    'maize': ['corn', 'maize'],
    'corn': ['corn', 'maize'],
    'chili': ['chili', 'chilli'],
    'pepper': ['bell pepper', 'pepper'],
}


def predict(model_path: str, image_path: str, class_names_path: str = None, image_size: int = 224, crop: str = None):
    model, class_names = load_model_and_classes(model_path, class_names_path)
    inferred_size = image_size
    if hasattr(model, 'input_shape') and model.input_shape and len(model.input_shape) >= 3:
        inferred_size = int(model.input_shape[1])
    x = preprocess_image(image_path, image_size=inferred_size)
    probs = model.predict(x, verbose=0)[0]

    selected_idx = int(np.argmax(probs))
    raw_confidence = float(probs[selected_idx])
    confidence = raw_confidence

    if crop and class_names:
        crop_lower = crop.strip().lower()
        search_terms = CROP_SYNONYMS.get(crop_lower, [crop_lower])
        crop_indices = [
            i for i, c in enumerate(class_names)
            if any(term in c.lower() for term in search_terms)
        ]
        if crop_indices:
            sub_probs = probs[crop_indices]
            sub_sum = float(np.sum(sub_probs))
            if sub_sum > 0:
                norm_sub_probs = sub_probs / sub_sum
                best_sub_idx = int(np.argmax(norm_sub_probs))
                selected_idx = crop_indices[best_sub_idx]
                raw_crop_conf = float(probs[selected_idx])
                # Only trust normalized probability if raw crop probability is non-negligible
                if raw_crop_conf >= 0.18:
                    confidence = float(norm_sub_probs[best_sub_idx])
                else:
                    confidence = raw_crop_conf

    if class_names and selected_idx < len(class_names):
        pred_name = class_names[selected_idx]
    else:
        pred_name = f"class_{selected_idx}"

    return pred_name, confidence, probs


def detect_lesion_boxes(image_path: str):
    """Detect prominent foliar lesion and chlorosis clusters using color-space analysis."""
    try:
        img_path = resolve_existing_path(image_path)
        if not img_path.exists():
            return []

        img = Image.open(img_path).convert("RGB")
        w, h = img.size
        sample_size = 192
        thumb = img.resize((sample_size, sample_size))
        arr = np.asarray(thumb, dtype=np.int32)

        r = arr[:, :, 0]
        g = arr[:, :, 1]
        b = arr[:, :, 2]

        # Brown/necrotic: reddish-brown with suppressed blue
        necrotic = (r > g * 1.05) & (r > b * 1.3) & (r > 40)
        # Chlorotic yellow: high red + high green, low blue
        chlorotic = (r > 130) & (g > 130) & (b < 100) & (abs(r - g) < 50)
        # White/gray fungal powdery mildew or sporulation
        sporulation = (r > 180) & (g > 180) & (b > 180) & (arr.std(axis=2) < 25)

        diseased = necrotic | chlorotic | sporulation
        if not np.any(diseased):
            # Fallback: find darkest/most divergent patch against green foliage
            greenness = (g.astype(float) * 2) - (r + b)
            leaf_mask = (g > 40) | (r > 40)
            if np.any(leaf_mask):
                divergent = (greenness < np.percentile(greenness[leaf_mask], 15)) & leaf_mask
                diseased = divergent

        cols = 16
        rows = 16
        cell_w = sample_size // cols
        cell_h = sample_size // rows

        grid = np.zeros((rows, cols), dtype=np.int32)
        grid_type = {}

        for cy in range(rows):
            for cx in range(cols):
                patch_d = diseased[cy * cell_h : (cy + 1) * cell_h, cx * cell_w : (cx + 1) * cell_w]
                count = int(np.sum(patch_d))
                grid[cy, cx] = count
                if count > 0:
                    patch_n = np.sum(necrotic[cy * cell_h : (cy + 1) * cell_h, cx * cell_w : (cx + 1) * cell_w])
                    patch_c = np.sum(chlorotic[cy * cell_h : (cy + 1) * cell_h, cx * cell_w : (cx + 1) * cell_w])
                    if patch_c > patch_n:
                        grid_type[(cy, cx)] = "Chlorotic Yellow Zone"
                    elif patch_n > 0:
                        grid_type[(cy, cx)] = "Necrotic Blight Lesion"
                    else:
                        grid_type[(cy, cx)] = "Pathological Lesion Focus"

        # Connected component clustering
        visited = np.zeros((rows, cols), dtype=bool)
        clusters = []

        threshold = max(3, int(np.percentile(grid[grid > 0], 50))) if np.any(grid > 0) else 3

        for cy in range(rows):
            for cx in range(cols):
                if not visited[cy, cx] and grid[cy, cx] >= threshold:
                    min_x, max_x = cx, cx
                    min_y, max_y = cy, cy
                    total = 0
                    dominant_label = grid_type.get((cy, cx), "Pathological Lesion Focus")

                    stack = [(cy, cx)]
                    visited[cy, cx] = True

                    while stack:
                        curr_y, curr_x = stack.pop()
                        total += grid[curr_y, curr_x]
                        min_x = min(min_x, curr_x)
                        max_x = max(max_x, curr_x)
                        min_y = min(min_y, curr_y)
                        max_y = max(max_y, curr_y)

                        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                            ny, nx = curr_y + dy, curr_x + dx
                            if 0 <= ny < rows and 0 <= nx < cols and not visited[ny, nx] and grid[ny, nx] >= max(2, threshold - 1):
                                visited[ny, nx] = True
                                stack.append((ny, nx))

                    span_w = max_x - min_x + 1
                    span_h = max_y - min_y + 1
                    if span_w < cols * 0.85 and span_h < rows * 0.85 and total >= 6:
                        clusters.append({
                            "min_x": min_x, "max_x": max_x,
                            "min_y": min_y, "max_y": max_y,
                            "total": total, "label": dominant_label
                        })

        clusters.sort(key=lambda c: c["total"], reverse=True)
        if not clusters and np.any(grid > 0):
            # Guarantee at least 1 prominent hotspot
            best_cy, best_cx = np.unravel_index(np.argmax(grid), grid.shape)
            clusters.append({
                "min_x": max(0, best_cx - 1), "max_x": min(cols - 1, best_cx + 1),
                "min_y": max(0, best_cy - 1), "max_y": min(rows - 1, best_cy + 1),
                "total": int(grid[best_cy, best_cx]),
                "label": grid_type.get((best_cy, best_cx), "Primary Lesion Zone")
            })

        boxes = []
        for cl in clusters[:4]:
            ymin = int(max(0, (cl["min_y"] - 0.4) / rows * 1000))
            xmin = int(max(0, (cl["min_x"] - 0.4) / cols * 1000))
            ymax = int(min(1000, (cl["max_y"] + 1.4) / rows * 1000))
            xmax = int(min(1000, (cl["max_x"] + 1.4) / cols * 1000))
            boxes.append({
                "box_2d": [ymin, xmin, ymax, xmax],
                "label": cl["label"]
            })
        return boxes
    except Exception:
        return []


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Inference with a trained ResNet50 crop disease model.")
    parser.add_argument("--model_path", type=str, default="artifacts/resnet50_crop_disease.keras", help="Path to the .keras file.")
    parser.add_argument("--image_path", type=str, required=True, help="Input crop image path.")
    parser.add_argument("--class_names_path", type=str, default=None, help="Optional text file with one class name per line.")
    parser.add_argument("--image_size", type=int, default=224, help="Resize target size for the model.")
    parser.add_argument("--crop", type=str, default=None, help="Crop name for Bayesian prior conditioning.")
    parser.add_argument("--json", action="store_true", help="Output results in JSON format.")
    args = parser.parse_args()

    pred_name, confidence, _ = predict(
        model_path=args.model_path,
        image_path=args.image_path,
        class_names_path=args.class_names_path,
        image_size=args.image_size,
        crop=args.crop,
    )
    detected_boxes = detect_lesion_boxes(args.image_path)
    if args.json:
        print(json.dumps({
            "prediction": pred_name,
            "confidence": round(confidence, 4),
            "detected_boxes": detected_boxes,
        }))
    else:
        print(f"Prediction: {pred_name}")
        print(f"Confidence: {confidence:.4f}")
        print(f"Detected Boxes: {len(detected_boxes)}")

