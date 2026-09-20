# ResNet50 Crop Disease Recognition Engine

This module provides deep learning classification for crop diseases using TensorFlow / Keras ResNet50.

---

## 1. Python Environment & Auto-Resolution

* **Supported Environment**: Python 3.9+ with TensorFlow 2.16+ (e.g. system Python `/usr/bin/python3`).
* **Auto-Fallback Engine**: Both `resnet50_training.py` and `resnet50_inference.py` include automatic Python discovery. If you execute them using another Python interpreter that lacks TensorFlow (e.g., active conda with Python 3.14), they will **automatically detect and re-execute** using the working Python environment (`/usr/bin/python3`).

---

## 2. Running Inference

To test disease detection on any crop specimen image:

```bash
# From project root:
python Crop-Disease-Detection-main/resnet50_inference.py --image_path sample.jpg

# Or JSON output:
python Crop-Disease-Detection-main/resnet50_inference.py --image_path sample.jpg --json

# Conditioning with crop prior:
python Crop-Disease-Detection-main/resnet50_inference.py --image_path sample.jpg --crop tomato --json
```

* `--model_path` defaults to `artifacts/resnet50_crop_disease.keras`.
* `--class_names_path` defaults to `artifacts/resnet50_crop_disease_classes.txt`.

---

## 3. Training the Model

To train on the merged dataset:

```bash
# Quick test run (e.g. 5 epochs with 50 steps each):
python Crop-Disease-Detection-main/resnet50_training.py --data_dir data/merged_dataset --output_dir artifacts --epochs 5 --steps_per_epoch 50 --val_steps 20

# Full dataset training:
python Crop-Disease-Detection-main/resnet50_training.py --data_dir data/merged_dataset --output_dir artifacts --epochs 5

# Deep fine-tuning (unfreezes top ResNet50 layers):
python Crop-Disease-Detection-main/resnet50_training.py --data_dir data/merged_dataset --output_dir artifacts --epochs 5 --fine_tune --learning_rate 0.0001
```

The trained `.keras` model and class list (`resnet50_crop_disease_classes.txt`) will be saved in `artifacts/` for automatic consumption by the Next.js API.
