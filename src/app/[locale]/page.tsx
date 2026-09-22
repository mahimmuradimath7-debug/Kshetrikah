'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import {
  ArrowRight,
  Sparkles,
  Leaf,
  Stethoscope,
  Calendar,
  ShieldCheck,
  RotateCcw,
  Radio,
  MapPin,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Cpu,
  Send,
  Zap,
  Languages,
} from 'lucide-react';
import { crops } from '@/data/crops';
import { diseases } from '@/data/diseases';

export default function HomePage() {
  const t = useTranslations('home');
  const tNav = useTranslations('nav');
  const tBrand = useTranslations('brand');
  const tCrops = useTranslations('crops');
  const locale = useLocale();

  const localizedHref = (href: string) =>
    href === '/' ? `/${locale}` : `/${locale}${href}`;

  return (
    <>
      {/* CULTURAL GREETING & MULTILINGUAL ADAPTATION BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#062013] to-slate-950 text-emerald-200 border-b border-emerald-500/20 py-2 px-4 text-xs font-semibold">
        <div className="container-narrow flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-emerald-100 font-medium">
              {t('greeting')}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0 text-[11px] text-emerald-300/80">
            <Languages className="w-3.5 h-3.5" />
            <span className="uppercase font-bold tracking-wider">{locale}</span>
          </div>
        </div>
      </div>

      {/* HERO SECTION — HIGH-TECH AGRO-INTELLIGENCE COMMAND CENTER */}
      <section className="relative overflow-hidden gradient-hero-dark text-white border-b border-emerald-500/20">
        <div className="absolute inset-0 bg-leaf-pattern opacity-30 pointer-events-none" />
        
        {/* Ambient Glow Spheres */}
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="container-narrow relative pt-12 pb-20 sm:pt-20 sm:pb-28">
          <div className="max-w-4xl mx-auto text-center">
            {/* Top Innovation Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 text-emerald-200 border border-emerald-400/30 mb-6 animate-fade-in shadow-[0_0_20px_rgba(16,185,129,0.3)] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-extrabold tracking-wider bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
                TEAM BITHEADS
              </span>
              <span className="text-emerald-400/50">•</span>
              <span className="text-slate-200">{t('heroBadge')}</span>
            </div>

            {/* Localized Headline */}
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white text-balance leading-[1.18] animate-slide-up tracking-tight">
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 bg-clip-text text-transparent">
                {t('heroTitle')}
              </span>
            </h1>

            {/* Localized Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-emerald-100/90 leading-relaxed text-balance max-w-2xl mx-auto animate-slide-up [animation-delay:80ms] font-medium">
              {t('heroSubtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap gap-3 justify-center animate-slide-up [animation-delay:160ms]">
              <Link
                href={localizedHref('/wizard')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <Stethoscope className="w-4 h-4 text-slate-950" />
                {t('heroCta')}
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </Link>
              <Link
                href={localizedHref('/recommend')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm"
              >
                <Leaf className="w-4 h-4 text-emerald-300" />
                Recommendations
              </Link>
              <Link
                href={localizedHref('/map')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                {t('btnMap')}
              </Link>
              <Link
                href={localizedHref('/traps')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm"
              >
                <Calendar className="w-4 h-4 text-cyan-300" />
                {t('btnTraps')}
              </Link>
            </div>

            {/* High-Tech Telemetry Stats HUD */}
            <dl className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 animate-slide-up [animation-delay:240ms]">
              {[
                { value: crops.length, label: t('statsCrops'), sub: 'Offline-Ready DB' },
                { value: diseases.length, label: t('statsDiseases'), sub: 'Pathogens & Pests' },
                { value: '23', label: t('statsLanguages'), sub: '8th Schedule + EN' },
                { value: '✓', label: t('statsFree'), sub: 'Farmer & Staff' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 text-center rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:border-emerald-400/40 transition-all duration-200 hover:-translate-y-1"
                >
                  <dt className="text-2xl sm:text-3xl font-display font-black text-emerald-300">
                    {stat.value}
                  </dt>
                  <dd className="text-xs sm:text-sm text-white font-bold mt-1">
                    {stat.label}
                  </dd>
                  <dd className="text-[10px] text-emerald-200/60 mt-0.5 font-medium">
                    {stat.sub}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* LIVE MAHARASHTRA SURVEILLANCE RADAR TICKER */}
      <div className="bg-[#030c06] border-b border-emerald-500/20 py-3 text-xs text-slate-200 overflow-hidden shadow-inner">
        <div className="container-narrow flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
            <span className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px]">
              {t('radarTitle')}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] overflow-x-auto py-0.5">
            <span className="inline-flex items-center gap-1.5 text-rose-300 bg-rose-950/40 px-2.5 py-0.5 rounded-full border border-rose-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              {t('radarYavatmal')}
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-300 bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {t('radarNashik')}
            </span>
            <span className="inline-flex items-center gap-1.5 text-cyan-300 bg-cyan-950/40 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              {t('radarKolhapur')}
            </span>
          </div>

          <Link
            href={localizedHref('/map')}
            className="text-[11px] font-bold text-emerald-300 hover:text-emerald-100 flex items-center gap-1 shrink-0 ml-auto hover:underline"
          >
            {t('radarAction')} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 6 CORE SYSTEM MODULES (PROBLEM STATEMENT 26131) */}
      <section className="container-narrow py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 mb-3">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            TEAM BITHEADS • MSInS Challenge #26131
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            {t('modulesTitle')}
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            {t('modulesSubtitle')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* 1. AI Vision */}
          <Link
            href={localizedHref('/wizard')}
            className="card p-6 flex flex-col justify-between group hover:border-emerald-400/50"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="grid place-items-center w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                  <Stethoscope className="w-6 h-6" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  CV-YOLO11s
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                {t('module1Title')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('module1Desc')}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
              <span>{t('module1Cta')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. Traps & IoT */}
          <Link
            href={localizedHref('/traps')}
            className="card p-6 flex flex-col justify-between group hover:border-amber-400/50"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="grid place-items-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
                  <Calendar className="w-6 h-6" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  LoRaWAN IoT
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">
                {t('module2Title')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('module2Desc')}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:text-amber-800">
              <span>{t('module2Cta')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 3. Geospatial Mapping */}
          <Link
            href={localizedHref('/map')}
            className="card p-6 flex flex-col justify-between group hover:border-rose-400/50"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="grid place-items-center w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 group-hover:scale-110 group-hover:bg-rose-500/20 transition-all">
                  <MapPin className="w-6 h-6" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  36 Districts GIS
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-2 group-hover:text-rose-700 transition-colors">
                {t('module3Title')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('module3Desc')}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-700 group-hover:text-rose-800">
              <span>{t('module3Cta')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 4. Expert Validation */}
          <Link
            href={localizedHref('/expert')}
            className="card p-6 flex flex-col justify-between group hover:border-purple-400/50"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="grid place-items-center w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
                  <ShieldCheck className="w-6 h-6" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  KVK & Labs
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-2 group-hover:text-purple-700 transition-colors">
                {t('module4Title')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('module4Desc')}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700 group-hover:text-purple-800">
              <span>{t('module4Cta')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 5. Official Dashboard */}
          <Link
            href={localizedHref('/officials')}
            className="card p-6 flex flex-col justify-between group hover:border-blue-400/50"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="grid place-items-center w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                  <Send className="w-6 h-6" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  MahaAgri Alert
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                {t('module5Title')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('module5Desc')}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700 group-hover:text-blue-800">
              <span>{t('module5Cta')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 6. Follow-Up Monitoring */}
          <Link
            href={localizedHref('/monitoring')}
            className="card p-6 flex flex-col justify-between group hover:border-emerald-400/50"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="grid place-items-center w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                  <RotateCcw className="w-6 h-6" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Day 3 • 7 • 14
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                {t('module6Title')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('module6Desc')}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
              <span>{t('module6Cta')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* SAFE INPUT USAGE & CIBRC COMPLIANCE BANNER */}
      <section className="container-narrow py-6 mb-12">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#061e12] via-[#092d1b] to-[#04150b] text-white shadow-xl border border-emerald-500/30 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t('safeBadge')}
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                {t('safeTitle')}
              </h3>
              <p className="text-emerald-100/80 text-sm mt-2 leading-relaxed">
                {t('safeSubtitle')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 justify-center">
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                <div className="text-xs font-bold text-emerald-300">{t('safeBio')}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                <div className="text-xs font-bold text-amber-300">{t('safePhi')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CROPS LIBRARY SHOWCASE */}
      <section className="bg-slate-900 text-white py-16 sm:py-24 border-t border-b border-emerald-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-leaf-pattern opacity-20 pointer-events-none" />
        <div className="container-narrow relative">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                {tBrand('name')}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
                {t('cropsTitle')}
              </h2>
              <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-xl">
                {t('cropsSubtitle')}
              </p>
            </div>
            <Link
              href={localizedHref('/library')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all hover:scale-105"
            >
              {tNav('library')}
              <ArrowRight className="w-4 h-4 text-emerald-300" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {crops.map((crop) => {
              const count = diseases.filter((d) => d.crop === crop.id).length;
              return (
                <Link
                  key={crop.id}
                  href={`${localizedHref('/crops')}/${crop.id}`}
                  className="group relative overflow-hidden rounded-2xl aspect-[4/5] border border-white/15 hover:border-emerald-400/60 shadow-xl transition-all duration-300 hover:-translate-y-1.5"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${crop.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
                  <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
                    <span className="text-4xl drop-shadow-md group-hover:scale-110 transition-transform">{crop.emoji}</span>
                    <div>
                      <h3 className="font-display text-2xl font-black group-hover:text-emerald-300 transition-colors">
                        {tCrops(crop.id)}
                      </h3>
                      <p className="text-xs text-emerald-200/80 mt-1 flex items-center gap-1.5 font-semibold">
                        <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                        {count} {tNav('library').toLowerCase()}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="container-narrow py-16 sm:py-24">
        <div className="rounded-3xl p-8 sm:p-14 text-center shadow-2xl overflow-hidden relative border border-emerald-500/30"
          style={{
            background: 'linear-gradient(135deg, #051a0f 0%, #08341b 50%, #04140a 100%)',
          }}
        >
          <div className="absolute inset-0 bg-leaf-pattern opacity-20" />
          <div className="relative z-10 max-w-2xl mx-auto text-white">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/20 mb-4">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              TEAM BITHEADS
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-balance">
              {t('ctaTitle')}
            </h2>
            <p className="mt-3 text-emerald-100/90 text-sm sm:text-base leading-relaxed">
              {t('ctaSubtitle')}
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link
                href={localizedHref('/wizard')}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 text-slate-950 font-black shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:scale-105 active:scale-95 transition-all"
              >
                <Stethoscope className="w-5 h-5 text-slate-950" />
                {t('ctaButton')}
              </Link>
              <Link
                href={localizedHref('/traps')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20 backdrop-blur-md hover:scale-105 active:scale-95 transition-all"
              >
                <Calendar className="w-5 h-5 text-amber-300" />
                {t('btnTraps')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
