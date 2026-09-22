'use client';

import { useTranslations } from 'next-intl';
import { Leaf, Heart, Shield, PhoneCall } from 'lucide-react';

export function SiteFooter() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tBrand = useTranslations('brand');
  const tAbout = useTranslations('about');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-[#030e07] text-slate-200 border-t border-emerald-500/20">
      <div className="container-narrow py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                <Leaf className="w-5 h-5" strokeWidth={2.5} />
              </span>
              <span className="font-display text-2xl font-black text-white">
                {tBrand('name')}
              </span>
            </div>
            <p className="text-emerald-100/70 text-sm leading-relaxed max-w-sm">
              {tBrand('tagline')}. Early detection & integrated pest management system for Maharashtra farmers.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-emerald-500/30 text-xs font-bold text-emerald-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Engineered by TEAM BITHEADS
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4 text-emerald-400">
              System Modules
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              <li className="hover:text-emerald-300 transition-colors">
                <span className="text-emerald-400 font-bold">01.</span> {tNav('wizard')} — AI Leaf Symptom Scanner
              </li>
              <li className="hover:text-emerald-300 transition-colors">
                <span className="text-emerald-400 font-bold">02.</span> {tNav('traps')} — Pheromone Traps & IoT Telemetry
              </li>
              <li className="hover:text-emerald-300 transition-colors">
                <span className="text-emerald-400 font-bold">03.</span> {tNav('map')} — Geospatial Maharashtra Hotspot Map
              </li>
              <li className="hover:text-emerald-300 transition-colors">
                <span className="text-emerald-400 font-bold">04.</span> {tNav('expert')} — KVK Expert & Lab Referral Portal
              </li>
              <li className="hover:text-emerald-300 transition-colors">
                <span className="text-emerald-400 font-bold">05.</span> {tNav('officials')} — Maharashtra Agriculture Dashboard
              </li>
              <li className="hover:text-emerald-300 transition-colors">
                <span className="text-emerald-400 font-bold">06.</span> {tNav('monitoring')} — Follow-up Recovery Confirmation
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4 text-emerald-400 flex items-center gap-2">
              <PhoneCall className="w-4 h-4" />
              Farmer Helplines & KVK Support
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed mb-3 space-y-1">
              <span className="block">Kisan Call Centre: <strong className="text-white">1800-180-1551</strong> (Toll Free)</span>
              <span className="block">MahaAgri Helpline: <strong className="text-white">1800-233-4000</strong> (Maharashtra Govt)</span>
              <span className="block text-emerald-300 font-semibold pt-1">
                Govt of Maharashtra • MSInS Challenge #26131
              </span>
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed border-t border-white/10 pt-3">
              {tAbout('disclaimerBody')}
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black tracking-wider bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 text-slate-950 shadow-md">
                TEAM BITHEADS
              </span>
              <p className="text-slate-400">
                {t('copyright', { year })}
              </p>
            </div>
            <p className="text-emerald-300/80 font-medium">{t('free')}</p>
          </div>
          {/* Developer Credits */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-slate-500 font-medium">Developed by:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Mahim.s.M
            </span>
            <span className="text-slate-600">&</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              Pavan.p.C
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
