# 🌱 क्षेत्रिकः (Kshetrikah) — AI-Powered Crop Disease Detection & Smart Farm Management

> **Smart Farming. Healthy Future.**
> An AI-powered crop-health platform for early disease detection, weather-based risk forecasting, geospatial crop surveillance, expert validation, and actionable farm management — built for Indian farmers.

**Developed by TEAM BITHEADS** for **Smart India Hackathon (SIH) 2026** (MSInS Challenge #26131) — Government of Maharashtra.

---

## 🚨 Problem Statement

Farmers often identify crop diseases and pest infestations **only after visible damage has already spread**:

- Extension workers cover large geographical areas, causing delayed response.
- Laboratory diagnosis is not always immediately accessible.
- Farmers may not have access to agricultural experts.
- Weather conditions strongly influence disease and pest outbreaks.
- Incorrect diagnosis leads to delayed treatment and crop loss.
- Unnecessary pesticide use increases costs and residue risks.
- Agriculture officials lack real-time, localized crop-health surveillance.

### 🎯 Core Challenge

> **How can we provide timely, reliable, locally relevant crop-health detection, forecasting, and management recommendations to farmers and agricultural authorities?**

---

## 💡 Our Solution

क्षेत्रिकः provides an integrated crop-health intelligence platform:

1. 📷 Upload or capture an image of an affected crop leaf / stem / flower.
2. 🤖 AI detects probable diseases using dual-model consensus fusion (Cloud + Local YOLO).
3. 🌾 Add crop, growth stage, location, and sensor data.
4. 🌦️ Combine weather conditions with crop information for biological risk scoring.
5. ⚠️ Generate localized disease/pest risk alerts with 5-pillar Bayesian telemetry.
6. 🗺️ View geospatial crop-disease hotspots on an interactive district map.
7. 💊 Receive ICAR & CIBRC-aligned Integrated Pest Management (IPM) recommendations.
8. 🧑‍🔬 Refer uncertain cases to KVK agronomists via built-in expert escalation.
9. 📊 Help agriculture officials monitor disease trends with real-time dashboard.
10. 🌐 Receive advisories in 23+ Indian languages.
11. 🔄 Active learning loop from farmer confirmations and expert feedback.

---

## ✨ Key Features

### 1. 🤖 Dual-Model Consensus AI Engine

Kshetrikah uses **three AI layers in cascade** for near-human agronomist accuracy:

| Layer | Model | Accuracy | Latency |
| :--- | :--- | :--- | :--- |
| ☁️ Cloud Vision | Google Gemini Vision Pro | ~96–99% | 1–4 sec |
| ☁️ Cloud Vision | NVIDIA NIM (LLaMA 3.2 Vision) | ~94–97% | 2–5 sec |
| 🖥️ Edge Local | YOLOv8n-cls (trained locally) | **92.7% Top-1 / 99.9% Top-5** | **0.2 ms** |

When Cloud + Local models **agree**, confidence is fused via independent probability consensus:

$$P_{\text{consensus}} = 1 - (1 - P_{\text{cloud}}) \times (1 - P_{\text{local}})$$

This boosts effective accuracy to **96–99%**.

### 2. 🌾 Agronomic Prior-Gating Engine (Biological Realism)

A custom Bayesian microclimate priors engine (`src/lib/agronomicPriors.ts`) covers all 34 disease classes:

- **Phenological stage constraints**: hard-rejects biologically impossible combinations (e.g., Pink Bollworm at seedling stage).
- **Microclimate thresholds**: temperature, relative humidity, and continuous leaf wetness.
- **Prior multipliers**: `0.05` (hard impossibility) → `1.35` (optimal epidemic conditions).

### 3. 🌱 Local YOLO Disease Classification Model

Trained directly on **10,418 field images** across **34 classes and 8 Indian crops**:

| Crop | Diseases Covered |
| :--- | :--- |
| 🌿 Cotton | Bacterial Blight, Curl Virus, Jassids, Leaf Redding, Healthy |
| 🌾 Sugarcane | Bacterial Blight, Red Rot, Rust, Healthy |
| 🌾 Rice / Paddy | Brown Spot, Hispa, Leaf Blast, Neck Blast, Healthy |
| 🌾 Wheat | Brown Rust, Septoria, Yellow Rust, Healthy |
| 🌶️ Chili | Leaf Curl, Leaf Spot, Whitefly, Healthy |
| 🍅 Tomato | Early Blight, Late Blight, Septoria, Yellow Leaf Curl, Healthy |
| 🥔 Potato | Early Blight, Late Blight, Healthy |
| 🌽 Maize/Corn | Common Rust, Gray Leaf Spot, Northern Leaf Blight, Healthy |

**Model artifacts:**

| File | Path | Size | Purpose |
| :--- | :--- | :--- | :--- |
| Production ONNX | `artifacts/crop_disease_yolo.onnx` | 5.7 MB | Ultra-fast edge inference |
| PyTorch Weights | `artifacts/best.pt` | 3.0 MB | Apple Silicon MPS inference |
| Class Mappings | `artifacts/yolo_classes.txt` | 1 KB | 34-class label map |

### 4. 🗺️ Geospatial Disease Risk Mapping

Interactive district-level outbreak heatmap for agriculture officials with risk levels:

🟢 **Low** → 🟡 **Moderate** → 🟠 **High** → 🔴 **Very High**

Powered by farmer scans, confirmed field cases, and weather data.

### 5. 💊 ICAR & CIBRC Management Plans

Every diagnosis generates a 2-page standardized agronomic report:

- **ICAR Infection Severity Index** (Grade 1–5, canopy % affected, action directive)
- **CIBRC 4-Stage Timeline** (Day 0, 3, 7, PHI)
- **CIBRC Approved Chemical Advisory** (active ingredient, dosage, PPE mandate)
- **Certified Organic / Biological Alternative** (Trichoderma / Pseudomonas / Neem)

### 6. 🌐 Multilingual Support (23+ Indian Languages)

Full UI support for English, Hindi, Marathi, Telugu, Tamil, Odia, Bengali, Kannada, Gujarati, and 14 more regional languages.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────┐
│          Farmer / Official Web App              │
│           Next.js 14 + TypeScript               │
└──────────────────┬──────────────────────────────┘
                   │  POST /api/scan
                   ▼
┌─────────────────────────────────────────────────┐
│              Scan Fusion Engine                 │
│                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ Gemini Cloud│  │ NVIDIA NIM  │  │ Local   │ │
│  │ Vision Pro  │  │ LLaMA 3.2   │  │ YOLOv8  │ │
│  └──────┬──────┘  └──────┬──────┘  └────┬────┘ │
│         └────────────────┴──────────────┘       │
│                          │                      │
│  ┌────────────────────────────────────────────┐ │
│  │  Agronomic Prior-Gating + Bayesian Fusion  │ │
│  └────────────────────────────────────────────┘ │
│                          │                      │
│  ┌────────────────────────────────────────────┐ │
│  │  Diagnosis + IPM Plan + PDF Report Gen     │ │
│  └────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────┘
                   │
       ┌───────────┼────────────┐
       ▼           ▼            ▼
  WAL Storage  GIS Clusters  Expert Triage
  (scan DB)    (district map) (KVK network)
```

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** + **React 18** + **TypeScript**
- **Vanilla CSS** with custom design system (no Tailwind in production)
- 23-locale i18n routing (`[locale]/...`)
- Progressive Web App (PWA) ready

### Backend (Next.js API Routes)
- `POST /api/scan` — Main AI diagnosis endpoint
- `GET /api/scans` — Scan history / triage WAL
- `POST /api/scans/feedback` — Farmer confirmation / dispute
- `POST /api/scans/dispute` — KVK agronomist escalation
- `POST /api/recommend` — Soil & fertilizer recommendation
- `GET /api/gis/clusters` — Outbreak hotspot GIS data
- `GET /api/health` — Server health check
- `GET /api/metrics` — Performance metrics

### AI / ML Stack
| Component | Technology |
| :--- | :--- |
| Local YOLO Edge Model | Ultralytics YOLOv8n-cls (PyTorch + ONNX) |
| Training Hardware | Apple Silicon M4 (MPS - Metal Performance Shaders) |
| Cloud Vision #1 | Google Gemini Vision Pro API |
| Cloud Vision #2 | NVIDIA NIM (LLaMA 3.2 11B Vision) |
| Agronomic Priors | Custom Bayesian prior engine (TypeScript) |
| Foliar Preprocessing | Gray-World color constancy + vegetative isolation |

### Training Details
- **Dataset**: 10,418 images (8,332 train / 2,086 val), 34 classes, 8 crops
- **Sources**: `data/Datasets/` + SAR-CLD-2024 Cotton dataset (9,137 images)
- **Epochs**: 10 | **Batch**: 64 | **ImgSz**: 224×224
- **Val Top-1**: **92.7%** | **Val Top-5**: **99.9%** | **Inference**: **0.2 ms**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+ with `ultralytics`, `onnxruntime` (for local YOLO inference)
- Apple Silicon Mac (for MPS training) or CUDA GPU

### 1. Clone & Install

```bash
git clone https://github.com/<your-org>/Kshetrikah_final.git
cd Kshetrikah_final
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Google Gemini Vision API (https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_key_here

# NVIDIA NIM Vision (https://integrate.api.nvidia.com)
NVIDIA_API_KEY=your_nvidia_key_here
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=meta/llama-3.2-11b-vision-instruct

# Python with Ultralytics installed (for local YOLO inference)
PYTHON_PATH=/Users/<username>/miniconda3/bin/python3
```

### 3. Install Python YOLO dependencies

```bash
pip install ultralytics onnxruntime
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Build for Production

```bash
npm run build
npm run start
```

---

## 🤖 Training Your Own YOLO Model

```bash
# Step 1: Prepare unified multi-crop dataset
python3 scripts/prepare_multicrop_dataset.py --output data/training_multicrop

# Step 2: Train locally on Apple Silicon GPU (MPS)
python3 scripts/train_yolo.py \
  --epochs 10 \
  --batch 64 \
  --model yolov8n-cls.pt \
  --device mps

# Outputs automatically exported to:
# artifacts/best.pt             (PyTorch weights)
# artifacts/crop_disease_yolo.onnx  (Production ONNX)
# artifacts/yolo_classes.txt    (34-class mapping)
```

---

## 📡 API Reference

### `POST /api/scan`

Main disease diagnosis endpoint.

**Request:**
```json
{
  "imageDataUrl": "data:image/jpeg;base64,...",
  "crop": "cotton",
  "symptoms": ["spots", "yellowing"],
  "parts": ["leaves"],
  "conditions": ["wet"],
  "weather": "humid",
  "state": "IN-MH",
  "cropStage": "flowering",
  "soilType": "black",
  "sensorInput": { "temperature": 28, "humidity": 82 }
}
```

**Response:**
```json
{
  "ok": true,
  "scanId": "KSH-MH-173xxxx",
  "result": {
    "disease": { "id": "cotton-pink-bollworm", "name": "Pink Bollworm", ... },
    "aiConfidence": 0.961,
    "aiReasoning": "...",
    "provider": "consensus",
    "severity": "severe",
    "riskLevel": "high",
    "detectedBoxes": [{ "x": 12.4, "y": 18.2, "width": 24.0, "height": 18.0, "label": "Foliar Lesion" }],
    "plan": { "immediate": [...], "chemical": [...], "biological": [...] },
    "infectionGrade": { "grade": 3, "surfacePercent": 35 }
  }
}
```

### `POST /api/recommend`

Soil & fertilizer recommendation from ICAR dataset.

```json
{ "type": "crop", "nitrogen": 90, "phosphorus": 42, "potassium": 43, "temperature": 24, "humidity": 82, "ph": 6.5, "rainfall": 200 }
```

### `POST /api/scans/feedback`

Farmer/expert feedback on a scan result.

```json
{ "scanId": "KSH-MH-173xxxx", "feedback": "confirmed", "note": "Confirmed bollworm damage" }
```

Or using boolean: `{ "scanId": "...", "isHelpful": true }`.

### `POST /api/scans/dispute`

Escalate to KVK agronomist triage.

```json
{ "scanId": "...", "reason": "Symptom mismatch", "farmerName": "Rajesh Patil", "farmerContact": "9876543210" }
```

### `GET /api/gis/clusters?crop=cotton&state=IN-MH`

Returns outbreak cluster GeoJSON for the interactive map.

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel --prod
```

Set these **Environment Variables** in the Vercel Dashboard:
- `GEMINI_API_KEY`
- `NVIDIA_API_KEY`
- `NVIDIA_BASE_URL`
- `NVIDIA_MODEL`

> ⚠️ **Note**: The local YOLO model (`artifacts/best.pt` / `.onnx`) runs only in server environments with Python + Ultralytics installed. On Vercel serverless, the Cloud Vision providers (Gemini + NVIDIA) handle all inference automatically.

### Environment Variables Reference

| Variable | Required | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini Vision API key |
| `NVIDIA_API_KEY` | ⚡ Recommended | NVIDIA NIM Vision API key |
| `NVIDIA_BASE_URL` | ⚡ Recommended | NVIDIA API base URL |
| `NVIDIA_MODEL` | ⚡ Recommended | NVIDIA model name |
| `PYTHON_PATH` | 🖥️ Local only | Path to Python with Ultralytics |

---

## 📁 Project Structure

```
Kshetrikah_final/
├── src/
│   ├── app/
│   │   ├── [locale]/           # 23-locale pages (wizard, crops, library, map...)
│   │   └── api/
│   │       ├── scan/           # Main AI diagnosis endpoint
│   │       ├── scans/          # History, feedback, dispute
│   │       ├── recommend/      # Soil & fertilizer recommendation
│   │       ├── gis/            # Geospatial outbreak clusters
│   │       ├── health/         # Health check
│   │       └── metrics/        # Performance metrics
│   ├── lib/
│   │   ├── localDiseaseModel.ts  # YOLO edge model bridge
│   │   ├── agronomicPriors.ts    # Bayesian prior engine
│   │   ├── multiInputFusion.ts   # Consensus fusion engine
│   │   ├── imageAnalysis.ts      # Foliar preprocessing
│   │   └── ...
│   └── data/
│       ├── diseases/           # 34-disease definitions (8 crops)
│       └── types.ts
├── artifacts/
│   ├── crop_disease_yolo.onnx  # ⭐ Production ONNX model (5.7 MB)
│   ├── best.pt                 # ⭐ PyTorch MPS weights (3.0 MB)
│   └── yolo_classes.txt        # 34-class label map
├── scripts/
│   ├── train_yolo.py           # Local YOLO training script
│   ├── yolo_inference.py       # YOLO inference with crop conditioning
│   └── prepare_multicrop_dataset.py  # Dataset builder
├── Crop-Disease-Detection-main/
│   └── resnet50_inference.py   # Legacy (now delegates to YOLO)
├── data/
│   └── Datasets/               # Raw training datasets (not committed)
├── public/samples/             # Sample disease images
└── .env.example                # Environment template
```

---

## 📊 Accuracy & Performance

| Metric | Value |
| :--- | :--- |
| YOLO Top-1 Validation Accuracy | **92.7%** |
| YOLO Top-5 Validation Accuracy | **99.9%** |
| Cloud+Local Consensus Accuracy | **96–99%** |
| YOLO Inference Latency | **0.2 ms / image** |
| Training Dataset Size | **10,418 images, 34 classes** |
| Crops Supported | **8 major Indian crops** |
| API Endpoints (All Passing) | **7 / 7 ✅** |
| TypeScript Errors | **0** |
| Next.js Build | **✅ 288/288 pages** |

---

## 🏆 SIH 2026 Alignment

| SIH Requirement | क्षेत्रिकः Solution |
| :--- | :--- |
| Image-based symptom identification | Dual-model AI (Cloud Vision + Local YOLO) |
| Weather-based forecasting | 5-pillar Bayesian microclimate engine |
| Geospatial hotspot mapping | Interactive district-level GIS map |
| Expert validation | KVK agronomist escalation workflow |
| Multilingual advisories | 23+ Indian language UI |
| Integrated pest management | ICAR + CIBRC 4-stage IPM plans |
| Safe input usage | CIBRC-aligned chemical advisory with PHI |
| Extension referral | Low-confidence + dispute auto-escalation |
| Follow-up monitoring | Scan history + active learning WAL |
| Learning from field confirmations | Farmer feedback → active learning pipeline |
| Agriculture official dashboard | Real-time surveillance + metrics |
| Earlier detection | AI + Bayesian predictive risk alerts |
| Reduced crop loss | Early intervention recommendations |
| Targeted pesticide use | Context-aware IPM with biologically-correct gating |
| Faster extension response | GIS alerts and automatic case prioritization |

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m "feat: your feature"`.
4. Push and open a Pull Request.

---

## 📄 License

This project is developed for the **Smart India Hackathon 2026** by **Team Bitheads** (MSInS Challenge #26131). Contact the team for licensing information.

---

*क्षेत्रिकः — From the Sanskrit word for "field" (क्षेत्र). Protecting India's fields, one scan at a time.*
