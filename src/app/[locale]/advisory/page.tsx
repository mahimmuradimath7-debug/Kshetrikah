'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Calendar, Sparkles } from 'lucide-react';
import { crops } from '@/data/crops';
import { monthlyAdvisory } from '@/data/advisory';
import { cn } from '@/lib/utils';

export default function AdvisoryPage() {
  const t = useTranslations('advisory');
  const tCommon = useTranslations('common');
  const tCrops = useTranslations('crops');
  const locale = useLocale();

  const [cropFilter, setCropFilter] = useState<string>('all');
  const currentMonth = new Date().getMonth() + 1;

  const advisories = useMemo(() => {
    let list = [...monthlyAdvisory];
    if (cropFilter !== 'all') {
      list = list.filter((a) => a.crop === cropFilter);
    }
    return list.sort((a, b) => {
      // Current month first, then chronological
      const aDist = Math.min(
        Math.abs(a.month - currentMonth),
        12 - Math.abs(a.month - currentMonth)
      );
      const bDist = Math.min(
        Math.abs(b.month - currentMonth),
        12 - Math.abs(b.month - currentMonth)
      );
      if (aDist !== bDist) return aDist - bDist;
      return a.month - b.month;
    });
  }, [cropFilter, currentMonth]);

  return (
    <div className="container-narrow py-10 sm:py-14">
      {/* Hero */}
      <header className="mb-10 text-center max-w-2xl mx-auto">
        <span className="chip mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          {tCommon(`months.${currentMonth}` as any)}
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-leaf-900">
          {t('title')}
        </h1>
        <p className="mt-3 text-leaf-700">{t('subtitle')}</p>
      </header>

      {/* Filter */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin">
        <FilterChip
          active={cropFilter === 'all'}
          onClick={() => setCropFilter('all')}
          label={`🌍 All`}
        />
        {crops.map((c) => (
          <FilterChip
            key={c.id}
            active={cropFilter === c.id}
            onClick={() => setCropFilter(c.id)}
            label={`${c.emoji} ${tCrops(c.id)}`}
          />
        ))}
      </div>

      {/* Advisory list */}
      {advisories.length === 0 ? (
        <div className="text-center py-16 text-leaf-600">
          No advisory for this crop.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {advisories.map((a) => {
            const monthName = tCommon(`months.${a.month}` as any);
            const tip = locale === 'hi' ? a.tipHi : a.tipEn;
            const isCurrent = a.month === currentMonth;
            return (
              <article
                key={`${a.crop}-${a.month}`}
                className={cn(
                  'card-static p-5 sm:p-6 flex gap-4 sm:gap-5 items-start relative overflow-hidden',
                  isCurrent && 'ring-2 ring-leaf-500'
                )}
              >
                {isCurrent && (
                  <span className="absolute top-3 right-3 chip bg-leaf-600 text-white">
                    This month
                  </span>
                )}
                <div className="grid place-items-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-leaf-100 text-leaf-700 shrink-0">
                  <Calendar className="w-6 h-6 sm:w-7 sm:h-7" />
                  <span className="font-display text-xs font-bold mt-0.5">
                    {String(a.month).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wide text-leaf-600 font-semibold">
                    {t('monthLabel')} · {monthName}
                  </p>
                  <Link
                    href={`/${locale}/crops/${a.crop}`}
                    className="inline-block mt-0.5 font-display text-lg font-bold text-leaf-900 hover:text-leaf-700"
                  >
                    {tCrops(a.crop)}
                  </Link>
                  <p className="mt-2 text-leaf-800 leading-relaxed text-sm">
                    {tip}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0',
        active
          ? 'bg-leaf-600 text-white shadow-soft'
          : 'bg-white text-leaf-700 ring-1 ring-leaf-200 hover:bg-leaf-50'
      )}
    >
      {label}
    </button>
  );
}
