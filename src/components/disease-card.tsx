'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import type { Disease } from '@/data/types';
import { cn } from '@/lib/utils';

const SEVERITY_COLOR: Record<string, string> = {
  low: 'bg-emerald-100 text-emerald-800',
  moderate: 'bg-amber-100 text-amber-800',
  high: 'bg-orange-100 text-orange-800',
  severe: 'bg-red-100 text-red-800',
};

export function DiseaseCard({ disease }: { disease: Disease }) {
  const t = useTranslations('library');
  const tSeverity = useTranslations('severity');
  const tCrops = useTranslations('crops');
  const locale = useLocale();

  return (
    <Link
      href={`/${locale}/library/${disease.id}`}
      className="card group block p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={cn('chip', SEVERITY_COLOR[disease.severity])}>
          {disease.severity === 'severe' && (
            <AlertTriangle className="w-3 h-3" />
          )}
          {tSeverity(disease.severity)}
        </span>
        <span className="text-xs text-leaf-600 font-medium">
          {tCrops(disease.crop)}
        </span>
      </div>

      <h3 className="font-display text-lg font-bold text-leaf-900 group-hover:text-leaf-700 transition-colors">
        {disease.name}
      </h3>

      <p className="text-xs text-leaf-600 mt-1">{disease.pathogen}</p>

      <p className="text-sm text-leaf-700 mt-3 line-clamp-2">
        {disease.shortDesc}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {disease.symptomTypes.slice(0, 2).map((s) => (
            <span
              key={s}
              className="inline-flex items-center rounded-md bg-leaf-50 px-2 py-0.5 text-[10px] font-medium text-leaf-700 ring-1 ring-leaf-100"
            >
              {s}
            </span>
          ))}
          {disease.symptomTypes.length > 2 && (
            <span className="text-[10px] text-leaf-500 px-1">
              +{disease.symptomTypes.length - 2}
            </span>
          )}
        </div>
        <span className="text-leaf-600 text-xs font-medium flex items-center gap-1 group-hover:gap-1.5 transition-all">
          {t('viewDetails')}
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}
