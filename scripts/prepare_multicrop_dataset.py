#!/usr/bin/env python3
"""
KSHETRIKAH (क्षेत्रिकः) — Multi-Crop Dataset Unification Engine
Consolidates 67,000+ local images from data/Datasets/ into a unified training structure:
- Cotton (SAR-CLD-2024 Dataset)
- Sugarcane, Rice, Wheat, Chili, Tomato, Potato, Corn (dataset_clean_final)

Usage:
  python3 scripts/prepare_multicrop_dataset.py --dry-run
  python3 scripts/prepare_multicrop_dataset.py --link --output data/training_multicrop
"""

import os
import sys
import glob
import random
import shutil
import argparse
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_ROOT = REPO_ROOT / 'data'
DATASETS_DIR = DATA_ROOT / 'Datasets'

# 1. Source Folders Mapping
COTTON_ORIG_DIR = (
    DATASETS_DIR
    / 'SAR-CLD-2024 A Comprehensive Dataset for Cotton Leaf Disease Detection'
    / 'Original Dataset'
    / 'Original Dataset'
)
COTTON_AUG_DIR = (
    DATASETS_DIR
    / 'SAR-CLD-2024 A Comprehensive Dataset for Cotton Leaf Disease Detection'
    / 'Augmented Dataset'
    / 'Augmented Dataset'
)
MULTICROP_DIR = DATASETS_DIR / 'archive (2)' / 'dataset_clean_final'

