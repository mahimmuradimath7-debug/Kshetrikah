# 🌱 क्षेत्रिकः (Kshetrikah) — AI-Powered Crop Disease Detection & Smart Management

> **Smart Farming. Healthy Future.**
> An AI-powered crop-health platform for early disease detection, weather-based risk forecasting, geospatial crop surveillance, expert validation, and actionable farm management.

**क्षेत्रिकः** is being developed for **Smart India Hackathon (SIH) 2026** to address the challenge of delayed crop-disease and pest detection faced by farmers and agricultural extension workers.

The platform combines **AI-based image analysis, weather data, crop information, farmer-reported field observations, geospatial risk mapping, expert validation, and multilingual advisories** into a single farmer-friendly software system.

---

## 🚨 Problem Statement

Farmers often identify crop diseases and pest infestations only after visible damage has already spread.

Traditional diagnosis can be slow because:

- Extension workers have to cover large geographical areas.
- Laboratory diagnosis is not always immediately accessible.
- Farmers may not have access to agricultural experts.
- Weather conditions strongly influence disease and pest outbreaks.
- Crop stage, variety, soil condition, and local pest history are often not considered together.
- Incorrect diagnosis can result in delayed treatment.
- Unnecessary or inappropriate pesticide usage increases cultivation costs and residue concerns.
- Lack of continuous monitoring makes early intervention difficult.
- Agriculture officials often lack real-time, localized crop-health surveillance.

### 🎯 Core Challenge

> **How can we provide timely, reliable, locally relevant crop-health detection, forecasting, and management recommendations to farmers and agricultural authorities?**

---

# 💡 Our Solution

क्षेत्रिकः provides an integrated crop-health intelligence platform that allows farmers to:

1. 📷 Upload or capture an image of an affected crop.
2. 🤖 Detect probable diseases using AI/ML.
3. 🌾 Add crop, crop-age, location, and growing-stage information.
4. 🌦️ Combine weather conditions with crop information.
5. ⚠️ Generate localized disease/pest risk alerts.
6. 🗺️ View geospatial crop-disease hotspots.
7. 💊 Receive Integrated Pest Management (IPM) recommendations.
8. 👨‍🌾 Get safe-input and treatment guidance.
9. 🧑‍🔬 Refer uncertain cases to experts or laboratories.
10. 📊 Help agriculture officials monitor disease trends.
11. 🌐 Provide advisories in multiple Indian languages.
12. 🔄 Learn from field confirmations and follow-up monitoring.

---

# 🖥️ Platform Overview

The क्षेत्रिकः interface is designed around a simple principle:

> **Scan → Detect → Understand → Act → Monitor**

### Main Modules

| Module                   | Purpose                                            |
| ------------------------ | -------------------------------------------------- |
| 🤖 AI Disease Detection  | Identify probable crop diseases from images        |
| 🌦️ Weather Risk          | Predict disease/pest risk using weather conditions |
| 🌾 Crop Intelligence     | Combine crop, age, stage and location              |
| 🗺️ Disease Risk Map      | Visualize regional disease hotspots                |
| 🧑‍🔬 Expert Validation     | Allow experts to confirm or correct predictions    |
| 💊 Smart Management      | Provide IPM and treatment recommendations          |
| 🌐 Multilingual Advisory | Deliver farmer-friendly local-language guidance    |
| 📊 Official Dashboard    | Help agriculture departments monitor outbreaks     |
| 📚 Learn & Grow          | Provide educational disease-management resources   |
| 🔄 Follow-up Monitoring  | Track disease progression and treatment response   |

---

# ✨ Key Features

## 1. 📷 AI-Powered Disease Detection

Farmers can upload a clear image of an affected portion of a crop.

The system analyzes:

- Leaf symptoms
- Spots and lesions
- Color changes
- Texture
- Visible pest damage
- Disease-specific visual patterns

The result provides:

