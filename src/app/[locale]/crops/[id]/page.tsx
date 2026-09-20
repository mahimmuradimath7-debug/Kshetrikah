'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowLeft, Calendar, Leaf } from 'lucide-react';
import { cropMap } from '@/data/crops';
import { diseases } from '@/data/diseases';
import { advisoryForCrop } from '@/data/advisory';
import { DiseaseCard } from '@/components/disease-card';

export default function CropDetailPage() {
  const params = useParams<{ id: string }>();
  const crop = cropMap[params.id];
  const t = useTranslations('advisory');
  const tCrops = useTranslations('crops');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const locale = useLocale();

  if (!crop) notFound();

  const cropDiseases = diseases.filter((d) => d.crop === crop.id);
  const advisories = advisoryForCrop(crop.id);

  return (
    <div className="container-narrow py-8 sm:py-12">
      <nav className="mb-6 text-sm">
        <Link
          href={`/${locale}/crops`}
          className="inline-flex items-center gap-1.5 text-leaf-700 hover:text-leaf-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {tCrops(crop.id)}
        </Link>
      </nav>

      <header className="relative overflow-hidden rounded-3xl mb-10 shadow-card">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${crop.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-leaf-950/85 via-leaf-900/60 to-transparent" />
        <div className="relative p-8 sm:p-12 text-white min-h-[280px] flex flex-col justify-end">
          <span className="text-6xl mb-3 drop-shadow">{crop.emoji}</span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold">
            {tCrops(crop.id)}
          </h1>
          <p className="mt-3 text-leaf-100 max-w-xl leading-relaxed">
            {crop.shortDesc}
          </p>
        </div>
      </header>

      {/* Crop info */}
      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        <InfoCard
          icon={<Calendar className="w-5 h-5" />}
          label="Sowing"
          value={crop.sowingMonths
            .map((m) => tCommon(`months.${m}` as any))
            .join(', ')}
        />
        <InfoCard
          icon={<Calendar className="w-5 h-5" />}
          label="Harvest"
          value={crop.harvestMonths
            .map((m) => tCommon(`months.${m}` as any))
            .join(', ')}
        />
        <InfoCard
          icon={<Leaf className="w-5 h-5" />}
          label={tNav('library')}
          value={`${cropDiseases.length} diseases`}
        />
      </div>

      {/* Diseases */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-leaf-900 mb-5">
          {tNav('library')} · {tCrops(crop.id)}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cropDiseases.map((d) => (
            <DiseaseCard key={d.id} disease={d} />
          ))}
        </div>
      </section>

      {/* Advisory */}
      {advisories.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-bold text-leaf-900 mb-5">
            {t('title')} · {tCrops(crop.id)}
          </h2>
          <div className="space-y-3">
            {advisories.map((a) => {
              const monthName = tCommon(`months.${a.month}` as any);
              const tip = locale === 'hi' ? a.tipHi : a.tipEn;
              return (
                <div
                  key={a.month}
                  className="card-static p-4 sm:p-5 flex gap-4 items-start"
                >
                  <div className="grid place-items-center w-14 h-14 rounded-2xl bg-leaf-100 text-leaf-700 shrink-0">
                    <span className="font-display text-lg font-bold">
                      {String(a.month).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-leaf-600 font-semibold">
                      {t('monthLabel')} · {monthName}
                    </p>
                    <p className="mt-1 text-leaf-900 leading-relaxed">{tip}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="card-static p-4 flex items-start gap-3">
      <span className="grid place-items-center w-10 h-10 rounded-xl bg-leaf-100 text-leaf-700 shrink-0">
        {icon}
      </span>
      <div>
        <p className="text-xs uppercase tracking-wide text-leaf-600 font-semibold">
          {label}
        </p>
        <p className="mt-0.5 text-leaf-900 font-semibold">{value}</p>
      </div>
    </div>
  );
}
