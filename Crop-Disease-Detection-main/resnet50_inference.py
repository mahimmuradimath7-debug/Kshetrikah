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
    'chili': ['chili', 'chilli', 'pepper'],
    'pepper': ['pepper', 'bell pepper', 'chili'],
}


def predict(model_path: str, image_path: str, class_names_path: str = None, image_size: int = 224, crop: str = None):
    model, class_names = load_model_and_classes(model_path, class_names_path)
    inferred_size = image_size
    if hasattr(model, 'input_shape') and model.input_shape and len(model.input_shape) >= 3:
        inferred_size = int(model.input_shape[1])
    x = preprocess_image(image_path, image_size=inferred_size)
    probs = model.predict(x, verbose=0)[0]

    selected_idx = int(np.argmax(probs))
    confidence = float(probs[selected_idx])

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
                confidence = float(norm_sub_probs[best_sub_idx])

    if class_names and selected_idx < len(class_names):
        pred_name = class_names[selected_idx]
    else:
        pred_name = f"class_{selected_idx}"

    return pred_name, confidence, probs


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
    if args.json:
        print(json.dumps({"prediction": pred_name, "confidence": round(confidence, 4)}))
    else:
        print(f"Prediction: {pred_name}")
        print(f"Confidence: {confidence:.4f}")
