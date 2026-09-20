# Kshetrikah Project: Full Backend and Frontend Overview

## 1. Project identity

Kshetrikah (क्षेत्रिकः) is an AI-powered crop disease detection and smart farm management platform designed for Indian farmers, agronomists, and agriculture officials. The system helps users:

- upload a crop image
- detect likely crop diseases
- combine symptom, crop, and environmental data
- estimate weather-driven disease risk
- generate integrated pest management (IPM) plans
- escalate cases for expert review
- monitor outbreak hotspots and agricultural advisories
- support multilingual access for farmers

The project is positioned as a Smart India Hackathon style agricultural intelligence platform, with a strong focus on early detection, localized recommendations, and digital field support.

---

## 2. Tech stack

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- next-intl for localization
- Framer Motion for animation
- Lucide React icons
- jsPDF for export support

### Backend
- Next.js App Router API routes
- Server-side route handlers in `src/app/api`
- Node.js runtime
- In-memory caching
- Local persistence using JSON WAL storage
- AI provider integration via remote APIs

### AI and data layer
- Crop-disease diagnosis logic in `src/data`
- Weather-risk scoring logic in `src/data/weatherRisk.ts`
- Multi-input Bayesian fusion in `src/lib/multiInputFusion.ts`
- Local image analysis in `src/lib/imageAnalysis.ts`
- Disease and crop datasets from `data/Datasets/`
- Persistent record storage in `data/scans_wal.json`

---

## 3. Project structure

```text
Kshetrikah_final/
├── README.md
├── FINAL_REMAINING_TASKS.md
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
├── public/
├── data/
│   ├── scans_wal.json
│   ├── clean_trainable/
│   ├── Datasets/
│   └── merged_dataset/
├── messages/
│   ├── en.json
│   ├── hi.json
│   ├── mr.json
│   └── other Indian language files
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   └── api/
│   ├── components/
│   ├── data/
│   ├── i18n/
│   ├── lib/
│   └── middleware.ts
├── scripts/
└── artifacts/
```

### Important folders

#### `src/app`
This is the main app routing layer. It contains:
- localized user pages under `src/app/[locale]`
- backend API endpoints under `src/app/api`
- global app layout and internationalized root structure

#### `src/components`
Reusable frontend UI components such as:
- `site-header.tsx`
- `site-footer.tsx`
- `language-switcher.tsx`
- `theme-customizer.tsx`
- `crop-card.tsx`
- `disease-card.tsx`

#### `src/data`
Core domain data and rule-engine modules. This is the heart of the application logic for diagnoses, crops, diseases, weather, pests, regions, and advisories.

#### `src/lib`
Business logic and infrastructure modules:
- `scanPersistence.ts` = scan cache and local history
- `dbPersistence.ts` = WAL database and expert routing
- `managementPlan.ts` = IPM plan generation
- `imageAnalysis.ts` = image quality and preprocessing
- `multiInputFusion.ts` = Bayesian fusion with weather, disease, sensor and trap inputs
- `agriDatasets.ts` = crop and fertilizer recommendations
- `gisClustering.ts` = outbreak cluster logic
- `security.ts` = image validation and sanitization
- `apiKeyPool.ts` = AI key failover logic
- `rateLimiter.ts` = API rate limiting

---

## 4. Frontend architecture

The frontend is built using Next.js App Router with locale-aware routes. The main locale wrapper is:

- `src/app/[locale]/layout.tsx`

This wraps pages with:
- `NextIntlClientProvider`
- locale-based direction (`rtl` for some languages such as Urdu and Kashmiri)
- `SiteHeader`
- `SiteFooter`

### Locale and i18n layer
- `src/i18n/request.ts`
- `src/i18n/routing.ts`
- `src/middleware.ts`

This enables localized routing and multilingual support. The project uses `messages/*.json` files for translations. The app supports multiple Indian languages and includes locale-specific flow logic.

### Main frontend pages

#### Home page
- `src/app/[locale]/page.tsx`
- Hero section, product pitch, CTA buttons, stats, module highlights
- Uses localization and marketing-style landing page design

#### Wizard diagnosis flow
- `src/app/[locale]/wizard/page.tsx`
- Multi-step crop disease diagnosis assistant
- Steps include crop selection, affected part, symptoms, conditions, image upload, region, weather, results
- Collects image, weather, crop stage, soil type, regional and pest trap inputs
- Calls `/api/scan` to diagnose and produce a final result

