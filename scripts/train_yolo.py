#!/usr/bin/env python3
"""
Train YOLO Multi-Crop Disease Classification Model
Targeting near-human agronomist accuracy (>98%) across all 8 Indian crops:
Cotton, Sugarcane, Rice, Wheat, Chili, Tomato, Potato, Maize.

Accelerated via Apple Silicon MPS (Metal Performance Shaders).
"""

import os
import sys
import json
import shutil
import argparse
from pathlib import Path
import torch

def main():
    parser = argparse.ArgumentParser(description="Train YOLO multi-crop disease classification model")
    parser.add_argument("--data", default="data/training_multicrop", help="Path to classification dataset directory")
    parser.add_argument("--model", default="yolo11s-cls.pt", help="Pretrained base model (e.g. yolo11s-cls.pt or yolov8s-cls.pt)")
    parser.add_argument("--epochs", type=int, default=20, help="Number of training epochs")
    parser.add_argument("--batch", type=int, default=64, help="Batch size (reduce to 32 if memory pressure occurs)")
    parser.add_argument("--imgsz", type=int, default=224, help="Input image dimension (224x224)")
    parser.add_argument("--lr0", type=float, default=0.001, help="Initial learning rate")
    parser.add_argument("--lrf", type=float, default=0.01, help="Final learning rate fraction")
    parser.add_argument("--workers", type=int, default=4, help="Data loader workers")
    parser.add_argument("--device", default="", help="Device: 'mps', 'cuda', 'cpu' or empty for auto-detect")
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent.parent
    data_dir = (repo_root / args.data).resolve()

    if not data_dir.exists():
        print(f"[ERROR] Dataset directory not found: {data_dir}")
        sys.exit(1)

    train_dir = data_dir / "train"
    val_dir = data_dir / "val"
    if not (train_dir.exists() and val_dir.exists()):
        print(f"[ERROR] 'train' and 'val' subdirectories required in: {data_dir}")
        sys.exit(1)

    classes = sorted([d.name for d in train_dir.iterdir() if d.is_dir()])
    print("=" * 70)
    print("🌱 KSHETRIKAH AI — MULTI-CROP YOLO DISEASE CLASSIFICATION TRAINING")
    print("=" * 70)
    print(f"📁 Dataset Path:       {data_dir}")
    print(f"🏷️  Number of Classes:  {len(classes)}")
    
    # Count images
    train_count = sum(len(list((train_dir / c).glob("*.*"))) for c in classes)
    val_count = sum(len(list((val_dir / c).glob("*.*"))) for c in classes)
    print(f"📊 Training Samples:   {train_count:,} images")
    print(f"📊 Validation Samples: {val_count:,} images (Total: {train_count + val_count:,})")

    # Select hardware acceleration device
    device = args.device
    if not device:
        if torch.backends.mps.is_available():
            device = "mps"
            print("⚡ Accelerator:        Apple Silicon GPU (MPS) detected & enabled")
        elif torch.cuda.is_available():
            device = "cuda:0"
            print("⚡ Accelerator:        NVIDIA CUDA GPU detected & enabled")
        else:
            device = "cpu"
            print("⚠️  Accelerator:        CPU fallback (MPS/CUDA not available)")
    else:
        print(f"⚡ Accelerator:        Manually specified '{device}'")

    from ultralytics import YOLO

    print(f"🤖 Base Model:         {args.model}")
    print(f"🔄 Epochs:             {args.epochs}")
    print(f"📦 Batch Size:         {args.batch}")
    print(f"📐 Image Dimension:    {args.imgsz}x{args.imgsz}")
    print("=" * 70)

    try:
        model = YOLO(args.model)
    except Exception as e:
        print(f"⚠️  Failed to load '{args.model}' ({e}), falling back to 'yolov8s-cls.pt'")
        try:
            model = YOLO("yolov8s-cls.pt")
        except Exception:
            model = YOLO("yolov8n-cls.pt")

    # Launch fine-tuning with agricultural augmentations and cosine LR
    print("\n🚀 Starting training loop...")
    results = model.train(
        data=str(data_dir),
        epochs=args.epochs,
        batch=args.batch,
        imgsz=args.imgsz,
        device=device,
        workers=args.workers,
        optimizer="AdamW",
        lr0=args.lr0,
        lrf=args.lrf,
        cos_lr=True,
        label_smoothing=0.05,
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        degrees=15.0,
        translate=0.1,
        scale=0.5,
        erasing=0.3,
        flipud=0.5,
        fliplr=0.5,
        project=str(repo_root / "runs" / "classify"),
        name="multicrop_yolo",
        exist_ok=True,
        patience=10,
        verbose=True,
        plots=True,
    )

    print("\n" + "=" * 70)
    print("✅ Training completed successfully!")
    print("=" * 70)

    # Save artifacts
    artifacts_dir = repo_root / "artifacts"
    artifacts_dir.mkdir(parents=True, exist_ok=True)

    weights_dir = repo_root / "runs" / "classify" / "multicrop_yolo" / "weights"
    best_pt = weights_dir / "best.pt"

    if best_pt.exists():
        target_pt = artifacts_dir / "best.pt"
        shutil.copy2(best_pt, target_pt)
        print(f"💾 Exported Best PyTorch Weights: {target_pt}")

    # Export to ONNX for ultra-fast production inference
    print("\n📦 Exporting best model to ONNX format...")
    try:
        export_model = YOLO(str(best_pt)) if best_pt.exists() else model
        onnx_file = export_model.export(format="onnx", imgsz=args.imgsz, simplify=True)
        if onnx_file and Path(onnx_file).exists():
            target_onnx = artifacts_dir / "crop_disease_yolo.onnx"
            shutil.copy2(onnx_file, target_onnx)
            print(f"💾 Exported Production ONNX Model: {target_onnx}")
    except Exception as e:
        print(f"⚠️  ONNX export notice: {e} (PyTorch weights best.pt ready for inference)")

    # Save class list
    classes_file = artifacts_dir / "yolo_classes.txt"
    classes_file.write_text("\n".join(classes) + "\n")
    print(f"📋 Saved Class Mapping ({len(classes)} classes): {classes_file}")

    # Also update resnet50_crop_disease_classes.txt so fallback readers recognize all 34 classes
    compat_classes = artifacts_dir / "resnet50_crop_disease_classes.txt"
    compat_classes.write_text("\n".join(classes) + "\n")
    print(f"📋 Updated Compatibility Classes: {compat_classes}")

    # Extract metrics
    metrics = {
        "model": args.model,
        "classes_count": len(classes),
        "train_samples": train_count,
        "val_samples": val_count,
        "epochs": args.epochs,
        "device": device,
    }

    if hasattr(results, "results_dict"):
        metrics["metrics"] = {k: float(v) for k, v in results.results_dict.items() if isinstance(v, (int, float))}
    
    summary_file = artifacts_dir / "yolo_training_summary.json"
    summary_file.write_text(json.dumps(metrics, indent=2))
    print(f"📈 Saved Performance Summary: {summary_file}")
    print("\n🎉 Kshetrikah AI YOLO Local Model is ready for real-time inference!")

if __name__ == "__main__":
    main()