```text
Most Likely Disease
Confidence Score
Severity
Symptoms Matched
Recommended Actions
```

Example:

```text
Disease: Brown Spot
Scientific Name: Bipolaris oryzae

Confidence: 92%
Severity: Moderate

Symptoms:
✓ Brown circular spots
✓ Yellow halo
✓ Compatible crop stage
```

> AI predictions are intended as decision-support and should be referred to an agricultural expert/laboratory when confidence is low or the case is critical.

## Environment

To enable server-side AI vision scanning you can set `GEMINI_API_KEY` in a `.env` file. See `.env.example` for a template. If the key is not provided the app will fall back to local heuristics for risk and management plan generation.

---

# 2. 🌦️ Weather-Based Disease Forecasting

क्षेत्रिकः combines weather information with crop and disease data.

Potential inputs include:

- Temperature
- Humidity
- Rainfall
- Wind conditions
- Weather history
- Forecast data
- Crop stage
- Location

Example:

```text
Temperature       28°C
Humidity           78%
Rainfall           12 mm
Crop               Rice
Growing Stage      Tillering

Risk Level: HIGH
```

This enables **preventive alerts before severe symptoms appear**.

---

# 3. 🗺️ Geospatial Disease Risk Mapping

क्षेत्रिकः provides a regional disease-risk map for agriculture officials and farmers.

Risk levels can include:

🟢 **Low Risk**
🟡 **Moderate Risk**
🟠 **High Risk**
🔴 **Very High Risk**

The map can be generated using:

- Farmer reports
- AI detections
- Confirmed field cases
- Weather conditions
- Crop distribution
- Historical disease data
- Farmer-submitted pest observations (logged manually in-app)

This helps authorities identify **emerging hotspots and prioritize field visits**.

---

# 4. 🌾 Crop Intelligence

Farmers provide basic crop information:

```text
Crop
Crop Age
Location
Growing Stage
Variety
Soil Information
```

The platform combines this information with AI and environmental data to improve recommendations.

---

# 5. 🧑‍🔬 Expert Validation

AI predictions should not operate as a completely isolated system.

क्षेत्रिकः provides an expert-validation workflow.

### Workflow

```text
Farmer Upload
      ↓
AI Prediction
      ↓
Confidence Evaluation
      ↓
 ┌───────────────┐
 │ High Confidence│ → Recommendation
 └───────────────┘
      ↓
Low Confidence / Critical Case
      ↓
Expert Review
      ↓
Confirmed Diagnosis
      ↓
Knowledge Base Update
```

Expert feedback can be used to improve future predictions and understand model failure cases.

---

# 6. 💊 Integrated Pest Management

Instead of simply recommending pesticides, क्षेत्रिकः focuses on **Integrated Pest Management (IPM)**.

Recommendations may include:

### Immediate Actions

- Remove severely infected plant parts.
- Improve field drainage.
- Avoid water logging.
- Maintain appropriate plant spacing.
- Remove heavily infected debris.

### Cultural Management

- Crop sanitation
- Crop rotation
- Proper irrigation
- Resistant varieties
- Field hygiene

### Biological Management

- Beneficial organisms
- Biological control methods
- Natural pest management

### Chemical Management

Where appropriate, the platform can provide:

- Approved treatment categories
- Safe-use guidance
- Application precautions
- Waiting-period information
- Referral to local agricultural authorities

The system should avoid encouraging unnecessary pesticide use.

---

# 🌐 Multilingual Support

क्षेत्रिकः is designed for India's diverse agricultural communities.

The platform can support:

- English
- Hindi
- Marathi
- Odia
- Telugu
- Tamil
- Bengali
- Kannada
- Gujarati
- Other regional languages

The goal is to provide **simple, actionable advisories rather than highly technical agricultural terminology**.

Example:

