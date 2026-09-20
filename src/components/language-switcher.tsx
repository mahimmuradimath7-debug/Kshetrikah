'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Globe, Check, ChevronDown, Search, Sparkles, X } from 'lucide-react';
import { routing, useRouter, usePathname, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export interface LanguageInfo {
  code: string;
  name: string;
  native: string;
  region: string;
}

export const INDIAN_LANGUAGES_LIST: LanguageInfo[] = [
  // Primary / Host State
  { code: 'mr', name: 'Marathi', native: 'मराठी', region: 'Maharashtra (Host)' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', region: 'National' },
  { code: 'en', name: 'English', native: 'English', region: 'National' },
  // South India
  { code: 'te', name: 'Telugu', native: 'తెలుగు', region: 'South (Andhra / Telangana)' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', region: 'South (Tamil Nadu)' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', region: 'South (Karnataka)' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', region: 'South (Kerala)' },
  // West India
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', region: 'West (Gujarat)' },
  { code: 'kok', name: 'Konkani', native: 'कोंकणी', region: 'West (Goa / Konkan)' },
  { code: 'sd', name: 'Sindhi', native: 'سنڌي / सिंधी', region: 'West' },
  // East India
  { code: 'bn', name: 'Bengali', native: 'বাংলা', region: 'East (West Bengal)' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', region: 'East (Odisha)' },
  { code: 'mai', name: 'Maithili', native: 'मैथिली', region: 'East (Bihar)' },
  { code: 'sat', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ', region: 'East (Jharkhand)' },
  // North India
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', region: 'North (Punjab)' },
  { code: 'ur', name: 'Urdu', native: 'اردو', region: 'National' },
  { code: 'ks', name: 'Kashmiri', native: 'کٲشُر', region: 'North (Kashmir)' },
  { code: 'doi', name: 'Dogri', native: 'डोगरी', region: 'North (Jammu)' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली', region: 'North / Sikkim' },
  // North-East India
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', region: 'North-East (Assam)' },
  { code: 'mni', name: 'Manipuri', native: 'মৈতৈলোন্', region: 'North-East (Manipur)' },
  { code: 'brx', name: 'Bodo', native: 'बड़ो', region: 'North-East (Assam)' },
  // Classical
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्', region: 'Classical' },
];

export function LanguageSwitcher() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const switchTo = (newLocale: string) => {
    const innerPath = pathname || '/';
    router.replace(innerPath, { locale: newLocale as any });
    setOpen(false);
    setSearch('');
  };

  const currentLang = INDIAN_LANGUAGES_LIST.find((l) => l.code === locale) || {
    code: locale,
    name: 'English',
    native: 'English',
    region: 'National',
  };

  const filteredLanguages = useMemo(() => {
    if (!search.trim()) return INDIAN_LANGUAGES_LIST;
    const q = search.toLowerCase();
    return INDIAN_LANGUAGES_LIST.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.native.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-all duration-200 shadow-sm hover:scale-105 active:scale-95"
        aria-label={t('selectLanguage')}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Globe className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-medium text-[11px]">{currentLang.native}</span>
        <span className="hidden md:inline-block text-[10px] text-emerald-200/70">
          ({currentLang.name})
        </span>
        <ChevronDown
          className={cn(
            'w-3 h-3 text-slate-300 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <>
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm sm:hidden"
            onClick={() => setOpen(false)}
          />

          <div
            role="dialog"
            aria-label="Select Indian Language"
            className="fixed sm:absolute right-2 sm:right-0 top-20 sm:top-auto sm:mt-2 w-[calc(100vw-1rem)] sm:w-80 max-w-sm rounded-2xl bg-[#07190f]/95 border border-emerald-500/30 p-2.5 shadow-2xl backdrop-blur-2xl z-50 animate-fade-in text-white"
          >
            {/* Header with Search */}
            <div className="pb-2 mb-2 border-b border-white/10">
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  All 22 Official Indian Languages
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  23 Languages
                </span>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search language or state…"
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400"
                  autoFocus
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Language items list */}
            <div className="max-h-72 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {filteredLanguages.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No language matched &quot;{search}&quot;
                </div>
              ) : (
                filteredLanguages.map((lang) => {
                  const isSelected = lang.code === locale;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => switchTo(lang.code)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all',
                        isSelected
                          ? 'bg-emerald-500/25 border border-emerald-400/40 text-white font-bold shadow-sm'
                          : 'hover:bg-white/10 text-slate-200 hover:text-white'
                      )}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm leading-tight text-white">
                            {lang.native}
                          </span>
                          <span className="text-xs text-emerald-300/80">
                            {lang.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 leading-tight mt-0.5">
                          {lang.region}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="pt-2 mt-1 border-t border-white/10 px-1 text-[10px] text-emerald-200/50 flex items-center justify-between">
              <span>8th Schedule Constitutional Languages</span>
              <strong className="text-emerald-300">TEAM BITHEADS</strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
