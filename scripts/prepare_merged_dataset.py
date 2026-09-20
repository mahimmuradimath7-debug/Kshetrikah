#!/usr/bin/env python3
"""Prepare a merged, clean training dataset from the available crop image folders.

This script normalizes class names and copies a usable subset into a single
train/val structure expected by the training pipeline.
"""

from __future__ import annotations

import argparse
import os
import random
import shutil
from pathlib import Path

from PIL import Image

IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}

ALIASES = {
    'apple_apple_scab': 'Apple Scab',
    'apple_scab': 'Apple Scab',
    'apple_black_rot': 'Apple Black Rot',
    'apple_cedar_apple_rust': 'Apple Cedar Apple Rust',
    'apple_rust': 'Apple Cedar Apple Rust',
    'apple_healthy': 'Apple Healthy',
    'apple_rotten': 'Apple Rotten',
    'banana_healthy': 'Banana Healthy',
    'banana_rotten': 'Banana Rotten',
    'pepper_bell_bacterial_spot': 'Bell Pepper Bacterial Spot',
    'bell_pepper_bacterial_spot': 'Bell Pepper Bacterial Spot',
    'bell_pepper_healthy': 'Bell Pepper Healthy',
    'bellpepper_healthy': 'Bell Pepper Healthy',
    'bellpepper_rotten': 'Bell Pepper Rotten',
    'cassava_mosaic': 'Cassava Mosaic Disease',
    'cassava_mosaic_disease': 'Cassava Mosaic Disease',
    'corn_maize_common_rust': 'Corn Common Rust',
    'corn_common_rust': 'Corn Common Rust',
    'corn_maize_healthy': 'Corn Healthy',
    'corn_healthy': 'Corn Healthy',
    'maize_healthy': 'Corn Healthy',
    'corn_maize_northern_leaf_blight': 'Corn Northern Leaf Blight',
    'corn_northern_leaf_blight': 'Corn Northern Leaf Blight',
    'corn_maize_gray_leaf_spot': 'Corn Gray Leaf Spot',
    'corn_gray_leaf_spot': 'Corn Gray Leaf Spot',
    'corn_maize_cercospora_leaf_spot': 'Corn Gray Leaf Spot',
    'maize_fall_armyworm': 'Corn Fall Armyworm',
    'maize_grasshoper': 'Corn Grasshopper',
    'maize_leaf_beetle': 'Corn Leaf Beetle',
    'maize_leaf_blight': 'Corn Northern Leaf Blight',
    'maize_leaf_spot': 'Corn Gray Leaf Spot',
    'maize_streak_virus': 'Corn Streak Virus',
    'gauva_diseased': 'Guava Diseased',
    'gauva_healthy': 'Guava Healthy',
    'grape_esca_black_measles': 'Grape Black Measles',
    'grape_black_measles': 'Grape Black Measles',
    'grape_leaf_blight_isariopsis_leaf_spot': 'Grape Leaf Blight',
    'grape_leaf_blight': 'Grape Leaf Blight',
    'potato_early_blight': 'Potato Early Blight',
    'potato_late_blight': 'Potato Late Blight',
    'potato_healthy': 'Potato Healthy',
    'rice_healthy': 'Rice Healthy',
    'rice_brown_spot': 'Rice Brown Spot',
    'rice_leaf_blast': 'Rice Blast',
    'rice_neck_blast': 'Rice Blast',
    'tomato_early_blight': 'Tomato Early Blight',
    'tomato_late_blight': 'Tomato Late Blight',
    'tomato_healthy': 'Tomato Healthy',
    'tomato_septoria_leaf_spot': 'Tomato Septoria Leaf Spot',
    'tomato_yellow_leaf_curl_virus': 'Tomato Yellow Leaf Curl Virus',
    'tomato_tomato_yellowleaf_curl_virus': 'Tomato Yellow Leaf Curl Virus',
    'tomato_leaf_curl': 'Tomato Yellow Leaf Curl Virus',
    'tomato_leaf_blight': 'Tomato Early Blight',
    'tomato_mosaic_virus': 'Tomato Mosaic Virus',
    'tomato_tomato_mosaic_virus': 'Tomato Mosaic Virus',
    'tomato_spider_mites_two_spotted_spider_mite': 'Tomato Spider Mites',
    'tomato_spider_mites': 'Tomato Spider Mites',
}