```text
Disease Detected:
Brown Spot

Risk:
Moderate

What to do now:
1. Remove heavily affected leaves.
2. Avoid excess irrigation.
3. Maintain field drainage.
4. Monitor nearby plants.
5. Contact an agricultural expert if symptoms spread.
```

---

# 📊 Agriculture Official Dashboard

क्षेत्रिकः can provide a dedicated dashboard for agriculture departments.

Officials can monitor:

- Total reported cases
- Confirmed disease cases
- Disease distribution
- Crop-wise disease statistics
- High-risk regions
- Emerging hotspots
- Weather-driven alerts
- Expert verification status
- Treatment outcomes
- Field visits
- Historical disease trends

This enables **data-driven agricultural surveillance and faster extension response**.

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │      Farmer App      │
                         │      Web Platform    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Supabase Backend   │
                         │                      │
                         │ Auth                 │
                         │ PostgreSQL           │
                         │ Storage              │
                         │ Realtime             │
                         │ Edge Functions       │
                         └──────────┬───────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                ▼                   ▼                   ▼
        ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
        │ AI/ML Model  │    │ Weather API  │    │ GIS / Maps   │
        │ Disease      │    │ Forecasting  │    │ Risk Mapping │
        │ Detection    │    │              │    │              │
        └──────┬───────┘    └──────────────┘    └──────────────┘
               │
               ▼
        ┌──────────────────┐
        │ Disease Engine   │
        │                  │
        │ Diagnosis        │
        │ Risk Score       │
        │ Severity         │
        │ Recommendations  │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │ Expert Validation│
        │ & Feedback Loop  │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │ Analytics &      │
        │ Surveillance     │
        └──────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

- **Next.js / React**
- **TypeScript**
- **Tailwind CSS**
- Responsive UI
- Progressive Web App support
- Interactive maps
- Multilingual UI

## Backend

### Supabase

क्षेत्रिकः uses **Supabase as the primary backend platform**.

Supabase services:

- PostgreSQL Database
- Authentication
- Storage
- Row Level Security
- Realtime
- Edge Functions

## AI / ML

Possible architecture:

- Python
- PyTorch / TensorFlow
- CNN / Vision Transformer models
- Image classification
- Image preprocessing
- Disease-specific classification models

The AI layer can be deployed independently and accessed through an API or Supabase Edge Function.

## External Services

Potential integrations:

- Weather API
- Geolocation API
- Map/GIS provider
- Government agricultural datasets
- Pest/disease datasets

---

# 📸 Scan Workflow

The primary user journey is:

```text
┌───────────────┐
│ Upload/Capture│
│ Crop Image    │
└───────┬───────┘
        ↓
┌───────────────┐
│ Crop Details  │
│               │
│ Crop          │
│ Age           │
│ Location      │
│ Growing Stage │
└───────┬───────┘
        ↓
┌───────────────┐
│ AI Analysis   │
└───────┬───────┘
        ↓
┌────────────────────┐
│ Disease Prediction │
│ Confidence         │
│ Severity           │
└─────────┬──────────┘
          ↓
┌────────────────────┐
│ Weather + Crop +   │
│ Location Risk      │
└─────────┬──────────┘
          ↓
┌────────────────────┐
│ Management Plan    │
└─────────┬──────────┘
          ↓
┌────────────────────┐
│ Follow-up / Expert │
│ Validation         │
└────────────────────┘
```

---

# 🎨 UI/UX Design

The interface is designed specifically for farmers and extension workers.

### Design Principles

- Simple navigation
- Large touch-friendly buttons
- Minimal technical terminology
- Clear disease severity indicators
- Visual risk indicators
- Mobile-first design
- Regional language support
- Fast image-upload workflow
- Accessible color and typography
- Clear next actions

### Main Screens