# 2. Canonical Kshetrikah Target Categories Mapping (Pooled across all source folders)
CROP_CATEGORY_MAP = {
    # ── Cotton (from SAR-CLD-2024: Original + Balanced Augmented) ──
    'Cotton__Bacterial_Blight': ('cotton', [COTTON_ORIG_DIR / 'Bacterial Blight', COTTON_AUG_DIR / 'Bacterial Blight']),
    'Cotton__Curl_Virus': ('cotton', [COTTON_ORIG_DIR / 'Curl Virus', COTTON_AUG_DIR / 'Curl Virus']),
    'Cotton__Leaf_Hopper_Jassids': ('cotton', [COTTON_ORIG_DIR / 'Leaf Hopper Jassids', COTTON_AUG_DIR / 'Leaf Hopper Jassids']),
    'Cotton__Leaf_Redding': ('cotton', [COTTON_ORIG_DIR / 'Leaf Redding', COTTON_AUG_DIR / 'Leaf Redding']),
    'Cotton__Healthy': ('cotton', [COTTON_ORIG_DIR / 'Healthy Leaf', COTTON_AUG_DIR / 'Healthy Leaf']),

    # ── Sugarcane ──
    'Sugarcane__Red_Rot': ('sugarcane', [MULTICROP_DIR / 'Sugarcane_Red_Rot', MULTICROP_DIR / 'Sugarcane__red_rot']),
    'Sugarcane__Rust': ('sugarcane', [MULTICROP_DIR / 'Sugarcane__rust']),
    'Sugarcane__Bacterial_Blight': ('sugarcane', [MULTICROP_DIR / 'Sugarcane_Bacterial_Blight']),
    'Sugarcane__Healthy': ('sugarcane', [MULTICROP_DIR / 'Sugarcane_Healthy', MULTICROP_DIR / 'Sugarcane__healthy']),

    # ── Rice / Paddy ──
    'Rice__Leaf_Blast': ('rice', [MULTICROP_DIR / 'Rice___Leaf_Blast', MULTICROP_DIR / 'Rice__leaf_blast']),
    'Rice__Neck_Blast': ('rice', [MULTICROP_DIR / 'Rice___Neck_Blast', MULTICROP_DIR / 'Rice__neck_blast']),
    'Rice__Brown_Spot': ('rice', [MULTICROP_DIR / 'Rice___Brown_Spot', MULTICROP_DIR / 'Rice__brown_spot']),
    'Rice__Hispa': ('rice', [MULTICROP_DIR / 'Rice__hispa']),
    'Rice__Healthy': ('rice', [MULTICROP_DIR / 'Rice___Healthy', MULTICROP_DIR / 'Rice__healthy']),

    # ── Wheat ──
    'Wheat__Yellow_Rust': ('wheat', [MULTICROP_DIR / 'Wheat___Yellow_Rust', MULTICROP_DIR / 'Wheat__yellow_rust']),
    'Wheat__Brown_Rust': ('wheat', [MULTICROP_DIR / 'Wheat___Brown_Rust', MULTICROP_DIR / 'Wheat__brown_rust']),
    'Wheat__Septoria': ('wheat', [MULTICROP_DIR / 'Wheat__septoria']),
    'Wheat__Healthy': ('wheat', [MULTICROP_DIR / 'Wheat___Healthy', MULTICROP_DIR / 'Wheat__healthy']),

    # ── Chili ──
    'Chili__Leaf_Curl': ('chili', [MULTICROP_DIR / 'Chili__leaf_curl']),
    'Chili__Leaf_Spot': ('chili', [MULTICROP_DIR / 'Chili__leaf_spot']),
    'Chili__Whitefly': ('chili', [MULTICROP_DIR / 'Chili__whitefly']),
    'Chili__Healthy': ('chili', [MULTICROP_DIR / 'Chili__healthy']),

    # ── Tomato ──
    'Tomato__Early_Blight': ('tomato', [MULTICROP_DIR / 'Tomato_Early_blight', MULTICROP_DIR / 'Tomato__early_blight']),
    'Tomato__Late_Blight': ('tomato', [MULTICROP_DIR / 'Tomato_Late_blight', MULTICROP_DIR / 'Tomato__late_blight']),
    'Tomato__Septoria_Spot': ('tomato', [MULTICROP_DIR / 'Tomato_Septoria_leaf_spot', MULTICROP_DIR / 'Tomato__septoria_leaf_spot']),
    'Tomato__Yellow_Leaf_Curl': ('tomato', [MULTICROP_DIR / 'Tomato__Tomato_YellowLeaf__Curl_Virus', MULTICROP_DIR / 'Tomato__yellow_leaf_curl_virus']),
    'Tomato__Healthy': ('tomato', [MULTICROP_DIR / 'Tomato__healthy', MULTICROP_DIR / 'Tomato_healthy']),

    # ── Potato ──
    'Potato__Early_Blight': ('potato', [MULTICROP_DIR / 'Potato___Early_blight', MULTICROP_DIR / 'Potato__early_blight']),
    'Potato__Late_Blight': ('potato', [MULTICROP_DIR / 'Potato___Late_Blight', MULTICROP_DIR / 'Potato__late_blight']),
    'Potato__Healthy': ('potato', [MULTICROP_DIR / 'Potato__Healthy']),

    # ── Corn / Maize ──
    'Corn__Common_Rust': ('maize', [MULTICROP_DIR / 'Corn___Common_Rust', MULTICROP_DIR / 'Corn__common_rust']),
    'Corn__Gray_Leaf_Spot': ('maize', [MULTICROP_DIR / 'Corn___Gray_Leaf_Spot', MULTICROP_DIR / 'Corn__gray_leaf_spot']),
    'Corn__Northern_Leaf_Blight': ('maize', [MULTICROP_DIR / 'Corn___Northern_Leaf_Blight', MULTICROP_DIR / 'Corn__northern_leaf_blight']),
    'Corn__Healthy': ('maize', [MULTICROP_DIR / 'Corn___Healthy', MULTICROP_DIR / 'Corn__healthy']),
}

def scan_sources():
    print("=" * 70)
    print(" KSHETRIKAH DATASET AUDIT — DATA/DATASETS/ REPOSITORY")
    print("=" * 70)
    inventory = {}
    total_imgs = 0

    for cat_name, (crop, src_paths) in CROP_CATEGORY_MAP.items():
        if not isinstance(src_paths, list):
            src_paths = [src_paths]
        all_imgs = []
        for sp in src_paths:
            if sp.exists():
                imgs = [p for p in sp.iterdir() if p.is_file() and p.suffix.lower() in ['.jpg', '.jpeg', '.png']]
                all_imgs.extend(imgs)
            else:
                print(f"  [WARN] Source path not found: {sp}")
        inventory[cat_name] = (crop, src_paths, all_imgs)
        total_imgs += len(all_imgs)
        print(f"  ✓ {cat_name:<30} ({crop:<10}) : {len(all_imgs):>5} images")

    print("-" * 70)
    print(f"  TOTAL FOUND ACROSS 8 CROPS: {total_imgs} images across {len(inventory)} classes\n")
    return inventory