#### Recommendation page
- `src/app/[locale]/recommend/page.tsx`
- Used for crop and fertilizer recommendation logic
- Sends POST requests to `/api/recommend`

#### Map and GIS page
- `src/app/[locale]/map/page.tsx`
- Likely visualizes disease hotspots and outbreak clusters

#### Expert triage page
- `src/app/[locale]/expert/page.tsx`
- Queries pending expert cases and review queue

#### Monitoring and officials pages
- `src/app/[locale]/monitoring/page.tsx`
- `src/app/[locale]/officials/page.tsx`
- Intended for government and agriculture department dashboards

#### Crop, library, advisory, traps pages
- `src/app/[locale]/crops/*`
- `src/app/[locale]/library/*`
- `src/app/[locale]/advisory/*`
- `src/app/[locale]/traps/*`
- `src/app/[locale]/about/*`

These pages provide disease info, crop guidance, advisory content, and field monitoring workflows.

---

## 5. Frontend user flow

The main experience is the diagnosis wizard.

### Step-by-step flow
1. Select crop
2. Choose affected plant part(s)
3. Select symptoms
4. Provide growing conditions
5. Upload or select sample image
6. Select region and weather condition
7. Run diagnosis
8. View:
   - likely disease
   - confidence level
   - severity
   - weather risk
   - management plan
   - recommended safe inputs
   - pest-trap recommendation

### Important front-end logic
The wizard uses:
- `useState` for step progression and data capture
- `useMemo` for computed diagnosis candidate results
- `fetch('/api/scan')` to send scan data
- local caching through `scanPersistence.ts`
- image quality handling via `imageAnalysis.ts`
- sensor/trap analysis for environmental risk fusion

This creates a hybrid AI + rule-based decision support system that behaves well even when external AI providers are unavailable.

---

## 6. Backend architecture

The backend is implemented through Next.js API route handlers under `src/app/api`.

### Core backend responsibilities
- validate incoming image and request payloads
- enforce rate limits
- sanitize image data
- run AI diagnosis providers in priority order
- perform local fallback diagnosis when AI is unavailable
- fuse image, weather, sensor, and trap inputs
- compute disease severity, weather risk, and treatment plans
- save records to persistent WAL storage
- support expert triage and dispute routing
- expose metrics and outbreak cluster data

---

## 7. Main backend endpoints

### `POST /api/scan`
This is the central disease diagnosis API.

#### Request payload includes
- `imageDataUrl`
- `crop`
- `symptoms`
- `parts`
- `conditions`
- `weather`
- `state` / `district` / `taluka`
- `locale`
- `cropStage`
- `variety`
- `soilType`
- `sensorInput`
- `trapInput`

#### Response includes
- `ok`
- `scanId`
- `result.disease`
- `result.aiConfidence`
- `result.aiReasoning`
- `result.weatherRisk`
- `result.plan`
- `result.provider`
- `result.detectedBoxes`
- `result.infectionGrade`
- `result.fusion`

#### Backend flow
1. Rate-limit check using `scanRateLimiter`
2. JSON parsing and validation
3. Image sanitization and base64 cleaning
4. Cache hit check
5. Local model prediction attempt
6. AI provider attempt in order:
   - Gemini
   - NVIDIA NIM
   - Claude
7. Fallback to local heuristic matching if no AI service is configured
8. Save result to WAL database

### `GET /api/scans`
Returns recent scan records with filters such as:
- crop
- district
- severity
- kvkStatus
- feedback
- limit

Used by the monitoring and expert dashboards.

### `POST /api/scans`
Allows save or sync of scan records, including batch offline sync.

### `POST /api/scans/feedback`
Stores whether a diagnosis was:
- confirmed
- disputed

This is important for active learning and expert review.

### `POST /api/scans/dispute`
Escalates a scan to agronomist triage with a dispute reason and farmer metadata.

### `GET /api/health`
System health status endpoint. Includes:
- uptime
- AI provider status
- storage status
- memory stats
- service status

### `GET /api/metrics`
Provides metrics for:
- total scans
- disputed scans
- confirmed scans
- pending triage cases
- Gemini key pool health
- outbreak cluster count
- memory usage

### `GET /api/gis/clusters`
Calculates outbreak clusters using scan data and GIS clustering logic.

