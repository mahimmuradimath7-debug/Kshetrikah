'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import {
  MapPin,
  Flame,
  Shield,
  Filter,
  AlertOctagon,
  Eye,
  Radio,
  Share2,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  geospatialOutbreaks,
  maharashtraAgriZones,
  talukaRiskProfiles,
} from '@/data/geospatialData';
import { crops } from '@/data/crops';
import type { GeospatialOutbreak, CropId, Severity } from '@/data/types';
import { computeOutbreakClusters, type OutbreakCluster } from '@/lib/gisClustering';
import { cn } from '@/lib/utils';

export default function GeospatialMapPage() {
  const t = useTranslations('map');
  const tCrops = useTranslations('crops');
  const locale = useLocale();

  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [activeOutbreakId, setActiveOutbreakId] = useState<string>(geospatialOutbreaks[0].id);
  const [showClusters, setShowClusters] = useState(true);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);

  // Compute real-time outbreak clusters across surveillance nodes & field WAL
  const dynamicClusters = useMemo(() => {
    return computeOutbreakClusters({
      crop: selectedCrop !== 'all' ? selectedCrop : undefined,
    });
  }, [selectedCrop]);

  const activeCluster = useMemo(() => {
    if (!selectedClusterId) return null;
    return dynamicClusters.find((c) => c.id === selectedClusterId) || null;
  }, [selectedClusterId, dynamicClusters]);

  // Available districts from the outbreak dataset
  const districts = useMemo(() => {
    const unique = new Set(geospatialOutbreaks.map((o) => o.district));
    return Array.from(unique);
  }, []);

  const filteredOutbreaks = useMemo(() => {
    return geospatialOutbreaks.filter((o) => {
      const matchDistrict = selectedDistrict === 'all' || o.district === selectedDistrict;
      const matchCrop = selectedCrop === 'all' || o.crop === selectedCrop;
      const matchSeverity = selectedSeverity === 'all' || o.severity === selectedSeverity;
      return matchDistrict && matchCrop && matchSeverity;
    });
  }, [selectedDistrict, selectedCrop, selectedSeverity]);

  const activeOutbreak = useMemo(() => {
    return (
      geospatialOutbreaks.find((o) => o.id === activeOutbreakId) ||
      filteredOutbreaks[0] ||
      geospatialOutbreaks[0]
    );
  }, [activeOutbreakId, filteredOutbreaks]);

  const activeTalukaProfile = useMemo(() => {
    return talukaRiskProfiles.find((p) => p.district === activeOutbreak.district);
  }, [activeOutbreak]);

  const severityColor = (sev: Severity) => {
    switch (sev) {
      case 'severe':
        return 'text-rose-700 bg-rose-100 border-rose-300';
      case 'high':
        return 'text-amber-700 bg-amber-100 border-amber-300';
      case 'moderate':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'low':
        return 'text-emerald-700 bg-emerald-100 border-emerald-300';
    }
  };

  return (
    <div className="container-narrow py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-leaf-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
              <Radio className="w-3.5 h-3.5 animate-pulse text-rose-600" />
              Maharashtra Real-Time Crop Surveillance (GIS)
            </span>
            <span className="text-xs text-leaf-600">State Agro-Surveillance Cell</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-leaf-950">
            {t('title')}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-leaf-700 max-w-2xl">
            {t('subtitle')}
          </p>
        </div>

        {/* Total stats pill */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-leaf-200 shadow-soft">
          <div className="text-center px-2">
            <span className="text-xs text-leaf-600 block">Active Outbreaks</span>
            <span className="text-xl font-bold font-display text-rose-600">
              {geospatialOutbreaks.filter((o) => o.status === 'active').length}
            </span>
          </div>
          <div className="h-8 w-px bg-leaf-200" />
          <div className="text-center px-2">
            <span className="text-xs text-leaf-600 block">Districts Monitored</span>
            <span className="text-xl font-bold font-display text-leaf-900">
              {districts.length}
            </span>
          </div>
          <div className="h-8 w-px bg-leaf-200" />
          <div className="text-center px-2">
            <span className="text-xs text-leaf-600 block">Total Cases</span>
            <span className="text-xl font-bold font-display text-leaf-900">
              {geospatialOutbreaks.reduce((sum, o) => sum + o.activeCases, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card p-4 flex flex-wrap items-center gap-3 bg-leaf-50/70 border border-leaf-200">
        <span className="text-xs font-bold text-leaf-800 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          Filters:
        </span>

        {/* District Filter */}
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="text-xs rounded-lg border border-leaf-300 bg-white px-3 py-1.5 font-medium text-leaf-900 focus:outline-none focus:ring-2 focus:ring-leaf-500"
        >
          <option value="all">{t('allDistricts')}</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Crop Filter */}
        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="text-xs rounded-lg border border-leaf-300 bg-white px-3 py-1.5 font-medium text-leaf-900 focus:outline-none focus:ring-2 focus:ring-leaf-500"
        >
          <option value="all">{t('allCrops')}</option>
          {crops.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {tCrops(c.id)}
            </option>
          ))}
        </select>

        {/* Severity Filter */}
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="text-xs rounded-lg border border-leaf-300 bg-white px-3 py-1.5 font-medium text-leaf-900 focus:outline-none focus:ring-2 focus:ring-leaf-500"
        >
          <option value="all">All Severity Levels</option>
          <option value="severe">Critical / Severe</option>
          <option value="high">High Risk</option>
          <option value="moderate">Moderate Risk</option>
          <option value="low">Low / Contained</option>
        </select>

        {(selectedDistrict !== 'all' || selectedCrop !== 'all' || selectedSeverity !== 'all') && (
          <button
            onClick={() => {
              setSelectedDistrict('all');
              setSelectedCrop('all');
              setSelectedSeverity('all');
            }}
            className="text-xs text-leaf-700 hover:text-leaf-950 underline font-medium ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Map & Detail Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Interactive Map Visualizer (7 cols) */}
        <div className="lg:col-span-7 card p-5 flex flex-col justify-between space-y-4 bg-gradient-to-b from-white to-leaf-50/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-semibold text-leaf-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-leaf-600" />
              Maharashtra Agro-Climatic Spatial Grid
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowClusters(!showClusters)}
                className={cn(
                  'text-[11px] px-2.5 py-1 rounded-full font-bold transition-all flex items-center gap-1.5 border',
                  showClusters
                    ? 'bg-rose-100 text-rose-800 border-rose-300 shadow-sm'
                    : 'bg-white text-leaf-700 border-leaf-300 hover:bg-leaf-50'
                )}
              >
                <Radio className="w-3 h-3 text-rose-600 animate-pulse" />
                AI Outbreak Clusters ({dynamicClusters.length})
              </button>
              <span className="text-[11px] text-leaf-600 hidden sm:inline">
                {filteredOutbreaks.length} active nodes
              </span>
            </div>
          </div>

          {/* Graphical Map Representation of Maharashtra */}
          <div className="relative aspect-[16/10] w-full rounded-2xl bg-emerald-950/90 overflow-hidden border border-emerald-800 p-4 flex items-center justify-center">
            {/* Background topographic / contour decorative lines */}
            <svg
              className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6ee7b7" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Simulated Maharashtra Regions SVG */}
            <div className="relative w-full h-full max-w-[540px] max-h-[380px]">
              {/* Region outlines/polygons in stylized SVG */}
              <svg viewBox="0 0 540 380" className="w-full h-full">
                {/* State Silhouette outline */}
                <path
                  d="M 50,180 Q 90,80 180,60 T 320,50 T 460,70 Q 520,130 500,190 T 420,280 T 300,320 T 180,340 Q 110,310 90,260 Z"
                  fill="#064e3b"
                  fillOpacity="0.4"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />

                {/* Regional Labels */}
                <text x="360" y="110" fill="#a7f3d0" fontSize="11" fontWeight="bold" opacity="0.6">
                  VIDARBHA (कापूस पट्टा)
                </text>
                <text x="240" y="180" fill="#a7f3d0" fontSize="11" fontWeight="bold" opacity="0.6">
                  MARATHWADA (मराठवाडा)
                </text>
                <text x="140" y="240" fill="#a7f3d0" fontSize="11" fontWeight="bold" opacity="0.6">
                  WESTERN MH (पश्चिम महाराष्ट्र)
                </text>
                <text x="70" y="210" fill="#a7f3d0" fontSize="10" fontWeight="bold" opacity="0.6">
                  KONKAN (कोकण)
                </text>
                <text x="180" y="90" fill="#a7f3d0" fontSize="10" fontWeight="bold" opacity="0.6">
                  KHANDESH (खान्देश)
                </text>

                {/* Hotspot Outbreak Pins */}
                {filteredOutbreaks.map((outbreak) => {
                  // Normalize coordinates to SVG 540x380 viewport
                  // Maharashtra bounds: Lat 15.6 to 22.0, Lng 72.6 to 80.9
                  const svgX = ((outbreak.lng - 72.6) / (80.9 - 72.6)) * 480 + 30;
                  const svgY = 380 - (((outbreak.lat - 15.6) / (22.0 - 15.6)) * 340 + 20);
                  const isSelected = outbreak.id === activeOutbreak.id;
                  const isSevere = outbreak.severity === 'severe';

                  return (
                    <g
                      key={outbreak.id}
                      onClick={() => setActiveOutbreakId(outbreak.id)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      {/* Containment radius circle for selected outbreak */}
                      {isSelected && (
                        <circle
                          cx={svgX}
                          cy={svgY}
                          r={outbreak.containmentRadiusKm * 2.5}
                          fill="#f43f5e"
                          fillOpacity="0.2"
                          stroke="#f43f5e"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                          className="animate-pulse"
                        />
                      )}

                      {/* Ripple effect for severe outbreaks */}
                      {isSevere && (
                        <circle
                          cx={svgX}
                          cy={svgY}
                          r="14"
                          fill="#f43f5e"
                          fillOpacity="0.3"
                          className="animate-ping"
                        />
                      )}

                      {/* Outbreak Pin Center */}
                      <circle
                        cx={svgX}
                        cy={svgY}
                        r={isSelected ? '9' : '6'}
                        fill={
                          outbreak.severity === 'severe'
                            ? '#f43f5e'
                            : outbreak.severity === 'high'
                            ? '#f59e0b'
                            : '#10b981'
                        }
                        stroke="#ffffff"
                        strokeWidth="2"
                      />

                      {/* District Label on Pin */}
                      <text
                        x={svgX}
                        y={svgY - 12}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        className="pointer-events-none drop-shadow"
                      >
                        {outbreak.district}
                      </text>
                    </g>
                  );
                })}

                {/* Dynamic GIS Outbreak Clusters Layer */}

                {showClusters &&
                  dynamicClusters.map((cluster) => {
                    if (!cluster.svgCoords) return null;
                    const isSelected = cluster.id === selectedClusterId;
                    const strokeColor =
                      cluster.alertLevel === 'red'
                        ? '#ef4444'
                        : cluster.alertLevel === 'orange'
                        ? '#f97316'
                        : '#eab308';

                    return (
                      <g
                        key={cluster.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClusterId(cluster.id);
                        }}
                        className="cursor-pointer group"
                      >
                        {/* Outbreak Containment Buffer Radius */}
                        <circle
                          cx={cluster.svgCoords.x}
                          cy={cluster.svgCoords.y}
                          r={cluster.svgCoords.r}
                          fill={strokeColor}
                          fillOpacity={isSelected ? 0.35 : 0.15}
                          stroke={strokeColor}
                          strokeWidth={isSelected ? 2.5 : 1.5}
                          strokeDasharray={cluster.alertLevel === 'red' ? '4 2' : 'none'}
                          className={cluster.alertLevel === 'red' ? 'animate-pulse' : ''}
                        />
                        {/* Centroid Pin */}
                        <circle
                          cx={cluster.svgCoords.x}
                          cy={cluster.svgCoords.y}
                          r={isSelected ? 7 : 5}
                          fill={strokeColor}
                          stroke="#ffffff"
                          strokeWidth={1.5}
                        />
                        <text
                          x={cluster.svgCoords.x}
                          y={cluster.svgCoords.y - cluster.svgCoords.r - 4}
                          fill={strokeColor}
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="pointer-events-none drop-shadow"
                        >
                          ⚠️ {cluster.diseaseName.split(' ')[0]} ({cluster.incidentCount} cases)
                        </text>
                      </g>
                    );
                  })}
              </svg>
            </div>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-3 left-3 bg-emerald-950/90 backdrop-blur-sm p-2 rounded-lg border border-emerald-800/80 text-[10px] text-white flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Severe / Red Alert
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> High Watch
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Contained
              </span>
            </div>
          </div>

          <p className="text-xs text-leaf-600 italic">
            * Interactive Map: Click any node to inspect containment radius, pheromone trap spike data, and recommended agricultural containment protocol.
          </p>
        </div>

        {/* Selected Outbreak Dossier & Containment Plan (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Dynamic Cluster Dossier Card (if a cluster is selected) */}
          {activeCluster && (
            <div className="card p-5 border-2 border-rose-300 bg-rose-50/50 space-y-3 shadow-soft animate-fade-in">
              <div className="flex items-start justify-between gap-2 border-b border-rose-200 pb-2.5">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-rose-200 text-rose-900 flex items-center gap-1 w-fit">
                    <Radio className="w-3 h-3 text-rose-700 animate-pulse" />
                    Epidemiological Outbreak Cluster
                  </span>
                  <h3 className="font-display text-lg font-bold text-rose-950 mt-1">
                    {activeCluster.diseaseName}
                  </h3>
                  <span className="text-xs text-rose-800">
                    Centroid: {activeCluster.district} ({activeCluster.talukas.join(', ')})
                  </span>
                </div>
                <span
                  className={cn(
                    'text-xs font-bold px-2.5 py-1 rounded-full uppercase border',
                    activeCluster.alertLevel === 'red'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  )}
                >
                  {activeCluster.alertLevel.toUpperCase()} ALERT
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-white rounded-lg border border-rose-200">
                  <span className="text-leaf-600 block">Containment Radius</span>
                  <span className="font-bold text-rose-900 block">{activeCluster.radiusKm} km zone</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-rose-200">
                  <span className="text-leaf-600 block">Corroborated Scans</span>
                  <span className="font-bold text-rose-900 block">{activeCluster.incidentCount} field reports</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-rose-200">
                  <span className="text-leaf-600 block">Estimated Arable Threat</span>
                  <span className="font-bold text-rose-900 block">~{activeCluster.estimatedAcreage} Hectares</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-rose-200">
                  <span className="text-leaf-600 block">Surveillance Window</span>
                  <span className="font-bold text-leaf-900 block">{activeCluster.earliestReport}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-rose-200 text-xs text-rose-900 space-y-1">
                <span className="font-bold block text-[11px] uppercase tracking-wider text-rose-800">
                  Emergency State Directive:
                </span>
                <p className="leading-snug">{activeCluster.containmentProtocol}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedClusterId(null)}
                className="text-xs text-rose-700 hover:text-rose-950 underline font-medium"
              >
                Close Cluster Dossier
              </button>
            </div>
          )}

          <div className="card p-5 border-2 border-leaf-300 bg-white space-y-4 shadow-soft">
            <div className="flex items-start justify-between gap-2 border-b border-leaf-100 pb-3">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full uppercase bg-leaf-100 text-leaf-800">
                  {activeOutbreak.id}
                </span>
                <h3 className="font-display text-xl font-bold text-leaf-950 mt-1">
                  {locale === 'mr' ? activeOutbreak.talukaMr : activeOutbreak.taluka}, {locale === 'mr' ? activeOutbreak.districtMr : activeOutbreak.district}
                </h3>
              </div>
              <span
                className={cn(
                  'text-xs font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider',
                  severityColor(activeOutbreak.severity)
                )}
              >
                {activeOutbreak.severity}
              </span>
            </div>

            {/* Outbreak Meta */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-cream-50 border border-leaf-100">
                <span className="text-leaf-600 block">Target Crop & Pathogen</span>
                <span className="font-bold text-leaf-900 mt-0.5 block">
                  {activeOutbreak.crop.toUpperCase()} • {activeOutbreak.diseaseName}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-cream-50 border border-leaf-100">
                <span className="text-leaf-600 block">Reported Cases</span>
                <span className="font-bold text-rose-600 text-base mt-0.5 block">
                  {activeOutbreak.activeCases} farms
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-cream-50 border border-leaf-100">
                <span className="text-leaf-600 block">Containment Perimeter</span>
                <span className="font-bold text-leaf-900 mt-0.5 block">
                  {activeOutbreak.containmentRadiusKm} km radius
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-cream-50 border border-leaf-100">
                <span className="text-leaf-600 block">Pheromone Trap Avg</span>
                <span className="font-bold text-leaf-900 mt-0.5 block">
                  {activeOutbreak.trapCountAverage} moths/trap
                </span>
              </div>
            </div>

            {/* Containment Protocol */}
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
              <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Shield className="w-4 h-4 text-rose-600" />
                Active Containment Protocol:
              </h4>
              <ul className="text-xs text-rose-900 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>
                  Establish {activeOutbreak.containmentRadiusKm} km quarantine perimeter around {activeOutbreak.taluka}.
                </li>
                <li>
                  Deploy Gram Krishi Sahayak scouts for 100% boundary farm inspections.
                </li>
                <li>
                  Issue community bio-agent release (Trichogramma cards / Beauveria spray) in concentric rings.
                </li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-leaf-600">Reported on {activeOutbreak.reportedAt}</span>
              <Link
                href={`/${locale}/wizard`}
                className="text-leaf-800 font-semibold hover:text-leaf-950 flex items-center gap-1"
              >
                Scan affected sample <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Agricultural Zone Snapshot */}
          <div className="card p-5 bg-leaf-50/60 border border-leaf-200 space-y-3">
            <h4 className="font-display text-sm font-bold text-leaf-950">
              Maharashtra Agricultural Zone Details
            </h4>
            <div className="space-y-2">
              {maharashtraAgriZones.map((zone) => (
                <div
                  key={zone.id}
                  className="p-2.5 bg-white rounded-lg border border-leaf-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-leaf-900">
                      {locale === 'mr' ? zone.nameMr : zone.nameEn}
                    </span>
                    <span className="text-[11px] text-leaf-600 block">
                      {zone.districts.slice(0, 3).join(', ')} + more
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {zone.primaryCrops.map((c) => (
                      <span key={c} className="text-sm">
                        {crops.find((item) => item.id === c)?.emoji}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Outbreak Feed / Table */}
      <div className="card p-6 space-y-4">
        <h3 className="font-display text-xl font-bold text-leaf-950">
          All Monitored Outbreak Clusters in Maharashtra
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-leaf-100/70 text-leaf-900 font-semibold border-b border-leaf-200">
                <th className="p-3">Cluster ID</th>
                <th className="p-3">District & Taluka</th>
                <th className="p-3">Crop</th>
                <th className="p-3">Threat</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Acreage / Cases</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-leaf-100 text-leaf-800">
              {filteredOutbreaks.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setActiveOutbreakId(o.id)}
                  className={cn(
                    'cursor-pointer transition-colors',
                    o.id === activeOutbreak.id ? 'bg-leaf-100/50 font-medium' : 'hover:bg-leaf-50'
                  )}
                >
                  <td className="p-3 font-mono text-xs">{o.id}</td>
                  <td className="p-3">
                    <span className="font-bold text-leaf-950">{o.district}</span>
                    <span className="text-xs text-leaf-600 block">({o.taluka})</span>
                  </td>
                  <td className="p-3">
                    <span className="capitalize">{o.crop}</span>
                  </td>
                  <td className="p-3">{o.diseaseName}</td>
                  <td className="p-3">
                    <span
                      className={cn(
                        'text-[11px] font-bold px-2 py-0.5 rounded-full border uppercase',
                        severityColor(o.severity)
                      )}
                    >
                      {o.severity}
                    </span>
                  </td>
                  <td className="p-3">{o.activeCases} farms</td>
                  <td className="p-3">
                    <span
                      className={cn(
                        'text-xs font-semibold px-2 py-0.5 rounded-full',
                        o.status === 'active'
                          ? 'bg-rose-100 text-rose-800'
                          : o.status === 'monitoring'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      )}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveOutbreakId(o.id);
                      }}
                      className="text-xs text-leaf-700 hover:text-leaf-950 font-semibold underline"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