def build_split(inventory, output_dir, use_symlinks=True, max_per_class=700, split_ratio=0.8):
    train_dir = output_dir / 'train'
    val_dir = output_dir / 'val'
    
    # Clean previous splits to avoid stale or orphaned files
    if train_dir.exists():
        shutil.rmtree(train_dir)
    if val_dir.exists():
        shutil.rmtree(val_dir)
        
    output_dir.mkdir(parents=True, exist_ok=True)
    train_dir.mkdir(exist_ok=True)
    val_dir.mkdir(exist_ok=True)

    classes = sorted(list(inventory.keys()))

    print(f"Building unified multi-crop dataset in: {output_dir}")
    print(f"Split ratio: {int(split_ratio*100)}% Train / {int((1-split_ratio)*100)}% Val (Max {max_per_class}/class)")

    random.seed(42)
    train_total = 0
    val_total = 0

    for cat_name, (crop, src_paths, imgs) in inventory.items():
        # Remove any duplicates if same image path appeared twice
        unique_imgs = list(dict.fromkeys(imgs))
        random.shuffle(unique_imgs)
        capped = unique_imgs[:max_per_class]

        n_train = int(len(capped) * split_ratio)
        train_imgs = capped[:n_train]
        val_imgs = capped[n_train:]

        train_cat_dir = train_dir / cat_name
        val_cat_dir = val_dir / cat_name
        train_cat_dir.mkdir(exist_ok=True)
        val_cat_dir.mkdir(exist_ok=True)

        for idx, img in enumerate(train_imgs):
            dst_name = f"{img.parent.name}_{idx}_{img.name}"
            dst = train_cat_dir / dst_name
            if not dst.exists():
                if use_symlinks:
                    os.symlink(img.resolve(), dst)
                else:
                    shutil.copy2(img, dst)
        train_total += len(train_imgs)

        for idx, img in enumerate(val_imgs):
            dst_name = f"{img.parent.name}_{idx}_{img.name}"
            dst = val_cat_dir / dst_name
            if not dst.exists():
                if use_symlinks:
                    os.symlink(img.resolve(), dst)
                else:
                    shutil.copy2(img, dst)
        val_total += len(val_imgs)

    # Generate dataset.yaml for YOLO training
    yaml_content = f"""# Kshetrikah Multi-Crop Unified Dataset Configuration
# Generated automatically from data/Datasets/
path: {output_dir.resolve()}
train: train
val: val

nc: {len(classes)}
names:
"""
    for i, c in enumerate(classes):
        yaml_content += f"  {i}: '{c}'\n"

    yaml_path = output_dir / 'dataset.yaml'
    yaml_path.write_text(yaml_content)

    print("\n" + "=" * 70)
    print(f"✓ Dataset generation successful!")
    print(f"  Train images: {train_total}")
    print(f"  Val images:   {val_total}")
    print(f"  Total images: {train_total + val_total}")
    print(f"  Classes:      {len(classes)}")
    print(f"  YAML Config:  {yaml_path}")
    print("=" * 70)
    print("\nTo train YOLO using this dataset, run:")
    print(f"  python3 scripts/train_yolo.py --data {output_dir.relative_to(REPO_ROOT)} --model yolo11s-cls.pt --epochs 20")

def main():
    parser = argparse.ArgumentParser(description="Prepare Kshetrikah Multi-Crop Dataset from data/Datasets/")
    parser.add_argument('--dry-run', action='store_true', help="Only scan and print inventory")
    parser.add_argument('--link', action='store_true', default=True, help="Use fast symlinks instead of copying files")
    parser.add_argument('--max-per-class', type=int, default=700, help="Max images per class for balanced training")
    parser.add_argument('--output', type=str, default='data/training_multicrop', help="Output directory")
    args = parser.parse_args()

    inventory = scan_sources()
    if args.dry_run:
        print("[Dry Run] Finished scanning. Run without --dry-run to build data splits.")
        return

    output_dir = REPO_ROOT / args.output
    build_split(inventory, output_dir, use_symlinks=args.link, max_per_class=args.max_per_class)

if __name__ == '__main__':
    main()