### `POST /api/recommend`
Returns crop and fertilizer recommendations using CSV datasets.

#### Supported types
- `crop`
- `fertilizer`

---

## 8. AI provider strategy

The scan API is designed to be resilient and multi-provider.

### Supported AI pipeline
1. Local disease model prediction
2. Gemini with key pool and failover
3. NVIDIA NIM vision model
4. Claude Anthropic fallback
5. Local edge Bayesian heuristic fallback

This design allows the project to work even in low-resource or partially configured deployment environments.

### `geminiKeyPool`
The project includes a pooled API key mechanism for Gemini. That means it can rotate or fail over keys per request instead of failing immediately when one key hits a quota or rate limit.

### `localDiseaseModel`
The project includes local disease detection logic for a trained or lightweight model fallback. It tries to classify disease without relying completely on external APIs.

---

## 9. Data and logic models

### `src/data/types.ts`
This file defines the core domain types used across the project:
- crop IDs
- symptoms
- plant parts
- disease severity
- weather IDs
- crop stages
- soil types
- pest trap types
- management plan data
- disease schema
- GIS outbreak data

### Crop and disease definitions
- `src/data/crops.ts`
- `src/data/diseases.ts`
- `src/data/diagnosis.ts`
- `src/data/weatherRisk.ts`
- `src/data/regions.ts`
- `src/data/pestTraps.ts`
- `src/data/weather.ts`
- `src/data/advisory.ts`

These files encode the project’s disease library and rule-based reasoning logic. The diagnosis engine recommends disease candidates based on user-selected symptoms and conditions.

### Image analysis logic
- `src/lib/imageAnalysis.ts`

This module evaluates:
- image quality
- blur
- exposure
- vegetation presence
- lesion/leaf color hints
- bounding box heuristics for image diagnostics

### Multi-input fusion
- `src/lib/multiInputFusion.ts`

This is the most important intelligence layer. It combines:
- object detection/vision confidence
- weather risk
- soil and crop stage factors
- sensor readings
- trap counts
- local conditions

It produces a fused risk score and infection severity grade.

### Weather risk
- `src/data/weatherRisk.ts`

This computes disease risk from weather events and crop conditions. It uses humidity, rainfall, temperature, crop stage, and field conditions to produce a risk score and reasons.

### Management plan generation
- `src/lib/managementPlan.ts`

This builds:
- immediate actions
- cultural control steps
- biological control steps
- chemical treatment recommendations
- prevention steps
- monitoring plan
- safe input guidance and pest trap advice

This keeps the project focused on Integrated Pest Management rather than simply recommending pesticides.

---

## 10. Persistence and storage

### `src/lib/dbPersistence.ts`
This file implements a write-ahead log (WAL) style database engine that stores diagnosis records in JSON.

It persists:
- scan IDs
- timestamps
- crop and disease information
- confidence and fused score
- severity
- risk level
- provider used
- district and taluka
- feedback
- KVK triage state

The WAL file is:
- `data/scans_wal.json`

This makes the project suitable for evidence tracking and expert review workflows.

### `src/lib/scanPersistence.ts`
This module handles:
- in-browser local scan cache
- scan history in browser storage
- rapid retrieval of recent results
- local saving of farmer scan records

### Why this matters
The app supports both:
- offline or low-latency local use
- persistent audit logs for farm field data and expert validation

---

## 11. Security and resilience

The project includes practical production-oriented safeguards.

### Security features
- `src/lib/security.ts`
- image sanitization and validation
- validation of MIME type and base64 payloads
- prevention of malformed or malicious data

### Rate limiting
- `src/lib/rateLimiter.ts`

Prevents abuse or overload of the diagnostic scan API.

### API key management
- `src/lib/apiKeyPool.ts`

Handles multiple API keys, fallbacks, cooldowns, and health tracking for external AI services.

### Caching
- memory cache + persistent scan cache reduce redundant provider calls and slow response times

---

## 12. Recommendation engine

The project includes agricultural recommendation logic through:

- `src/lib/agriDatasets.ts`
- `src/app/api/recommend/route.ts`

It reads CSV files from:
- `data/Datasets/Crop_recommendation.csv`
- `data/Datasets/Fertilizer_recommendation.csv`

These files are used to generate:
- crop recommendation based on soil and climate values
- fertilizer recommendation based on crop type, moisture, nitrogen, phosphorus, potassium, and other inputs