```text
Home
│
├── Scan Your Crop
│   ├── Upload / Capture
│   ├── Crop Details
│   └── Analysis Result
│
├── Diseases
│   ├── Disease Library
│   └── Symptoms
│
├── Crops
│   └── Crop Information
│
├── Diagnosis
│   └── Scan History
│
├── Weather
│   └── Risk Forecast
│
├── Marketplace
│
└── Learn
    ├── Disease Guides
    ├── IPM
    └── Pesticide Safety
```

---

# 📱 Mobile Experience

The farmer-facing experience should also be available as a mobile/PWA interface.

Flow:

```text
क्षेत्रिकः
│
├── Scan Crop
│
├── Recent Scans
│
├── Crop Health
│
├── Learn
│
└── Profile
```

The mobile experience prioritizes:

**Scan → Result → Action**

rather than requiring farmers to navigate through complicated menus.

---

# 🤖 AI Prediction Pipeline

```text
Input Image
     ↓
Image Validation
     ↓
Crop Detection
     ↓
Image Preprocessing
     ↓
AI Classification
     ↓
Disease Probability
     ↓
Confidence Threshold
     ↓
┌─────────────────────┐
│                     │
│ High Confidence     │ Low Confidence
│                     │
▼                     ▼
Recommendation     Expert Referral
     │                   │
     └─────────┬─────────┘
               ▼
        Field Confirmation
               ↓
        Feedback Dataset
               ↓
         Model Improvement
```

---

# 📈 Risk Prediction Engine

The disease-risk engine can combine multiple factors:

```text
Risk Score =
    Weather Risk
  + Crop Stage Risk
  + Historical Disease Risk
  + Local Reports
  + Disease Prevalence
```

Example:

```text
Temperature       → High contribution
Humidity          → High contribution
Recent Rainfall   → Medium contribution
Crop Stage        → High contribution
Historical Cases  → Medium contribution
Nearby Reports    → High contribution

                  ↓

             Risk Score
                  ↓
             HIGH RISK
```

This allows क्षेत्रिकः to move beyond **image-based diagnosis** toward **predictive crop-health surveillance**.

---

# 🧠 Learning From Field Confirmations

One of the most important components of क्षेत्रिकः is the feedback loop.

```text
AI Prediction
      ↓
Farmer / Expert Confirmation
      ↓
Confirmed Diagnosis
      ↓
Database
      ↓
Dataset Improvement
      ↓
Model Evaluation
      ↓
Improved Future Predictions
```

This enables the system to become increasingly relevant to:

- Local crops
- Local varieties
- Regional climate
- Local disease patterns
- Indian agricultural conditions

---

# 📊 Success Metrics

क्षेत्रिकः can measure the following:

### AI Metrics

- Accuracy
- Precision
- Recall
- F1 Score
- Confusion Matrix
- Top-1 / Top-3 accuracy
- Confidence calibration

### Platform Metrics

- Number of scans
- Number of active farmers
- Number of detected diseases
- Expert validation rate
- Average response time
- Referral rate
- Follow-up completion rate

### Agricultural Impact

- Earlier disease detection
- Reduced crop loss
- Reduced unnecessary pesticide usage
- Faster extension response
- Increased surveillance coverage
- Improved preventive intervention planning

---

---

# 🧪 API Flow

### Create Crop Scan

```http
POST /api/scans
```

```json
{
  "crop": "Rice",
  "cropAge": "45-60 days",
  "growingStage": "Tillering",
  "location": {
    "district": "Cuttack",
    "state": "Odisha"
  },
  "image": "crop-image.jpg"
}
```

### Response

---

## Deployment (Vercel)

Recommended: deploy to Vercel for seamless Next.js support.

Web method:

1. Sign in to https://vercel.com with GitHub.
2. Import your `Kshetrikah` repository and select the `main` branch.
3. Set Environment Variables in the Project Settings (use values from `.env.example`).
4. Vercel auto-detects Next.js; build command: `npm run build`.

CLI method (optional):

```bash
npx vercel login
npx vercel --prod
```

Files added to help deployment:

