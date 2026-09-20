'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  RotateCcw,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  History,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { initialFollowUpRecords } from '@/data/expertCases';
import type { FollowUpRecord, CropId } from '@/data/types';
import { crops } from '@/data/crops';
import { cn } from '@/lib/utils';

export default function MonitoringPage() {
  const t = useTranslations('monitoring');
  const tNav = useTranslations('nav');
  const tCrops = useTranslations('crops');
  const locale = useLocale();

  const [records, setRecords] = useState<FollowUpRecord[]>(initialFollowUpRecords);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Form state
  const [farmerName, setFarmerName] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('Yavatmal');
  const [crop, setCrop] = useState<CropId>('cotton');
  const [treatmentUsed, setTreatmentUsed] = useState('');
  const [treatmentType, setTreatmentType] = useState<'organic' | 'chemical' | 'integrated'>('integrated');
  const [dayInterval, setDayInterval] = useState<3 | 7 | 14>(7);
  const [outcome, setOutcome] = useState<'cured' | 'improved' | 'no_change' | 'worsened'>('cured');
  const [farmerFeedback, setFarmerFeedback] = useState('');

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: FollowUpRecord = {
      id: `FU-MH-${Math.floor(200 + Math.random() * 800)}`,
      farmerName: farmerName || 'Prabhakarrao Deshmukh',
      village: village || 'Taluka Gaon',
      district,
      crop,
      diseaseId: `${crop}-treatment-followup`,
      treatmentUsed: treatmentUsed || 'Recommended IPM schedule',
      treatmentType,
      dayInterval,
      outcome,
      farmerFeedback: farmerFeedback || 'Treatment followed according to KVK instructions with positive crop recovery.',
      followUpDate: new Date().toISOString().slice(0, 10),
    };

    setRecords([newRecord, ...records]);
    setSubmittedSuccess(true);
    setFarmerName('');
    setVillage('');
    setTreatmentUsed('');
    setFarmerFeedback('');
  };

  const outcomeBadge = (out: FollowUpRecord['outcome']) => {
    switch (out) {
      case 'cured':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'improved':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'no_change':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'worsened':
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  // Metric: overall cured/improved rate
  const positiveRate = Math.round(
    (records.filter((r) => r.outcome === 'cured' || r.outcome === 'improved').length /
      records.length) *
      100
  );

  return (
    <div className="container-narrow py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-leaf-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-leaf-100 text-leaf-800">
              <RotateCcw className="w-3.5 h-3.5 text-leaf-600" />
              Closed-Loop Self-Learning Intelligence
            </span>
            <span className="text-xs text-leaf-600">Field Confirmation Loop</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-leaf-950">
            {t('title')}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-leaf-700 max-w-2xl">
            {t('subtitle')}
          </p>
        </div>

        {/* Learning Stats */}
        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-leaf-200 shadow-soft">
          <div className="text-center px-2">
            <span className="text-xs text-leaf-600 block">{t('accuracyImprovement')}</span>
            <span className="text-xl font-bold font-display text-emerald-600">
              {positiveRate}% Success
            </span>
          </div>
          <div className="h-8 w-px bg-leaf-200" />
          <div className="text-center px-2">
            <span className="text-xs text-leaf-600 block">Confirmations</span>
            <span className="text-xl font-bold font-display text-leaf-900">
              {records.length} Logs
            </span>
          </div>
        </div>
      </div>

      {/* Recommended Recovery Timeline */}
      <div className="card p-6 space-y-4">
        <h3 className="font-display text-lg font-bold text-leaf-950 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-leaf-700" />
          {t('timeline')}
        </h3>
        <div className="grid gap-4 sm:grid-cols-3 text-xs">
          <div className="p-4 rounded-xl bg-leaf-50 border border-leaf-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-leaf-950 text-sm">Day 3 Inspection</span>
              <span className="px-2 py-0.5 rounded-full bg-leaf-200 text-leaf-800 font-semibold">
                Early Check
              </span>
            </div>
            <p className="text-leaf-700 leading-relaxed">
              Check whether lesion expansion has halted. Water-soaked rims should desiccate; adult moth catches in pheromone traps should begin dropping.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-leaf-50 border border-leaf-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-leaf-950 text-sm">Day 7 Validation</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                Key Milestone
              </span>
            </div>
            <p className="text-leaf-700 leading-relaxed">
              Inspect new leaf flush for absence of symptoms. In biocontrol treatments, confirm presence of fungal mycelia on target larvae or parasitized eggs.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-leaf-50 border border-leaf-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-leaf-950 text-sm">Day 14 Final Scan</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                Resolution
              </span>
            </div>
            <p className="text-leaf-700 leading-relaxed">
              Verify complete foliage recovery or flower/fruit set. If symptoms persist or flare, escalate directly to the KVK pathology laboratory.
            </p>
          </div>
        </div>
      </div>

      {/* Field Confirmation Form */}
      <div className="card p-6 bg-cream-50 border border-leaf-200 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-display text-xl font-bold text-leaf-950 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-leaf-700" />
              {t('confirmOutcome')}
            </h3>
            <p className="text-xs text-leaf-600 mt-0.5">
              Submit your real field results to validate treatment efficacy and improve regional agronomic advisories.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white border border-leaf-200 text-leaf-800">
            Model Reinforcement Feedback
          </span>
        </div>

        {submittedSuccess && (
          <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            Thank you! Your field confirmation has been logged and integrated into the regional disease intelligence index.
          </div>
        )}

        <form onSubmit={handleSubmitFeedback} className="grid gap-4 sm:grid-cols-3 text-xs">
          <div>
            <label className="block font-semibold text-leaf-800 mb-1">Farmer Name</label>
            <input
              type="text"
              required
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              placeholder="e.g. Tukaram Shinde"
              className="w-full px-3 py-2 rounded-lg border border-leaf-300 bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-leaf-800 mb-1">Village & District</label>
            <input
              type="text"
              required
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder="e.g. Wadki, Yavatmal"
              className="w-full px-3 py-2 rounded-lg border border-leaf-300 bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-leaf-800 mb-1">Crop</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value as CropId)}
              className="w-full px-3 py-2 rounded-lg border border-leaf-300 bg-white font-medium"
            >
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {tCrops(c.id)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-leaf-800 mb-1">{t('treatmentApplied')}</label>
            <input
              type="text"
              required
              value={treatmentUsed}
              onChange={(e) => setTreatmentUsed(e.target.value)}
              placeholder="e.g. Trichocards + 5% Neem Oil"
              className="w-full px-3 py-2 rounded-lg border border-leaf-300 bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-leaf-800 mb-1">Treatment Category</label>
            <select
              value={treatmentType}
              onChange={(e) => setTreatmentType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-leaf-300 bg-white font-medium"
            >
              <option value="integrated">Integrated Pest Management (IPM)</option>
              <option value="organic">Organic / Biocontrol</option>
              <option value="chemical">CIBRC Chemical</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-leaf-800 mb-1">Observation Interval</label>
            <select
              value={dayInterval}
              onChange={(e) => setDayInterval(Number(e.target.value) as any)}
              className="w-full px-3 py-2 rounded-lg border border-leaf-300 bg-white font-medium"
            >
              <option value={3}>Day 3 Post-Treatment</option>
              <option value={7}>Day 7 Post-Treatment</option>
              <option value={14}>Day 14 Post-Treatment</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block font-semibold text-leaf-800 mb-1.5">
              {t('outcomeQuestion')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setOutcome('cured')}
                className={cn(
                  'p-2.5 rounded-xl border text-xs font-semibold text-center transition-all',
                  outcome === 'cured'
                    ? 'border-emerald-600 bg-emerald-100 text-emerald-950 ring-2 ring-emerald-500'
                    : 'border-leaf-200 bg-white hover:bg-emerald-50'
                )}
              >
                ✓ {t('cured')}
              </button>
              <button
                type="button"
                onClick={() => setOutcome('improved')}
                className={cn(
                  'p-2.5 rounded-xl border text-xs font-semibold text-center transition-all',
                  outcome === 'improved'
                    ? 'border-blue-600 bg-blue-100 text-blue-950 ring-2 ring-blue-500'
                    : 'border-leaf-200 bg-white hover:bg-blue-50'
                )}
              >
                ↑ {t('improved')}
              </button>
              <button
                type="button"
                onClick={() => setOutcome('no_change')}
                className={cn(
                  'p-2.5 rounded-xl border text-xs font-semibold text-center transition-all',
                  outcome === 'no_change'
                    ? 'border-amber-600 bg-amber-100 text-amber-950 ring-2 ring-amber-500'
                    : 'border-leaf-200 bg-white hover:bg-amber-50'
                )}
              >
                — {t('noChange')}
              </button>
              <button
                type="button"
                onClick={() => setOutcome('worsened')}
                className={cn(
                  'p-2.5 rounded-xl border text-xs font-semibold text-center transition-all',
                  outcome === 'worsened'
                    ? 'border-rose-600 bg-rose-100 text-rose-950 ring-2 ring-rose-500'
                    : 'border-leaf-200 bg-white hover:bg-rose-50'
                )}
              >
                ✕ {t('worsened')}
              </button>
            </div>
          </div>

          <div className="sm:col-span-3">
            <label className="block font-semibold text-leaf-800 mb-1">
              {t('feedbackNotes')}
            </label>
            <textarea
              rows={2}
              value={farmerFeedback}
              onChange={(e) => setFarmerFeedback(e.target.value)}
              placeholder="What changes did you observe in insect numbers or leaf health? Any spray phytotoxicity?"
              className="w-full px-3 py-2 rounded-lg border border-leaf-300 bg-white"
            />
          </div>

          <div className="sm:col-span-3">
            <button type="submit" className="btn-primary text-xs px-6 py-2.5 font-semibold flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" />
              {t('submitFeedback')}
            </button>
          </div>
        </form>
      </div>

      {/* Verified Field Testimonials Feed */}
      <div className="card p-6 space-y-4">
        <h3 className="font-display text-xl font-bold text-leaf-950 flex items-center gap-2">
          <History className="w-5 h-5 text-leaf-700" />
          Recent Field Confirmation Records
        </h3>

        <div className="space-y-3">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-xl bg-white border border-leaf-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-soft"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-leaf-950 text-sm">
                    {rec.farmerName}
                  </span>
                  <span className="text-leaf-600">• {rec.village}, {rec.district}</span>
                  <span className="px-2 py-0.5 rounded-full bg-leaf-100 text-leaf-800 font-semibold uppercase text-[10px]">
                    {rec.crop}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase',
                      outcomeBadge(rec.outcome)
                    )}
                  >
                    {rec.outcome.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-leaf-600">
                  <span className="font-semibold text-leaf-800">Treatment:</span> {rec.treatmentUsed} (Day {rec.dayInterval} check)
                </p>
                <p className="text-leaf-800 italic">"{rec.farmerFeedback}"</p>
              </div>

              <div className="text-[11px] text-leaf-500 shrink-0">
                {rec.followUpDate}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
