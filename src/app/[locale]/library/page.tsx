'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { diseases } from '@/data/diseases';
import { crops } from '@/data/crops';
import { DiseaseCard } from '@/components/disease-card';
import { cn } from '@/lib/utils';
import type { CropId } from '@/data/types';

export default function LibraryPage() {
  const t = useTranslations('library');
  const tCrops = useTranslations('crops');

  const [filter, setFilter] = useState<CropId | 'all'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return diseases.filter((d) => {
      if (filter !== 'all' && d.crop !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        const haystack = [
          d.name,
          d.shortDesc,
          d.pathogen,
          ...d.symptoms,
          ...d.organicTreatment,
          ...d.chemicalTreatment,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [filter, query]);

  return (
    <div className="container-narrow py-10 sm:py-14">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-leaf-900">
          {t('title')}
        </h1>
        <p className="mt-2 text-leaf-700">
          {t('subtitle', {
            count: diseases.length,
            crops: crops.length,
          })}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-leaf-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-11 pr-11 py-3 rounded-full bg-white ring-1 ring-leaf-200 text-leaf-900 placeholder:text-leaf-400 focus:outline-none focus:ring-2 focus:ring-leaf-500 transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-leaf-500 hover:bg-leaf-50"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Crop filter chips */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin">
        <FilterChip
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label={t('filterAll')}
        />
        {crops.map((c) => (
          <FilterChip
            key={c.id}
            active={filter === c.id}
            onClick={() => setFilter(c.id)}
            label={`${c.emoji} ${tCrops(c.id)}`}
          />
        ))}
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <DiseaseCard key={d.id} disease={d} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-leaf-600">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>{t('noResults')}</p>
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
          : 'bg-white text-leaf-700 ring-1 ring-leaf-200 hover:bg-leaf-50 hover:ring-leaf-300'
      )}
    >
      {label}
    </button>
  );
}