def normalize_name(raw: str) -> str:
    value = raw.strip()
    value = value.replace('___', '_').replace('__', '_').replace(' - ', '_')
    value = value.replace('/', '_').replace('(', '').replace(')', '')
    value = value.replace('-', '_').replace(' ', '_')
    while '__' in value:
        value = value.replace('__', '_')
    lowered = value.strip('_').lower()
    if lowered in ALIASES:
        return ALIASES[lowered]
    parts = [p.capitalize() for p in lowered.split('_') if p]
    return ' '.join(parts)


def is_valid_image(path: Path) -> bool:
    try:
        with Image.open(path) as img:
            img.load()
        return True
    except Exception:
        return False


def collect_images(root: Path):
    files = []
    for p in root.rglob('*'):
        if p.is_file() and p.suffix.lower() in IMAGE_EXTS and is_valid_image(p):
            files.append(p)
    return files


def copy_split(images, out_root: Path, class_name: str, val_ratio: float = 0.2):
    train_dir = out_root / 'train' / class_name
    val_dir = out_root / 'val' / class_name
    train_dir.mkdir(parents=True, exist_ok=True)
    val_dir.mkdir(parents=True, exist_ok=True)

    shuffled = sorted(images)
    random.Random(42).shuffle(shuffled)
    split = max(1, int(len(shuffled) * (1 - val_ratio)))
    train_files = shuffled[:split]
    val_files = shuffled[split:]

    for src in train_files:
        dst = train_dir / src.name
        if not dst.exists():
            shutil.copy2(src, dst)
    for src in val_files:
        dst = val_dir / src.name
        if not dst.exists():
            shutil.copy2(src, dst)


def main():
    parser = argparse.ArgumentParser(description='Prepare a merged crop disease dataset.')
    parser.add_argument('--source-root', default='data/Datasets', help='Root of dataset folders.')
    parser.add_argument('--output-root', default='data/merged_dataset', help='Output train/val root.')
    parser.add_argument('--val-ratio', type=float, default=0.2)
    args = parser.parse_args()

    source_root = Path(args.source_root)
    output_root = Path(args.output_root)
    if output_root.exists():
        shutil.rmtree(output_root)
    output_root.mkdir(parents=True, exist_ok=True)
    (output_root / 'train').mkdir(exist_ok=True)
    (output_root / 'val').mkdir(exist_ok=True)

    class_map = {}

    candidate_roots = [
        source_root / 'archive' / 'Plant Village Dataset' / 'Train',
        source_root / 'archive' / 'Plant Village Dataset' / 'Val',
        source_root / 'archive (2)' / 'dataset_clean_final',
        source_root / 'archive (1)',
    ]

    for root in candidate_roots:
        if not root.exists():
            continue
        for folder in sorted(root.iterdir()):
            if not folder.is_dir():
                continue
            class_name = normalize_name(folder.name)
            class_map.setdefault(class_name, []).extend(collect_images(folder))

    if not class_map:
        raise FileNotFoundError(f'No image class folders found under {source_root}')

    for class_name, image_files in sorted(class_map.items()):
        if not image_files:
            continue
        copy_split(image_files, output_root, class_name, val_ratio=args.val_ratio)

    print(f'Prepared {len(class_map)} classes at {output_root}')
    print('Sample class folders:', list(class_map)[:10])
    print('Train root classes:', len([p for p in (output_root / 'train').iterdir() if p.is_dir()]))
    print('Val root classes:', len([p for p in (output_root / 'val').iterdir() if p.is_dir()]))


if __name__ == '__main__':
    main()
