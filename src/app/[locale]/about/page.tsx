'use client';

import { useTranslations } from 'next-intl';
import { Heart, Target, AlertTriangle, Leaf } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="container-narrow py-10 sm:py-14">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <span className="grid place-items-center w-14 h-14 mx-auto rounded-2xl bg-leaf-600 text-white shadow-soft mb-4">
            <Leaf className="w-7 h-7" />
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-leaf-900">
            {t('title')}
          </h1>
          <p className="mt-3 text-leaf-700">{t('subtitle')}</p>
        </header>

        {/* Mission */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-leaf-100 text-leaf-700">
              <Target className="w-5 h-5" />
            </span>
            <h2 className="font-display text-2xl font-bold text-leaf-900">
              {t('missionTitle')}
            </h2>
          </div>
          <p className="text-leaf-800 leading-relaxed text-lg">
            {t('missionBody')}
          </p>
        </section>

        {/* What we cover */}
        <section className="mb-10">
          <h2 className="font-display text-2xl font-bold text-leaf-900 mb-5 flex items-center gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-leaf-100 text-leaf-700">
              <Leaf className="w-5 h-5" />
            </span>
            What we cover
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: '🌾', label: '8 major Indian crops' },
              { icon: '🧪', label: '30+ diseases with treatment' },
              { icon: '🌱', label: 'Organic + chemical methods' },
              { icon: '📅', label: 'Seasonal advisories' },
              { icon: '🔍', label: 'Symptom-based diagnosis' },
              { icon: '🗣️', label: 'English + Hindi' },
            ].map((item) => (
              <div
                key={item.label}
                className="card-static p-4 flex items-center gap-3"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium text-leaf-900">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <section className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-amber-900 mb-2">
                {t('disclaimerTitle')}
              </h2>
              <p className="text-amber-900/90 leading-relaxed">
                {t('disclaimerBody')}
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-10 text-center text-sm text-leaf-600">
          <p className="flex items-center justify-center gap-1.5">
            Built with <Heart className="w-4 h-4 fill-current text-red-400" /> for Indian farmers
          </p>
        </footer>
      </div>
    </div>
  );
}
