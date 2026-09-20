#!/usr/bin/env python3
"""Train or fine-tune a ResNet50 crop disease classifier.

This script uses TensorFlow/Keras ResNet50 as the backbone for crop disease classification.

Example:
    python resnet50_training.py --data_dir ../data/merged_dataset --output_dir ../artifacts --epochs 5
"""

import os
import sys
import subprocess
import warnings
from pathlib import Path

# Suppress harmless OpenSSL/urllib3 warnings and TF info noise
warnings.filterwarnings("ignore")
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

try:
    import tensorflow as tf
    from tensorflow.keras import Input, Model
    from tensorflow.keras.applications import ResNet50
    from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
    from tensorflow.keras.optimizers import Adam
    from tensorflow.keras.preprocessing.image import ImageDataGenerator
    from tensorflow.keras.callbacks import ModelCheckpoint, ReduceLROnPlateau
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


def build_model(num_classes: int, input_shape=(224, 224, 3), fine_tune=False, learning_rate=1e-3):
    """Create a classification head on top of a ResNet50 backbone."""
    base_model = ResNet50(
        include_top=False,
        weights="imagenet",
        input_shape=input_shape,
    )

    if fine_tune:
        # Unfreeze the top layers of ResNet50 for deeper adaptation
        base_model.trainable = True
        for layer in base_model.layers[:-30]:
            layer.trainable = False
        lr = learning_rate if learning_rate != 1e-3 else 1e-4
    else:
        base_model.trainable = False
        lr = learning_rate

    inputs = Input(shape=input_shape, name="input_image")
    x = base_model(inputs)
    x = GlobalAveragePooling2D(name="gap")(x)
    x = Dense(512, activation="relu", name="fc_512")(x)
    x = Dropout(0.3, name="dropout")(x)
    outputs = Dense(num_classes, activation="softmax", name="predictions")(x)

    model = Model(inputs, outputs, name="resnet50_crop_classifier")
    model.compile(
        optimizer=Adam(learning_rate=lr),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def train_model(
    data_dir: str,
    output_dir: str,
    epochs: int,
    batch_size: int,
    image_size: int,
    steps_per_epoch: int = None,
    val_steps: int = None,
    fine_tune: bool = False,
    learning_rate: float = 1e-3,
):
    d_path = resolve_existing_path(data_dir)

    # Support either root folder containing train/val or path/train
    if (d_path / "train").exists() and (d_path / "val").exists():
        train_dir = d_path / "train"
        val_dir = d_path / "val"
    elif d_path.name == "train" and (d_path.parent / "val").exists():
        train_dir = d_path
        val_dir = d_path.parent / "val"
    elif d_path.exists() and any(p.is_dir() for p in d_path.iterdir()):
        train_dir = d_path
        val_dir = d_path
    else:
        raise FileNotFoundError(
            f"Expected dataset folders at '{d_path}/train' and '{d_path}/val'. "
            "Ensure a directory structure like: data/merged_dataset/train/<class> and data/merged_dataset/val/<class>."
        )

    class_names = sorted([p.name for p in train_dir.iterdir() if p.is_dir()])
    if not class_names:
        raise ValueError(f"No class directories found under {train_dir}")

    output_path = Path(output_dir)
    if not output_path.is_absolute():
        # If output path is relative, resolve relative to current directory or parent repo
        if not output_path.exists() and (Path(__file__).resolve().parent.parent / output_dir).exists():
            output_path = Path(__file__).resolve().parent.parent / output_dir
    output_path.mkdir(parents=True, exist_ok=True)

    class_names_path = output_path / "resnet50_crop_disease_classes.txt"
    class_names_path.write_text("\n".join(class_names) + "\n", encoding="utf-8")

    train_aug = ImageDataGenerator(
        rescale=1.0 / 255.0,
        rotation_range=20,
        width_shift_range=0.1,
        height_shift_range=0.1,
        shear_range=0.1,
        zoom_range=0.1,
        horizontal_flip=True,
        fill_mode="nearest",
    )
    val_aug = ImageDataGenerator(rescale=1.0 / 255.0)

    train_gen = train_aug.flow_from_directory(
        str(train_dir),
        target_size=(image_size, image_size),
        batch_size=batch_size,
        class_mode="categorical",
        shuffle=True,
    )

    val_gen = val_aug.flow_from_directory(
        str(val_dir),
        target_size=(image_size, image_size),
        batch_size=batch_size,
        class_mode="categorical",
        shuffle=False,
    )

    total_train_steps = max(1, train_gen.samples // batch_size)
    total_val_steps = max(1, val_gen.samples // batch_size)
    spe = min(steps_per_epoch, total_train_steps) if steps_per_epoch else total_train_steps
    vs = min(val_steps, total_val_steps) if val_steps else total_val_steps

    print(f"Loaded {len(class_names)} crop disease classes.")
    print(f"Train samples: {train_gen.samples}, steps per epoch: {spe}")
    print(f"Val samples: {val_gen.samples}, val steps: {vs}")

    model = build_model(
        num_classes=len(class_names),
        input_shape=(image_size, image_size, 3),
        fine_tune=fine_tune,
        learning_rate=learning_rate,
    )

    checkpoint_path = output_path / "resnet50_crop_disease.keras"
    callbacks = [
        ModelCheckpoint(
            filepath=str(checkpoint_path),
            monitor="val_accuracy",
            save_best_only=True,
            mode="max",
            verbose=1,
        ),
        ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=2,
            min_lr=1e-6,
            verbose=1,
        ),
    ]

    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=epochs,
        steps_per_epoch=spe,
        validation_steps=vs,
        callbacks=callbacks,
        verbose=1,
    )

    if not checkpoint_path.exists():
        model.save(str(checkpoint_path))

    print(f"Model saved to: {checkpoint_path}")
    print(f"Class names saved to: {class_names_path}")
    return history


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Train a ResNet50 crop disease recognition model.")
    parser.add_argument("--data_dir", type=str, default="data/merged_dataset", help="Path to train/val or merged_dataset folder.")
    parser.add_argument("--output_dir", type=str, default="artifacts", help="Directory to save the trained model.")
    parser.add_argument("--epochs", type=int, default=5, help="Training epochs.")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size.")
    parser.add_argument("--image_size", type=int, default=224, help="Input image side length for ResNet50.")
    parser.add_argument("--steps_per_epoch", type=int, default=None, help="Steps per training epoch (omit for full dataset).")
    parser.add_argument("--val_steps", type=int, default=None, help="Steps per validation evaluation (omit for full dataset).")
    parser.add_argument("--fine_tune", action="store_true", help="Unfreeze upper ResNet50 layers for fine-tuning.")
    parser.add_argument("--learning_rate", type=float, default=1e-3, help="Optimizer learning rate.")
    args = parser.parse_args()

    spe = args.steps_per_epoch if (args.steps_per_epoch and args.steps_per_epoch > 0) else None
    vs = args.val_steps if (args.val_steps and args.val_steps > 0) else None

    train_model(
        data_dir=args.data_dir,
        output_dir=args.output_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        image_size=args.image_size,
        steps_per_epoch=spe,
        val_steps=vs,
        fine_tune=args.fine_tune,
        learning_rate=args.learning_rate,
    )
