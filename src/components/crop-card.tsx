'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Leaf } from 'lucide-react';
import type { Crop } from '@/data/types';

export function CropCard({ crop, diseaseCount }: { crop: Crop; diseaseCount: number }) {
  const t = useTranslations('nav');
  const tCrops = useTranslations('crops');
  const locale = useLocale();

  return (
    <Link
      href={`/${locale}/crops/${crop.id}`}
      className="group relative overflow-hidden rounded-2xl aspect-[4/5] ring-1 ring-leaf-100 shadow-card transition-all duration-300 hover:shadow-cardHover hover:-translate-y-1"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${crop.image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-leaf-950/85 via-leaf-900/30 to-transparent" />
      <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
        <span className="text-4xl drop-shadow">{crop.emoji}</span>
        <div>
          <h3 className="font-display text-2xl font-bold">{tCrops(crop.id)}</h3>
          <p className="text-xs text-leaf-100 mt-1 flex items-center gap-1.5">
            <Leaf className="w-3 h-3" />
            {diseaseCount} {t('library').toLowerCase()}
          </p>
        </div>
      </div>
    </Link>
  );
}
