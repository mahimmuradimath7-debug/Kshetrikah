'use client';

import { useState, useEffect } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ThemeId = 'cyber-emerald' | 'ocean-blue' | 'golden-harvest' | 'cosmic-violet';

interface ThemeOption {
  id: ThemeId;
  name: string;
  nameMr: string;
  nameHi: string;
  color: string;
  glow: string;
  bgPreview: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'cyber-emerald',
    name: 'Cyber Emerald',
    nameMr: 'सायबर पाचू',
    nameHi: 'साइबर पन्ना',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    bgPreview: 'from-emerald-500 to-teal-400',
  },
  {
    id: 'ocean-blue',
    name: 'Oceanic Blue',
    nameMr: 'सागरी निळा',
    nameHi: 'समुद्री नीला',
    color: '#0284c7',
    glow: 'rgba(2, 132, 199, 0.4)',
    bgPreview: 'from-sky-500 to-cyan-400',
  },
  {
    id: 'golden-harvest',
    name: 'Golden Harvest',
    nameMr: 'सुनेहरा पीक',
    nameHi: 'स्वर्ण फसल',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    bgPreview: 'from-amber-500 to-yellow-400',
  },
  {
    id: 'cosmic-violet',
    name: 'Cosmic Violet',
    nameMr: 'जांभळा तेज',
    nameHi: 'कास्मिक जामुनी',
    color: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.4)',
    bgPreview: 'from-purple-500 to-pink-400',
  },
];

export function ThemeCustomizer() {
  const [activeTheme, setActiveTheme] = useState<ThemeId>('cyber-emerald');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check saved theme
    const saved = localStorage.getItem('kshetrikah_theme') as ThemeId | null;
    if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
      setActiveTheme(saved);
      applyTheme(saved);
    } else {
      applyTheme('cyber-emerald');
    }
  }, []);

  const applyTheme = (themeId: ThemeId) => {
    setActiveTheme(themeId);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeId);
      localStorage.setItem('kshetrikah_theme', themeId);
    }
  };

  const currentTheme = THEME_OPTIONS.find((t) => t.id === activeTheme) || THEME_OPTIONS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-all duration-200 shadow-sm hover:scale-105 active:scale-95"
        title="Change UI Color Theme"
        aria-label="Color Palette Selector"
      >
        <span
          className="w-3 h-3 rounded-full shadow-sm animate-pulse"
          style={{ backgroundColor: currentTheme.color }}
        />
        <Palette className="w-3.5 h-3.5 opacity-80" />
        <span className="hidden sm:inline-block font-medium text-[11px]">
          {currentTheme.name}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop dismiss */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#081b11]/95 border border-emerald-500/30 p-2 shadow-2xl backdrop-blur-xl z-50 animate-fade-in text-white">
            <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Select Color Palette
              </span>
              <span className="text-[10px] text-emerald-200/60 uppercase tracking-wider font-semibold">
                Live
              </span>
            </div>

            <div className="py-1 space-y-1">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = activeTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      applyTheme(theme.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all',
                      isSelected
                        ? 'bg-white/15 text-white font-bold border border-white/20 shadow-sm'
                        : 'text-emerald-100/70 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'w-4 h-4 rounded-full bg-gradient-to-br shadow-md',
                          theme.bgPreview
                        )}
                        style={{ boxShadow: `0 0 10px ${theme.glow}` }}
                      />
                      <span>{theme.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 mt-1 border-t border-white/10 px-2 text-[10px] text-emerald-200/50 text-center">
              Crafted by <strong>TEAM BITHEADS</strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
