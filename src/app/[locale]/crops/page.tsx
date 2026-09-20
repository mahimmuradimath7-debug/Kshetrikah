'use client';

import { useTranslations } from 'next-intl';
import { crops } from '@/data/crops';
import { diseases } from '@/data/diseases';
import { CropCard } from '@/components/crop-card';

export default function CropsIndexPage() {
  const t = useTranslations('home');

  return (
    <div className="container-narrow py-10 sm:py-14">
      <div className="mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-leaf-900">
          {t('cropsTitle')}
        </h1>
        <p className="mt-2 text-leaf-700">{t('cropsSubtitle')}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {crops.map((c) => (
          <CropCard
            key={c.id}
            crop={c}
            diseaseCount={diseases.filter((d) => d.crop === c.id).length}
          />
        ))}
      </div>
    </div>
  );
}
