'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Menu, X, Leaf, Sparkles, Activity } from 'lucide-react';
import { LanguageSwitcher } from './language-switcher';
import { ThemeCustomizer } from './theme-customizer';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const t = useTranslations('nav');
  const tBrand = useTranslations('brand');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Strip locale prefix for comparison
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/wizard', label: t('wizard') },
    { href: '/recommend', label: 'Recommendations' },
    { href: '/traps', label: t('traps') },
    { href: '/map', label: t('map') },
    { href: '/expert', label: t('expert') },
    { href: '/officials', label: t('officials') },
    { href: '/monitoring', label: t('monitoring') },
    { href: '/library', label: t('library') },
    { href: '/advisory', label: t('advisory') },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathWithoutLocale === '/';
    return pathWithoutLocale.startsWith(href);
  };

  // Build href for current locale
  const localizedHref = (href: string) =>
    href === '/' ? `/${locale}` : `/${locale}${href}`;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-300 shadow-md"
      style={{
        backgroundColor: 'var(--header-bg, rgba(6, 25, 15, 0.95))',
        borderColor: 'var(--card-border, rgba(16, 185, 129, 0.25))',
      }}
    >
      <div className="container-narrow">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Brand */}
          <Link
            href={localizedHref('/')}
            className="flex items-center gap-2.5 group shrink-0"
            aria-label={tBrand('name')}
          >
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)] group-hover:scale-105 transition-all">
              <Leaf className="w-5 h-5" strokeWidth={2.5} />
            </span>
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display text-lg font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                  {tBrand('name')}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse-subtle">
                  TEAM BITHEADS
                </span>
              </div>
              <span className="text-[10px] text-emerald-200/70 -mt-0.5 hidden sm:block font-medium">
                Govt of Maharashtra • MSInS #26131
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center gap-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={localizedHref(item.href)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap',
                    active
                      ? 'bg-white/15 text-emerald-300 border border-emerald-400/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                      : 'text-slate-200/80 hover:text-white hover:bg-white/10'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right cluster: Theme Picker + Language + Mobile menu */}
          <div className="flex items-center gap-2">
            {/* Color Palette Switcher */}
            <ThemeCustomizer />

            {/* Language Switcher */}
            <LanguageSwitcher />

            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="xl:hidden p-2 rounded-xl text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {open && (
          <nav className="xl:hidden pb-4 pt-2 border-t border-white/10 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-2">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={localizedHref(item.href)}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'px-3 py-2 rounded-xl text-xs font-semibold transition-all text-center',
                      active
                        ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40'
                        : 'text-slate-200 hover:text-white bg-white/5 hover:bg-white/10'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

// suppress unused import warning for routing (used by LanguageSwitcher)
void routing;
