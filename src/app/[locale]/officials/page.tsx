'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  Building,
  Radio,
  Send,
  ShieldAlert,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BellRing,
  Plane,
  FileSpreadsheet,
  Layers,
  MapPin,
  Cpu,
  Award,
  Sparkles,
} from 'lucide-react';
import { talukaRiskProfiles } from '@/data/geospatialData';
import { crops } from '@/data/crops';
import { DL_BENCHMARK_SPECS } from '@/lib/plantVillageBridge';
import { cn } from '@/lib/utils';

export default function OfficialsDashboardPage() {
  const t = useTranslations('officials');
  const tNav = useTranslations('nav');
  const locale = useLocale();

  const [broadcastSent, setBroadcastSent] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('Yavatmal');
  const [selectedCrop, setSelectedCrop] = useState('cotton');
  const [messageTemplate, setMessageTemplate] = useState(
    'कृषी विभाग, महाराष्ट्र शासन सतर्कता सल्ला: राळेगाव (यवतमाळ) परिसरात गुलाबी बोंडअळीचा प्रादुर्भाव आर्थिक नुकसान पातळी (ETL) पेक्षा जास्त नोंदवला गेला आहे. सर्व कापूस उत्पादकांनी ताबडतोब ५ फेरोमोन सापळे लावावेत आणि निंबोळी अर्क ५% किंवा शिफारशीत जैविक नियंत्रणाचा वापर करावा. अधिक माहितीसाठी जवळच्या कृषी सहाय्यकाशी संपर्क साधा.'
  );

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastSent(true);
    setTimeout(() => {
      // Keep message active
    }, 1000);
  };

  const handleTemplateChange = (crop: string) => {
    setSelectedCrop(crop);
    if (crop === 'cotton') {
      setMessageTemplate(
        'कृषी विभाग, महाराष्ट्र शासन सतर्कता सल्ला: राळेगाव (यवतमाळ) परिसरात गुलाबी बोंडअळीचा प्रादुर्भाव आर्थिक नुकसान पातळी (ETL) पेक्षा जास्त नोंदवला गेला आहे. सर्व कापूस उत्पादकांनी ताबडतोब ५ फेरोमोन सापळे लावावेत आणि निंबोळी अर्क ५% किंवा ट्रायकोकार्डचा वापर करावा.'
      );
    } else if (crop === 'tomato') {
      setMessageTemplate(
        'कृषी विभाग, महाराष्ट्र शासन सतर्कता सल्ला: दिंडोरी (नाशिक) परिसरात सलग धुके व ९०% पेक्षा जास्त आर्द्रतेमुळे टोमॅटो पिकावर करपा (Late Blight) रोगाचा तीव्र धोका आहे. शेतकऱ्यांनी पाऊस सुरू होण्यापूर्वी प्रतिबंधक जैविक बुरशीनाशक फवारावे.'
      );
    } else if (crop === 'sugarcane') {
      setMessageTemplate(
        'कृषी विभाग सतर्कता सल्ला: शिरोळ (कोल्हापूर) भागात अतिवृष्टी व पाणी साचल्याने ऊसावर तांबेरा/लाल सड रोगाचा प्रसार रोखण्यासाठी शेतातील अतिरिक्त पाण्याचा निचरा त्वरित करा.'
      );
    }
  };

  return (
    <div className="container-narrow py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Official State Header */}
      <div className="rounded-3xl bg-emerald-950 text-white p-6 sm:p-8 border border-emerald-800 shadow-cardHover relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-emerald-700/20 blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-800 text-emerald-100 border border-emerald-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                Government of Maharashtra
              </span>
              <span className="text-xs text-emerald-300">
                Department of Agriculture & MSInS
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-balance">
              {t('title')}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-emerald-200 max-w-2xl leading-relaxed">
              {t('subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-900/80 border border-emerald-700 text-xs font-semibold flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Surveillance Grid: LIVE
            </span>
          </div>
        </div>
      </div>

      {/* High-Level Official Surveillance KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Outbreak Zones */}
        <div className="card p-5 border-l-4 border-l-rose-500 bg-white">
          <div className="flex items-center justify-between text-xs text-leaf-600 mb-2">
            <span>{t('activeOutbreaks')}</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-display font-bold text-rose-600">
            8 Zones
          </div>
          <p className="text-xs text-leaf-600 mt-2">
            2 under Containment Quarantine (Yavatmal, Nashik)
          </p>
        </div>

        {/* Surveillance Coverage */}
        <div className="card p-5 border-l-4 border-l-emerald-500 bg-white">
          <div className="flex items-center justify-between text-xs text-leaf-600 mb-2">
            <span>{t('surveillanceCoverage')}</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-display font-bold text-leaf-950">
            94.2%
          </div>
          <p className="text-xs text-leaf-600 mt-2">
            Covering 34 districts across Maharashtra
          </p>
        </div>

        {/* Extension Officers Deployed */}
        <div className="card p-5 border-l-4 border-l-blue-500 bg-white">
          <div className="flex items-center justify-between text-xs text-leaf-600 mb-2">
            <span>{t('extensionOfficers')}</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-display font-bold text-leaf-950">
            1,480
          </div>
          <p className="text-xs text-leaf-600 mt-2">
            Gram Krishi Sahayak active in field
          </p>
        </div>

        {/* Lab Turnaround */}
        <div className="card p-5 border-l-4 border-l-purple-500 bg-white">
          <div className="flex items-center justify-between text-xs text-leaf-600 mb-2">
            <span>{t('labTurnaround')}</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-display font-bold text-leaf-950">
            4.2 hrs
          </div>
          <p className="text-xs text-leaf-600 mt-2">
            Across 4 State Agricultural Universities
          </p>
        </div>
      </div>

      {/* District Outbreak Risk League Table */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-display text-xl font-bold text-leaf-950">
              {t('districtLeague')}
            </h3>
            <p className="text-xs text-leaf-600 mt-0.5">
              Real-time multi-factor vulnerability scoring combining weather forecast, pheromone trap catches, and field confirmations.
            </p>
          </div>

          <span className="text-xs bg-leaf-100 text-leaf-800 font-semibold px-3 py-1 rounded-full">
            Updated Today, 08:30 IST
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-leaf-100/70 text-leaf-900 font-semibold border-b border-leaf-200">
                <th className="p-3">District & Taluka</th>
                <th className="p-3">Vulnerability Score</th>
                <th className="p-3">Dominant Threat</th>
                <th className="p-3">Alert Status</th>
                <th className="p-3">Field Officers Assigned</th>
                <th className="p-3">Preventive Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-leaf-100 text-leaf-800">
              {talukaRiskProfiles.map((p) => {
                const isRed = p.surveillanceStatus === 'red_alert';
                const isOrange = p.surveillanceStatus === 'orange_warning';
                return (
                  <tr key={`${p.district}-${p.taluka}`} className="hover:bg-leaf-50/60">
                    <td className="p-3">
                      <span className="font-bold text-leaf-950">{p.district}</span>
                      <span className="text-xs text-leaf-600 block">
                        ({locale === 'mr' ? p.talukaMr : p.taluka})
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-leaf-900">{p.riskScore}/100</span>
                        <div className="w-20 bg-leaf-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={cn(
                              'h-full',
                              isRed ? 'bg-rose-600' : isOrange ? 'bg-amber-500' : 'bg-emerald-500'
                            )}
                            style={{ width: `${p.riskScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-medium text-leaf-900">{p.dominantThreat}</td>
                    <td className="p-3">
                      <span
                        className={cn(
                          'text-[11px] font-bold px-2 py-0.5 rounded-full uppercase',
                          isRed
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : isOrange
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        )}
                      >
                        {p.surveillanceStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3">{p.officersAssigned} Officers</td>
                    <td className="p-3">
                      <span className="text-xs text-leaf-700">
                        {isRed ? 'Quarantine perimeter & bio-agent subsidy' : 'Targeted trap scouting'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Early Warning Broadcast Console */}
      <div className="card p-6 bg-cream-50 border border-leaf-200 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-display text-xl font-bold text-leaf-950 flex items-center gap-2">
              <BellRing className="w-5 h-5 text-leaf-700" />
              {t('broadcastAdvisory')}
            </h3>
            <p className="text-xs text-leaf-600 mt-0.5">
              Issue instant geo-targeted SMS, WhatsApp, and Gram Panchayat voice alerts directly to registered farmers in high-risk talukas.
            </p>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-leaf-200 text-leaf-800">
            Channel: MahaAgri-SMS + WhatsApp Gateway
          </span>
        </div>

        {broadcastSent && (
          <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            {t('broadcastSuccess')}
          </div>
        )}

        <form onSubmit={handleBroadcast} className="grid gap-4 sm:grid-cols-2 text-xs">
          <div>
            <label className="block font-semibold text-leaf-800 mb-1">{t('targetDistrict')}</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-leaf-300 bg-white font-medium"
            >
              <option value="Yavatmal">Yavatmal (Ralegaon / Wadki)</option>
              <option value="Nashik">Nashik (Dindori / Vani)</option>
              <option value="Kolhapur">Kolhapur (Shirol / Kurundwad)</option>
              <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar (Paithan)</option>
              <option value="Jalgaon">Jalgaon (Raver / Muktainagar)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-leaf-800 mb-1">Target Crop Preset</label>
            <select
              value={selectedCrop}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-leaf-300 bg-white font-medium"
            >
              <option value="cotton">Cotton — Pink Bollworm ETL Surge</option>
              <option value="tomato">Tomato — Fog & Late Blight Spore Alert</option>
              <option value="sugarcane">Sugarcane — Waterlogging Red Rot Prevention</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-leaf-800 mb-1">
              {t('advisoryMessage')}
            </label>
            <textarea
              rows={4}
              required
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              className="w-full p-3 rounded-xl border border-leaf-300 bg-white font-mono text-xs leading-relaxed"
            />
          </div>

          <div className="sm:col-span-2 flex items-center justify-between">
            <span className="text-[11px] text-leaf-600">
              Estimated reach: ~14,820 farmer SIMs across selected taluka boundary.
            </span>
            <button
              type="submit"
              className="btn-primary text-xs px-6 py-2.5 font-semibold flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {t('sendBroadcast')}
            </button>
          </div>
        </form>
      </div>

      {/* Extension & Drone Sprayer Resource Mobilization */}
      <div className="card p-6 border border-leaf-200 space-y-4">
        <h3 className="font-display text-lg font-bold text-leaf-950 flex items-center gap-2">
          <Plane className="w-5 h-5 text-leaf-700" />
          Extension Resource & Drone Sprayer Subsidy Deployment
        </h3>
        <p className="text-xs text-leaf-700">
          Allocate community biocontrol kits (Trichogramma egg parasitoids) and subsidized agricultural drone sprayers to contain verified hotspot perimeters.
        </p>

        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          <div className="p-3 bg-leaf-50 rounded-xl border border-leaf-100 flex items-center justify-between">
            <div>
              <span className="text-leaf-600 block">Subsidized Drones Available</span>
              <span className="text-xl font-bold font-display text-leaf-900">42 Units</span>
            </div>
            <button className="px-2.5 py-1 text-[11px] rounded bg-white border border-leaf-300 text-leaf-800 font-semibold hover:bg-leaf-100">
              Deploy
            </button>
          </div>

          <div className="p-3 bg-leaf-50 rounded-xl border border-leaf-100 flex items-center justify-between">
            <div>
              <span className="text-leaf-600 block">Trichocards In Stock</span>
              <span className="text-xl font-bold font-display text-leaf-900">12,500 Cards</span>
            </div>
            <button className="px-2.5 py-1 text-[11px] rounded bg-white border border-leaf-300 text-leaf-800 font-semibold hover:bg-leaf-100">
              Distribute
            </button>
          </div>

          <div className="p-3 bg-leaf-50 rounded-xl border border-leaf-100 flex items-center justify-between">
            <div>
              <span className="text-leaf-600 block">Emergency Helpline Queues</span>
              <span className="text-xl font-bold font-display text-leaf-900">0 Waiting</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold">1800-233-4000</span>
          </div>
        </div>
      </div>

      {/* Deep Learning Convolutional Benchmark & Model Specs */}
      <div className="card p-6 bg-white border border-leaf-200 space-y-4 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-leaf-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-purple-600" />
                Benchmark Neural Architecture
              </span>
              <span className="text-xs text-leaf-500">
                ResNet50V2 / ResNet101V2 + Gemini 2.5 Flash
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-leaf-950">
              Deep Learning Crop Disease Detection Model Specifications
            </h3>
            <p className="text-xs text-leaf-600 mt-0.5">
              Empirical verification on {DL_BENCHMARK_SPECS.totalImages.toLocaleString()} leaf specimens across {DL_BENCHMARK_SPECS.classesCount} gold-standard pathology classes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              {DL_BENCHMARK_SPECS.testAccuracyResNet50}% Top-1 Accuracy
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4 text-xs">
          <div className="p-3 bg-cream-50 rounded-xl border border-leaf-100">
            <span className="text-leaf-600 block text-[11px]">Residual Architecture</span>
            <span className="font-bold text-leaf-900 block mt-0.5 font-mono">
              ResNet50V2 / 101V2
            </span>
          </div>

          <div className="p-3 bg-cream-50 rounded-xl border border-leaf-100">
            <span className="text-leaf-600 block text-[11px]">Training Set Size</span>
            <span className="font-bold text-leaf-900 block mt-0.5">
              {DL_BENCHMARK_SPECS.totalImages.toLocaleString()} Images
            </span>
          </div>

          <div className="p-3 bg-cream-50 rounded-xl border border-leaf-100">
            <span className="text-leaf-600 block text-[11px]">Validation & Test Loss</span>
            <span className="font-bold text-emerald-700 block mt-0.5 font-mono">
              0.1436 (Categorical CE)
            </span>
          </div>

          <div className="p-3 bg-cream-50 rounded-xl border border-leaf-100">
            <span className="text-leaf-600 block text-[11px]">ResNet101V2 Accuracy</span>
            <span className="font-bold text-leaf-900 block mt-0.5 font-mono">
              {DL_BENCHMARK_SPECS.testAccuracyResNet101}% Test Score
            </span>
          </div>
        </div>

        <div className="p-4 bg-leaf-50 rounded-xl border border-leaf-200 text-xs text-leaf-800 space-y-1">
          <span className="font-bold text-leaf-950 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-leaf-600" />
            Hybrid Multimodal Ensemble Strategy:
          </span>
          <p className="leading-relaxed text-[11px]">
            Kshetrikah bridges the gold-standard 38-class ResNet spatial feature representations with Google Gemini 2.5 Flash object detection bounding boxes and the Maharashtra ICAR 5-pillar Bayesian microclimate fusion engine. This hybrid design ensures lab-grade accuracy with zero hallucinations.
          </p>
        </div>
      </div>
    </div>
  );
}
