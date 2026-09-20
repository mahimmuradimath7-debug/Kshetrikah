'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import {
  Bug,
  Activity,
  Droplets,
  Thermometer,
  CloudRain,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Info,
  Radio,
} from 'lucide-react';
import {
  trapSpecifications,
  evaluatePestTrapStatus,
  type TrapSpecification,
} from '@/data/pestTraps';
import type { SensorInput } from '@/data/types';
import { cn } from '@/lib/utils';

export default function TrapsPage() {
  const t = useTranslations('traps');
  const tNav = useTranslations('nav');
  const locale = useLocale();

  const [activeTab, setActiveTab] = useState<'traps' | 'sensors' | 'etl'>('traps');

  // Simulation state
  const [trapCounts, setTrapCounts] = useState<Record<string, number>>({
    'cotton-pbw': 14,
    'maize-faw': 6,
    'tomato-fruit-borer': 3,
    'cotton-sucking-pests': 24,
    'chili-thrips': 8,
    'sugarcane-top-borer': 2,
  });

  const [sensorData, setSensorData] = useState<SensorInput>({
    leafWetnessHours: 7.5,
    relativeHumidity: 88,
    ambientTemp: 24.5,
    soilMoisture: 72,
    sporeGerminationRisk: 'high',
  });

  const [simulationMode, setSimulationMode] = useState<'custom' | 'normal' | 'spore' | 'pest'>('spore');

  // Simulation presets
  const applyPreset = (mode: 'normal' | 'spore' | 'pest') => {
    setSimulationMode(mode);
    if (mode === 'normal') {
      setSensorData({
        leafWetnessHours: 1.5,
        relativeHumidity: 62,
        ambientTemp: 29.0,
        soilMoisture: 48,
        sporeGerminationRisk: 'low',
      });
      setTrapCounts({
        'cotton-pbw': 2,
        'maize-faw': 3,
        'tomato-fruit-borer': 1,
        'cotton-sucking-pests': 6,
        'chili-thrips': 4,
        'sugarcane-top-borer': 1,
      });
    } else if (mode === 'spore') {
      setSensorData({
        leafWetnessHours: 8.5,
        relativeHumidity: 94,
        ambientTemp: 22.0,
        soilMoisture: 86,
        sporeGerminationRisk: 'critical',
      });
      setTrapCounts({
        'cotton-pbw': 6,
        'maize-faw': 7,
        'tomato-fruit-borer': 4,
        'cotton-sucking-pests': 18,
        'chili-thrips': 9,
        'sugarcane-top-borer': 3,
      });
    } else if (mode === 'pest') {
      setSensorData({
        leafWetnessHours: 3.0,
        relativeHumidity: 70,
        ambientTemp: 31.5,
        soilMoisture: 52,
        sporeGerminationRisk: 'moderate',
      });
      setTrapCounts({
        'cotton-pbw': 18, // heavy PBW breach
        'maize-faw': 15, // heavy FAW breach
        'tomato-fruit-borer': 8,
        'cotton-sucking-pests': 35,
        'chili-thrips': 22,
        'sugarcane-top-borer': 7,
      });
    }
  };

  const updateCount = (id: string, delta: number) => {
    setSimulationMode('custom');
    setTrapCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) + delta),
    }));
  };

  const localizedHref = (path: string) => `/${locale}${path}`;

  return (
    <div className="container-narrow py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-leaf-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-leaf-100 text-leaf-800">
              <Radio className="w-3.5 h-3.5 text-leaf-600 animate-pulse" />
              Maharashtra Agro-IoT Telemetry Grid
            </span>
            <span className="text-xs text-leaf-600">LoRaWAN Gateway ID: MH-KVK-902</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-leaf-950">
            {t('title')}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-leaf-700 max-w-2xl">
            {t('subtitle')}
          </p>
        </div>

        {/* Simulation preset buttons */}
        <div className="bg-leaf-50 p-2.5 rounded-2xl border border-leaf-200">
          <span className="text-xs font-semibold text-leaf-800 block mb-1.5 px-1 flex items-center gap-1">
            <Sliders className="w-3 h-3" />
            {t('simulateTitle')}
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => applyPreset('normal')}
              className={cn(
                'px-2.5 py-1 text-xs rounded-lg font-medium transition-all',
                simulationMode === 'normal'
                  ? 'bg-leaf-600 text-white shadow-soft'
                  : 'bg-white text-leaf-700 hover:bg-leaf-100'
              )}
            >
              {t('simulateNormal')}
            </button>
            <button
              onClick={() => applyPreset('spore')}
              className={cn(
                'px-2.5 py-1 text-xs rounded-lg font-medium transition-all',
                simulationMode === 'spore'
                  ? 'bg-amber-600 text-white shadow-soft'
                  : 'bg-white text-leaf-700 hover:bg-amber-50'
              )}
            >
              {t('simulateSpore')}
            </button>
            <button
              onClick={() => applyPreset('pest')}
              className={cn(
                'px-2.5 py-1 text-xs rounded-lg font-medium transition-all',
                simulationMode === 'pest'
                  ? 'bg-rose-600 text-white shadow-soft'
                  : 'bg-white text-leaf-700 hover:bg-rose-50'
              )}
            >
              {t('simulatePest')}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-leaf-200 gap-2">
        <button
          onClick={() => setActiveTab('traps')}
          className={cn(
            'px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2',
            activeTab === 'traps'
              ? 'border-leaf-600 text-leaf-900 bg-leaf-50/50 rounded-t-lg'
              : 'border-transparent text-leaf-600 hover:text-leaf-900'
          )}
        >
          <Bug className="w-4 h-4" />
          {t('tabTraps')}
        </button>
        <button
          onClick={() => setActiveTab('sensors')}
          className={cn(
            'px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2',
            activeTab === 'sensors'
              ? 'border-leaf-600 text-leaf-900 bg-leaf-50/50 rounded-t-lg'
              : 'border-transparent text-leaf-600 hover:text-leaf-900'
          )}
        >
          <Activity className="w-4 h-4" />
          {t('tabSensors')}
        </button>
        <button
          onClick={() => setActiveTab('etl')}
          className={cn(
            'px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2',
            activeTab === 'etl'
              ? 'border-leaf-600 text-leaf-900 bg-leaf-50/50 rounded-t-lg'
              : 'border-transparent text-leaf-600 hover:text-leaf-900'
          )}
        >
          <Info className="w-4 h-4" />
          {t('tabEtl')}
        </button>
      </div>

      {/* TAB 1: Pheromone & Sticky Traps */}
      {activeTab === 'traps' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {trapSpecifications.map((spec) => {
              const currentCount = trapCounts[spec.id] ?? 0;
              const evaluation = evaluatePestTrapStatus(spec.id, currentCount, 3);
              const isBreached = evaluation.status === 'critical';
              const isWarning = evaluation.status === 'warning';

              return (
                <div
                  key={spec.id}
                  className={cn(
                    'card p-5 flex flex-col justify-between transition-all border-2',
                    isBreached
                      ? 'border-rose-300 bg-rose-50/30'
                      : isWarning
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-leaf-100 bg-white'
                  )}
                >
                  <div>
                    {/* Status Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-leaf-100 text-leaf-800">
                        {spec.crop}
                      </span>
                      {isBreached ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          <AlertTriangle className="w-3 h-3" />
                          {t('etlBreach')}
                        </span>
                      ) : isWarning ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3" />
                          {t('etlWarning')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          {t('etlSafe')}
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-lg text-leaf-950">
                      {locale === 'mr' ? spec.targetPestMr : spec.targetPest}
                    </h3>
                    <p className="text-xs text-leaf-600 italic mb-3">
                      {spec.targetPestScientific} • {spec.lureType}
                    </p>

                    {/* Counter widget */}
                    <div className="my-4 p-3 bg-cream-50 rounded-xl border border-leaf-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-leaf-600 block">Observed Catch</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold font-display text-leaf-900">
                            {currentCount}
                          </span>
                          <span className="text-xs text-leaf-600">/ {spec.thresholdEtl} {spec.thresholdUnit}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateCount(spec.id, -1)}
                          className="w-8 h-8 rounded-lg bg-white border border-leaf-200 text-leaf-800 font-bold hover:bg-leaf-100 flex items-center justify-center transition"
                          title="Decrease count"
                        >
                          -
                        </button>
                        <button
                          onClick={() => updateCount(spec.id, 1)}
                          className="w-8 h-8 rounded-lg bg-white border border-leaf-200 text-leaf-800 font-bold hover:bg-leaf-100 flex items-center justify-center transition"
                          title="Increase count"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Action advisory */}
                    <div
                      className={cn(
                        'text-xs p-3 rounded-lg leading-relaxed',
                        isBreached
                          ? 'bg-rose-100/70 text-rose-950 font-medium'
                          : isWarning
                          ? 'bg-amber-100/70 text-amber-950'
                          : 'bg-leaf-50 text-leaf-800'
                      )}
                    >
                      {locale === 'mr' ? spec.actionGuidanceMr : spec.actionGuidanceEn}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-leaf-100 flex items-center justify-between text-[11px] text-leaf-600">
                    <span>{t('trapDensity')}: {spec.recommendedDensityPerAcre} {t('perAcre')}</span>
                    <span>Lure life: {spec.lureLifeDays}d</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick CTA to scan */}
          <div className="card p-6 bg-leaf-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-display text-xl font-bold">
                Spotted unusual insect count or larval entry holes?
              </h4>
              <p className="text-sm text-leaf-100 mt-1">
                Take a quick photo of the crop leaf or boll to run our multi-factor AI diagnostic engine.
              </p>
            </div>
            <Link
              href={localizedHref('/wizard')}
              className="btn-secondary whitespace-nowrap bg-white text-leaf-800 hover:bg-cream-100"
            >
              <Sparkles className="w-4 h-4" />
              {tNav('wizard')}
            </Link>
          </div>
        </div>
      )}

      {/* TAB 2: IoT Microclimate Telemetry */}
      {activeTab === 'sensors' && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Telemetry Gauges */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Leaf Wetness */}
            <div className="card p-5 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-leaf-600">{t('leafWetness')}</span>
                <Droplets className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-3xl font-display font-bold text-leaf-950">
                {sensorData.leafWetnessHours} hrs
              </div>
              <p className="text-xs text-leaf-600 mt-2">
                {sensorData.leafWetnessHours >= 6 ? (
                  <span className="text-rose-600 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Critical: &gt;6h promotes fungal spore germination!
                  </span>
                ) : (
                  'Normal safe range (<4 hours)'
                )}
              </p>
            </div>

            {/* Relative Humidity */}
            <div className="card p-5 border-l-4 border-l-cyan-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-leaf-600">{t('relativeHumidity')}</span>
                <CloudRain className="w-5 h-5 text-cyan-500" />
              </div>
              <div className="text-3xl font-display font-bold text-leaf-950">
                {sensorData.relativeHumidity}%
              </div>
              <p className="text-xs text-leaf-600 mt-2">
                {sensorData.relativeHumidity >= 85 ? (
                  <span className="text-amber-600 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    High humidity (&gt;85%): Blight alert active
                  </span>
                ) : (
                  'Optimal canopy aeration'
                )}
              </p>
            </div>

            {/* Ambient Temperature */}
            <div className="card p-5 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-leaf-600">{t('ambientTemp')}</span>
                <Thermometer className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-3xl font-display font-bold text-leaf-950">
                {sensorData.ambientTemp}°C
              </div>
              <p className="text-xs text-leaf-600 mt-2">
                Diurnal range 18°C - 31°C (Fungal growth window: 20-26°C)
              </p>
            </div>

            {/* Soil Moisture */}
            <div className="card p-5 border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-leaf-600">{t('soilMoisture')}</span>
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-3xl font-display font-bold text-leaf-950">
                {sensorData.soilMoisture}%
              </div>
              <p className="text-xs text-leaf-600 mt-2">
                {sensorData.soilMoisture > 80 ? (
                  <span className="text-amber-600 font-semibold">
                    Waterlogging: Risk of root rot / wilt
                  </span>
                ) : (
                  'Field capacity optimal'
                )}
              </p>
            </div>
          </div>

          {/* Microclimate Pathogen Infection Risk Assessment */}
          <div className="card p-6 bg-cream-50 border border-leaf-200 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-display text-lg font-bold text-leaf-950 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-leaf-700" />
                Live Automated Microclimate Spore & Disease Forecast
              </h3>
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                  sensorData.sporeGerminationRisk === 'critical'
                    ? 'bg-rose-100 text-rose-800'
                    : sensorData.sporeGerminationRisk === 'high'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                )}
              >
                Spore Risk: {sensorData.sporeGerminationRisk}
              </span>
            </div>

            <p className="text-sm text-leaf-700 leading-relaxed">
              Based on continuous canopy sensor readings over the past 24 hours, fungal pathogens (such as <em>Phytophthora infestans</em> in Tomato/Potato, <em>Magnaporthe oryzae</em> in Rice, and <em>Colletotrichum</em> in Chili) have experienced {sensorData.leafWetnessHours} hours of free moisture at {sensorData.ambientTemp}°C.
            </p>

            <div className="p-4 bg-white rounded-xl border border-leaf-200">
              <h4 className="text-xs font-bold text-leaf-900 uppercase tracking-wider mb-2">
                Targeted Preventive Action Window (Next 36 Hours):
              </h4>
              <ul className="text-xs text-leaf-700 space-y-1.5 list-disc list-inside">
                <li>Withhold overhead sprinkler or flood irrigation to allow crop canopy to aerate.</li>
                <li>Apply preventive bio-fungicide (<em>Trichoderma harzianum</em> @ 5g/L or <em>Pseudomonas fluorescens</em> @ 10g/L) before the next rain event.</li>
                <li>Inspect low-lying field patches with black cotton soil for water stagnation.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ETL Decision Matrix */}
      {activeTab === 'etl' && (
        <div className="card p-6 space-y-6 animate-fade-in">
          <div>
            <h3 className="font-display text-xl font-bold text-leaf-950">
              Economic Threshold Level (ETL) Decision Matrix
            </h3>
            <p className="text-sm text-leaf-700 mt-1">
              ETL defines the pest density at which control measures must be initiated to prevent the population from reaching the Economic Injury Level (EIL), avoiding unnecessary chemical spraying and preventing pesticide resistance.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-leaf-100/70 text-leaf-900 font-semibold border-b border-leaf-200">
                  <th className="p-3">Crop</th>
                  <th className="p-3">Major Pest</th>
                  <th className="p-3">Monitoring Tool</th>
                  <th className="p-3">Economic Threshold (ETL)</th>
                  <th className="p-3">When to Hold (No Spray)</th>
                  <th className="p-3">When to Intervene</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-leaf-100 text-leaf-800">
                <tr>
                  <td className="p-3 font-semibold text-leaf-950">Cotton</td>
                  <td className="p-3">Pink Bollworm (*Pectinophora*)</td>
                  <td className="p-3">Gossyplure Pheromone Trap</td>
                  <td className="p-3 font-medium text-rose-700">8 moths/trap/night for 3 consecutive nights OR 10% rosette flowers</td>
                  <td className="p-3 text-emerald-700">&lt;5 moths/trap; beneficial spiders/predators present</td>
                  <td className="p-3 text-leaf-700">Trichogramma egg parasitoids + Neem oil spray</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-leaf-950">Maize</td>
                  <td className="p-3">Fall Armyworm (*Spodoptera*)</td>
                  <td className="p-3">Funnel Pheromone Trap</td>
                  <td className="p-3 font-medium text-rose-700">10 moths/trap OR 5% whorl damage at seedling stage</td>
                  <td className="p-3 text-emerald-700">Minor leaf scraping on older leaves only</td>
                  <td className="p-3 text-leaf-700">Sand + lime mix (9:1) or Metarhizium in whorls</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-leaf-950">Tomato</td>
                  <td className="p-3">Fruit Borer (*Helicoverpa*)</td>
                  <td className="p-3">Helilure Sleeve Trap</td>
                  <td className="p-3 font-medium text-rose-700">5 moths/trap OR 1 egg/plant on flower buds</td>
                  <td className="p-3 text-emerald-700">Occasional moths (&lt;2/trap)</td>
                  <td className="p-3 text-leaf-700">HaNPV 250 LE/acre with jaggery at dusk</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-leaf-950">Chili / Veg</td>
                  <td className="p-3">Thrips & Whiteflies</td>
                  <td className="p-3">Blue & Yellow Sticky Cards</td>
                  <td className="p-3 font-medium text-rose-700">15-20 insects / card / day</td>
                  <td className="p-3 text-emerald-700">&lt;8 insects / card</td>
                  <td className="p-3 text-leaf-700">Lecanicillium lecanii 5g/L bio-spray</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-leaf-950">Sugarcane</td>
                  <td className="p-3">Top Shoot Borer</td>
                  <td className="p-3">Water Pan Pheromone Trap</td>
                  <td className="p-3 font-medium text-rose-700">6 moths/trap OR 10% dead hearts</td>
                  <td className="p-3 text-emerald-700">Low moth counts early in season</td>
                  <td className="p-3 text-leaf-700">Trichogramma cards (50,000/ha)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
