'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Leaf,
  Bug,
  ShieldCheck,
  Sprout,
  FlaskConical,
  Calendar,
} from 'lucide-react';
import { diseaseMap, diseases } from '@/data/diseases';
import { cropMap } from '@/data/crops';
import { DiseaseCard } from '@/components/disease-card';
import { cn } from '@/lib/utils';

const SEVERITY_COLOR = {
  low: 'bg-emerald-100 text-emerald-800',
  moderate: 'bg-amber-100 text-amber-800',
  high: 'bg-orange-100 text-orange-800',
  severe: 'bg-red-100 text-red-800',
};

export default function DiseaseDetailPage() {
  const params = useParams<{ id: string }>();
  const disease = diseaseMap[params.id];
  const t = useTranslations('disease');
  const tSeverity = useTranslations('severity');
  const tCrops = useTranslations('crops');
  const locale = useLocale();

  if (!disease) {
    notFound();
  }

  const crop = cropMap[disease.crop];
  const relatedDiseases = diseases
    .filter((d) => d.crop === disease.crop && d.id !== disease.id)
    .slice(0, 3);

  return (
    <div className="container-narrow py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-leaf-600">
        <ol className="flex items-center gap-2 flex-wrap">
          <li>
            <Link href={`/${locale}/library`} className="hover:text-leaf-900 inline-flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('backToLibrary')}
            </Link>
          </li>
          <li className="text-leaf-400">/</li>
          <li>
            <Link href={`/${locale}/crops/${crop.id}`} className="hover:text-leaf-900">
              {tCrops(crop.id)}
            </Link>
          </li>
          <li className="text-leaf-400">/</li>
          <li className="text-leaf-900 font-medium truncate">{disease.name}</li>
        </ol>
      </nav>

      {/* Hero card */}
      <header className="card-static overflow-hidden mb-8">
        <div className="relative h-40 sm:h-48 bg-gradient-to-br from-leaf-100 to-cream-100 flex items-center justify-center">
          <span className="text-7xl sm:text-8xl opacity-90">{crop.emoji}</span>
          <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
            <span
              className={cn(
                'chip text-xs',
                SEVERITY_COLOR[disease.severity]
              )}
            >
              {disease.severity === 'severe' && (
                <AlertTriangle className="w-3 h-3" />
              )}
              {tSeverity(disease.severity)}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-leaf-900">
            {disease.name}
          </h1>
          <p className="mt-2 text-leaf-700 italic">{disease.pathogen}</p>
          <p className="mt-4 text-leaf-800 leading-relaxed">{disease.shortDesc}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="chip">
              <Leaf className="w-3 h-3" />
              {tCrops(disease.crop)}
            </span>
            <span className="chip">
              <Calendar className="w-3 h-3" />
              {disease.bestSeason === 'year-round' ? 'Year-round' : disease.bestSeason}
            </span>
            <span className="chip">
              <Bug className="w-3 h-3" />
              {disease.affectedParts.length} parts affected
            </span>
          </div>
        </div>
      </header>

      {/* Warning */}
      <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-4 sm:p-5 mb-8 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-900 leading-relaxed">{t('warning')}</p>
      </div>

      {/* Quick ID checklist */}
      <Section icon={CheckCircle2} title={t('quickId')}>
        <ul className="space-y-2">
          {disease.symptoms.map((s, i) => (
            <li key={i} className="flex gap-3 text-leaf-800">
              <span className="grid place-items-center w-6 h-6 rounded-full bg-leaf-100 text-leaf-700 shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <span className="leading-relaxed">{s}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Causes */}
      <Section icon={FlaskConical} title={t('causes')}>
        <p className="text-leaf-800 leading-relaxed">{disease.causes}</p>
      </Section>

      {/* Two-column treatments */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Section icon={Sprout} title={t('organicTreatment')} variant="leaf">
          <ul className="space-y-2">
            {disease.organicTreatment.map((s, i) => (
              <li key={i} className="flex gap-2 text-leaf-800">
                <span className="text-leaf-500 mt-1">●</span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={FlaskConical} title={t('chemicalTreatment')} variant="warn">
          <ul className="space-y-2">
            {disease.chemicalTreatment.map((s, i) => (
              <li key={i} className="flex gap-2 text-leaf-800">
                <span className="text-amber-600 mt-1">●</span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* Prevention */}
      <Section icon={ShieldCheck} title={t('prevention')}>
        <ul className="grid gap-2 sm:grid-cols-2">
          {disease.prevention.map((s, i) => (
            <li
              key={i}
              className="flex gap-3 p-3 rounded-xl bg-leaf-50 ring-1 ring-leaf-100 text-leaf-800 text-sm"
            >
              <ShieldCheck className="w-4 h-4 text-leaf-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{s}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Related */}
      {relatedDiseases.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-leaf-900 mb-4">
            {t('relatedDiseases')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedDiseases.map((d) => (
              <DiseaseCard key={d.id} disease={d} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
  variant = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'leaf' | 'warn';
}) {
  const iconStyles = {
    default: 'bg-leaf-100 text-leaf-700',
    leaf: 'bg-leaf-100 text-leaf-700',
    warn: 'bg-amber-100 text-amber-700',
  }[variant];

  return (
    <section className="mb-8">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-leaf-900 mb-4 flex items-center gap-2.5">
        <span className={cn('grid place-items-center w-9 h-9 rounded-xl', iconStyles)}>
          <Icon className="w-4.5 h-4.5" />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