- `.env.example` — template for environment variables.
- `vercel.json` — references project secrets for Vercel deployment.

If you want, I can: connect the GitHub repo in Vercel, add the environment variables, and trigger the first deploy.

```json
{
  "disease": "Brown Spot",
  "scientificName": "Bipolaris oryzae",
  "confidence": 0.92,
  "severity": "Moderate",
  "risk": "High",
  "requiresExpertReview": false
}
```

---

# 🏆 SIH 2026 Alignment

क्षेत्रिकः directly addresses the expected outcomes of the problem statement.

| SIH Requirement                    | क्षेत्रिकः Solution                        |
| ---------------------------------- | ----------------------------------------- |
| Image-based symptom identification | AI crop-image analysis                    |
| Weather-based forecasting          | Weather risk engine                       |
| Geospatial hotspot mapping         | Disease risk map                          |
| Expert validation                  | Expert review workflow                    |
| Multilingual advisories            | Regional language support                 |
| Integrated pest management         | IPM recommendation engine                 |
| Safe input usage                   | Safety-focused treatment guidance         |
| Extension referral                 | Low-confidence/critical-case referral     |
| Follow-up monitoring               | Scan history + follow-up                  |
| Learning from field confirmations  | AI feedback loop                          |
| Agriculture official dashboard     | Regional surveillance dashboard           |
| Earlier detection                  | AI + predictive risk alerts               |
| Reduced crop loss                  | Early intervention                        |
| Targeted pesticide use             | Context-aware IPM                         |
| Faster extension response          | Geospatial alerts and case prioritization |

---

# 🌍 Expected Impact

क्षेत्रिकः aims to create a shift from:

```text
Reactive Agriculture
        ↓
Disease appears
        ↓
Farmer notices damage
        ↓
Expert search
        ↓
Diagnosis
        ↓
Treatment
```

to:

```text
Preventive & Intelligent Agriculture
        ↓
Weather + Crop + Field Data
        ↓
Risk Forecast
        ↓
Early Image Detection
        ↓
AI + Expert Validation
        ↓
Targeted IPM
        ↓
Follow-up Monitoring
```

### Expected Benefits

🌱 **Earlier disease detection**
💰 **Reduced crop losses**
🧪 **More targeted pesticide usage**
👨‍🌾 **Better farmer decision-making**
🧑‍🔬 **Faster expert intervention**
🗺️ **Improved disease surveillance**
📊 **Better agricultural planning**
🌦️ **Preventive weather-based alerts**

---

# 🔮 Future Scope

Potential future improvements include:

- Satellite-based crop-health monitoring
- Drone imagery
- Offline-first diagnosis
- Voice-based farmer assistant
- WhatsApp/SMS alerts
- Government agricultural-data integration
- Disease outbreak prediction
- Regional disease forecasting
- Computer-vision severity estimation
- Automatic crop-stage detection
- AI-powered agricultural voice assistant
- Personalized farm-health scores

---

# ⚠️ Responsible AI & Safety

क्षेत्रिकः is designed as a **decision-support system**, not a replacement for agricultural experts.

AI predictions can be incorrect because of:

- Poor image quality
- Unseen diseases
- Similar-looking symptoms
- Environmental variations
- Regional crop differences
- Insufficient training data

Low-confidence, severe, unusual, or potentially high-impact cases should be **referred to agricultural experts or laboratories**.

Treatment recommendations should follow applicable agricultural regulations, approved labels, local extension guidance, and safe-use practices.

---

# 📄 License

This project is being developed for **Smart India Hackathon 2026**.

---

# 👥 Team Bitheads

**Project:** क्षेत्रिकः (Kshetrikah)
**Theme:** AI + Agriculture + Climate Intelligence
**Event:** Smart India Hackathon 2026

> 🌱 **Scan. Detect. Protect.**
>
> **क्षेत्रिकः — Smart Farming. Healthy Future.**