This is an important backend extension beyond image-based disease diagnosis.

---

## 13. GIS and outbreak monitoring

The project has a geospatial component for monitoring disease hotspots.

### Modules
- `src/lib/gisClustering.ts`
- `src/app/api/gis/clusters/route.ts`
- `src/app/api/metrics/route.ts`

### Purpose
- cluster outbreak locations by geographic proximity
- compute red/orange alert levels
- summarize active epidemic clusters
- support government dashboards and district-level monitoring

This is one of the strongest backend contributions of the system: beyond diagnosis, it creates outbreak surveillance capability.

---

## 14. Expert and KVK workflow

The app includes a review system for disputed or uncertain diagnoses.

### Flow
- farmer scans crop and receives diagnosis
- if confidence is low or farmer disputes the result, it is escalated
- the system records KVK/Expert status in WAL storage
- expert dashboard can review, confirm, or dispute cases

### Files involved
- `src/app/[locale]/expert/page.tsx`
- `src/app/api/scans/feedback/route.ts`
- `src/app/api/scans/dispute/route.ts`
- `src/lib/dbPersistence.ts`

This ensures the project is not just an AI black box; it includes real feedback loops for correctness and field validation.

---

## 15. Multilingual support

The app is designed for Indian farmers and agricultural staff across regions.

### Locale setup
- `messages/en.json`
- `messages/hi.json`
- `messages/mr.json`
- plus many other Indian-language JSON files

### Locale routing
- `src/app/[locale]/layout.tsx`
- `src/middleware.ts`
- `src/i18n/routing.ts`

This makes onboarding and advisory delivery easier for farmers who prefer regional languages.

---

## 16. Design and UI style

The app uses a modern agritech dashboard aesthetic:
- green, earthy, leaf-inspired palette
- cards, HUD panels, badges, progress bars
- dark hero banners with stats panels
- strong buttons and module tiles
- responsive layout for mobile and desktop users

This is useful because the product is built primarily for field use, where mobile friendliness and quick action are critical.

---

## 17. Runtime scripts

From `package.json`:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

### Typical local run
```bash
npm install
npm run dev
```

### Production build
```bash
npm run build
npm run start
```

---

## 18. Real project strengths

This project stands out because it combines several layers that are often separate in existing agricultural apps:

- crop disease image analysis
- environmental risk modeling
- field-condition logic
- recommendation engine
- multilingual UX
- government/agriculture dashboard capability
- expert triage and dispute handling
- persistent records and audit trail
- fallback safety when AI services are unavailable

This makes it more than a simple image classifier. It is a complete crop health decision-support platform.

---

## 19. Current project position

This is a production-oriented MVP/prototype with a strong agricultural use case. It is clearly designed for:
- farmers
- extension officers
- district agriculture teams
- KVK experts
- agronomists
- monitoring agencies

The codebase includes enough architecture to be extended into a deployable SaaS platform, a government dashboard, or a field-service application.

---

## 20. Summary

### Frontend overview
The frontend is a multilingual, responsive Next.js app with a guided crop disease wizard, recommendation pages, GIS and monitoring dashboards, expert review flows, and localized content.

### Backend overview
The backend is a robust Next.js API system that handles disease diagnosis, AI vision processing, weather and sensor fusion, rate limiting, secure image validation, persistent logs, recommendation services, and GIS monitoring.

### Core architecture pattern
The project uses a hybrid architecture:
- rule-based domain logic + AI providers
- local heuristics and edge fallback
- persistent WAL storage
- expert review and learning loop

That makes it practical, resilient, and suitable for real farmer-facing field use.

---

## 21. Main file references

- `README.md`
- `src/app/[locale]/wizard/page.tsx`
- `src/app/api/scan/route.ts`
- `src/lib/managementPlan.ts`
- `src/lib/dbPersistence.ts`
- `src/lib/agriDatasets.ts`
- `src/lib/multiInputFusion.ts`
- `src/lib/imageAnalysis.ts`
- `src/data/weatherRisk.ts`
- `src/data/types.ts`
- `src/i18n/request.ts`
- `src/middleware.ts`

---

## 22. Short conclusion

This project is a full-stack agricultural intelligence system designed for practical Indian field conditions. It blends AI, weather logic, agronomic knowledge, multilingual support, and monitoring infrastructure into a unified farmer-focused digital platform.
