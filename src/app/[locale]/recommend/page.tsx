'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { ArrowRight, Sprout, Leaf, Droplets, BadgeCheck, ChartNoAxesCombined, Download } from 'lucide-react';

const soilOptions = ['Sandy', 'Loamy', 'Black', 'Red', 'Clayey'];
const cropOptions = ['Rice', 'Maize', 'Wheat', 'Cotton', 'Sugarcane', 'Tomato', 'Potato', 'Chili'];

type RecommendationType = 'crop' | 'fertilizer';

type CropPayload = {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
};

type FertilizerPayload = {
  temperature: number;
  humidity: number;
  moisture: number;
  soilType: string;
  cropType: string;
  nitrogen: number;
  potassium: number;
  phosphorous: number;
};

const initialCrop: CropPayload = {
  nitrogen: 90,
  phosphorus: 42,
  potassium: 43,
  temperature: 20.88,
  humidity: 82,
  ph: 6.5,
  rainfall: 202.94,
};

const initialFertilizer: FertilizerPayload = {
  temperature: 26,
  humidity: 52,
  moisture: 38,
  soilType: 'Sandy',
  cropType: 'Maize',
  nitrogen: 37,
  potassium: 0,
  phosphorous: 0,
};

export default function RecommendationPage() {
  const [type, setType] = useState<RecommendationType>('crop');
  const [cropData, setCropData] = useState<CropPayload>(initialCrop);
  const [fertilizerData, setFertilizerData] = useState<FertilizerPayload>(initialFertilizer);
  const [result, setResult] = useState<null | { label?: string; name?: string; confidence?: number; score?: number; input?: unknown }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePdfReport = () => {
    if (!result) return;

    const doc = new jsPDF();
    const title = type === 'crop' ? 'CROP RECOMMENDATION REPORT' : 'FERTILIZER ADVISORY REPORT';
    const currentDate = new Date().toLocaleString();
    const reportRef = `KSH-REC-${Date.now().toString().slice(-6)}`;
    const inputData = type === 'crop' ? cropData : fertilizerData;
    const recommendedValue = result.label ?? result.name ?? 'N/A';
    const scoreValue = result.confidence !== undefined ? `${(result.confidence * 100).toFixed(1)}%` : `${(Number(result.score ?? 0) * 100).toFixed(1)}%`;

    // Header Banner
    doc.setFillColor(21, 128, 61);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text(`KSHETRIKAH - ${title}`, 14, 16);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Government of Maharashtra • ICAR Agro-Climatic Decision Support System', 14, 24);

    // Meta Bar
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8.5);
    doc.text(`Report Reference: ${reportRef}`, 14, 38);
    doc.text(`Generated: ${currentDate}`, 120, 38);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 41, 196, 41);

    // Section 1: Recommendation Outcome Card
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(14, 47, 182, 34, 2, 2, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(14, 47, 182, 34, 2, 2, 'S');

    doc.setFontSize(10);
    doc.setTextColor(21, 128, 61);
    doc.setFont('helvetica', 'bold');
    doc.text(type === 'crop' ? 'OPTIMAL CROP ADVISORY' : 'TARGETED FERTILIZER SPECIFICATION', 20, 56);

    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(String(recommendedValue).toUpperCase(), 20, 66);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Statistical Match Confidence: ${scoreValue} • Calibrated with ICAR soil agro-climatic clusters`, 20, 74);

    // Section 2: Soil & Environmental Telemetry Table
    doc.setFontSize(11);
    doc.setTextColor(21, 128, 61);
    doc.setFont('helvetica', 'bold');
    doc.text('SOIL & MICROCLIMATE PARAMETERS', 14, 91);

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 95, 182, 54, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, 95, 182, 54, 2, 2, 'S');

    const entries = Object.entries(inputData as Record<string, string | number>);
    const col1 = entries.slice(0, Math.ceil(entries.length / 2));
    const col2 = entries.slice(Math.ceil(entries.length / 2));

    let rowY = 103;
    col1.forEach(([k, v]) => {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${k.toUpperCase()}:`, 20, rowY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(String(v), 58, rowY);
      rowY += 9;
    });

    rowY = 103;
    col2.forEach(([k, v]) => {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${k.toUpperCase()}:`, 110, rowY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(String(v), 148, rowY);
      rowY += 9;
    });

    // Section 3: Agronomic Recommendation Summary
    let sumY = 160;
    doc.setFontSize(11);
    doc.setTextColor(21, 128, 61);
    doc.setFont('helvetica', 'bold');
    doc.text('AGRONOMIC GUIDELINES & NEXT STEPS', 14, sumY);

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, sumY + 4, 182, 38, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, sumY + 4, 182, 38, 2, 2, 'S');

    const summary = type === 'crop'
      ? `Based on entered N-P-K mineral levels, soil pH, ambient temperature, humidity, and rainfall index, ${recommendedValue} provides the highest physiological vigor, water-use efficiency, and yield margin for this agro-climatic zone.`
      : `Based on current soil nutrient depletion telemetry and target crop demand, ${recommendedValue} restores required balance without causing soil salinity stress or fertilizer runoff.`;
    
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const summaryLines = doc.splitTextToSize(summary, 172);
    doc.text(summaryLines, 18, sumY + 12);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61);
    doc.text('• Soil Test Verification:', 18, sumY + 28);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Re-verify with local Soil Health Card (SHC) laboratory once every crop season.', 62, sumY + 28);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61);
    doc.text('• Application Timing:', 18, sumY + 35);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Apply split doses during morning hours with adequate soil moisture.', 62, sumY + 35);

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 275, 196, 275);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text('Kshetrikah Precision Agronomy Decision Support System • Government of Maharashtra MSInS', 14, 281);
    doc.text('Official Advisory', 172, 281);

    doc.save(`${type}-recommendation-report-${Date.now()}.pdf`);
  };

  const handleChange = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    key: string,
    value: string
  ) => {
    setter((prev: any) => ({ ...prev, [key]: Number.isFinite(Number(value)) ? Number(value) : value }));
  };

  const submitRecommendation = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = type === 'crop' ? { type: 'crop', ...cropData } : { type: 'fertilizer', ...fertilizerData };
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok || !json.ok) {
        throw new Error(json.error || 'Unable to fetch recommendation.');
      }

      setResult(json.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch recommendation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-narrow py-10 sm:py-14">
      <header className="mb-8 text-center max-w-3xl mx-auto">
        <span className="chip mb-4">
          <Sprout className="w-3.5 h-3.5" />
          Smart crop planning
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-leaf-900">
          Crop & fertilizer recommendation engine
        </h1>
        <p className="mt-3 text-leaf-700">
          Use the prepared dataset to recommend the best crop or fertilizer mix from your field conditions.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <section className="card p-5 sm:p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            <ModeButton active={type === 'crop'} onClick={() => setType('crop')} label="Crop recommendation" icon={<Leaf className="w-4 h-4" />} />
            <ModeButton active={type === 'fertilizer'} onClick={() => setType('fertilizer')} label="Fertilizer recommendation" icon={<Droplets className="w-4 h-4" />} />
          </div>

          {type === 'crop' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nitrogen (N)" value={cropData.nitrogen} onChange={(value) => handleChange(setCropData, 'nitrogen', value)} />
              <Field label="Phosphorus (P)" value={cropData.phosphorus} onChange={(value) => handleChange(setCropData, 'phosphorus', value)} />
              <Field label="Potassium (K)" value={cropData.potassium} onChange={(value) => handleChange(setCropData, 'potassium', value)} />
              <Field label="Temperature (°C)" value={cropData.temperature} onChange={(value) => handleChange(setCropData, 'temperature', value)} />
              <Field label="Humidity (%)" value={cropData.humidity} onChange={(value) => handleChange(setCropData, 'humidity', value)} />
              <Field label="pH" value={cropData.ph} onChange={(value) => handleChange(setCropData, 'ph', value)} step="0.01" />
              <Field label="Rainfall (mm)" value={cropData.rainfall} onChange={(value) => handleChange(setCropData, 'rainfall', value)} className="sm:col-span-2" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Temperature (°C)" value={fertilizerData.temperature} onChange={(value) => handleChange(setFertilizerData, 'temperature', value)} />
              <Field label="Humidity (%)" value={fertilizerData.humidity} onChange={(value) => handleChange(setFertilizerData, 'humidity', value)} />
              <Field label="Moisture (%)" value={fertilizerData.moisture} onChange={(value) => handleChange(setFertilizerData, 'moisture', value)} />
              <SelectField
                label="Soil type"
                value={fertilizerData.soilType}
                options={soilOptions}
                onChange={(value) => handleChange(setFertilizerData, 'soilType', value)}
              />
              <SelectField
                label="Crop type"
                value={fertilizerData.cropType}
                options={cropOptions}
                onChange={(value) => handleChange(setFertilizerData, 'cropType', value)}
              />
              <Field label="Nitrogen (N)" value={fertilizerData.nitrogen} onChange={(value) => handleChange(setFertilizerData, 'nitrogen', value)} />
              <Field label="Potassium (K)" value={fertilizerData.potassium} onChange={(value) => handleChange(setFertilizerData, 'potassium', value)} />
              <Field label="Phosphorous (P)" value={fertilizerData.phosphorous} onChange={(value) => handleChange(setFertilizerData, 'phosphorous', value)} />
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={submitRecommendation}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-leaf-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-leaf-700 disabled:opacity-60"
            >
              {loading ? 'Checking dataset...' : 'Get recommendation'}
              <ArrowRight className="w-4 h-4" />
            </button>

            {result && (
              <button
                type="button"
                onClick={generatePdfReport}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-700"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>

        <aside className="card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4 text-leaf-800">
            <ChartNoAxesCombined className="w-5 h-5" />
            <h2 className="font-display text-xl font-bold">Result</h2>
          </div>

          {!result ? (
            <div className="rounded-2xl border border-dashed border-leaf-200 bg-leaf-50 p-6 text-sm text-leaf-700">
              Submit field values to see the recommendation generated from the dataset.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-leaf-600 to-emerald-500 p-4 text-white shadow-soft">
                <div className="text-xs uppercase tracking-[0.2em] text-emerald-100/80">Recommended</div>
                <div className="mt-2 text-2xl font-display font-black">
                  {result.label ?? result.name ?? 'Unknown'}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <StatBox label="Confidence" value={result.confidence !== undefined ? `${(result.confidence * 100).toFixed(1)}%` : `${(Number(result.score ?? 0) * 100).toFixed(1)}%`} />
                <StatBox label="Type" value={type === 'crop' ? 'Crop' : 'Fertilizer'} />
              </div>

              <div className="rounded-xl border border-leaf-200 bg-leaf-50 p-4 text-sm text-leaf-800">
                <div className="flex items-center gap-2 font-semibold text-leaf-900 mb-2">
                  <BadgeCheck className="w-4 h-4 text-emerald-600" />
                  Recommendation summary
                </div>
                <p>
                  {type === 'crop'
                    ? `The model suggests growing ${result.label} based on the provided soil and weather inputs.`
                    : `The field matches ${result.name} with a dataset score of ${(Number(result.score ?? 0) * 100).toFixed(1)}%.`}
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function ModeButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition',
        active ? 'bg-leaf-600 text-white shadow-soft' : 'bg-leaf-50 text-leaf-800 ring-1 ring-leaf-200 hover:bg-leaf-100',
      ].join(' ')}
    >
      {icon}
      {label}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  step = '1',
  className = '',
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
  step?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-leaf-800">{label}</span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-leaf-200 bg-white px-3 py-2.5 text-sm text-leaf-900 outline-none ring-0 transition focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-leaf-800">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-leaf-200 bg-white px-3 py-2.5 text-sm text-leaf-900 outline-none ring-0 transition focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-leaf-200 bg-leaf-50 p-3">
      <div className="text-[11px] uppercase tracking-wide text-leaf-600">{label}</div>
      <div className="mt-1 text-lg font-bold text-leaf-900">{value}</div>
    </div>
  );
}
