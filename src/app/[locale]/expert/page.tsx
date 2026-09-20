'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  Stethoscope,
  Building2,
  FileCheck,
  Send,
  AlertCircle,
  Phone,
  Mail,
  UserCheck,
  Microscope,
  Volume2,
  CheckCircle,
  Clock,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  maharashtraKvkNetwork,
  initialExpertReferrals,
  type KvkCenter,
} from '@/data/expertCases';
import type { ExpertReferral, CropId, CropStage } from '@/data/types';
import { crops } from '@/data/crops';
import { cn } from '@/lib/utils';

export default function ExpertPortalPage() {
  const t = useTranslations('expert');
  const tNav = useTranslations('nav');
  const tCrops = useTranslations('crops');
  const locale = useLocale();

  const [activeTab, setActiveTab] = useState<'farmer' | 'agronomist' | 'directory'>('farmer');
  const [referrals, setReferrals] = useState<ExpertReferral[]>(initialExpertReferrals);
  const [selectedReferralId, setSelectedReferralId] = useState<string>(initialExpertReferrals[0].id);

  // Hydrate pending triage tickets dynamically from the WAL persistence database
  useEffect(() => {
    fetch('/api/scans?kvkStatus=pending_triage')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ok && Array.isArray(data.scans) && data.scans.length > 0) {
          const dynamicTickets: ExpertReferral[] = data.scans.map((s: {
            id: string;
            farmerName?: string;
            farmerContact?: string;
            district?: string;
            taluka?: string;
            crop: CropId;
            cropStage?: CropStage;
            diseaseId: string;
            diseaseName: string;
            confidence?: number;
            disputeReason?: string;
            timestamp?: string;
          }) => ({
            id: s.id,
            farmerName: s.farmerName || 'Kisan Bandhu (Field Scan)',
            contactNumber: s.farmerContact || '+91 98000 00000',
            district: s.district || 'Yavatmal',
            taluka: s.taluka || 'Field Block',
            village: 'Maharashtra Farm',
            crop: s.crop,
            cropStage: s.cropStage || 'vegetative',
            soilType: 'black_cotton',
            suspectedDiseaseId: s.diseaseId,
            imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80',
            notes:
              s.disputeReason ||
              `Foliar scan triage: AI diagnosed ${s.diseaseName} with ${Math.round((s.confidence || 0.6) * 100)}% confidence. Escalated for specialist verification.`,
            status: 'pending',
            assignedKvk: `kvk-${(s.district || 'yavatmal').toLowerCase()}`,
            submittedAt: s.timestamp
              ? s.timestamp.slice(0, 16).replace('T', ' ')
              : new Date().toISOString().slice(0, 16).replace('T', ' '),
          }));

          setReferrals((prev) => {
            const existingIds = new Set(prev.map((r) => r.id));
            const newOnes = dynamicTickets.filter((t) => !existingIds.has(t.id));
            if (newOnes.length === 0) return prev;
            return [...newOnes, ...prev];
          });
        }
      })
      .catch(() => {});
  }, []);


  // New ticket form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newDistrict, setNewDistrict] = useState('Yavatmal');
  const [newTaluka, setNewTaluka] = useState('');
  const [newCrop, setNewCrop] = useState<CropId>('cotton');
  const [newCropStage, setNewCropStage] = useState<CropStage>('flowering');
  const [newNotes, setNewNotes] = useState('');

  // Agronomist review form state
  const [agronomistAdviceInput, setAgronomistAdviceInput] = useState('');
  const [audioPlaying, setAudioPlaying] = useState(false);

  const activeReferral = referrals.find((r) => r.id === selectedReferralId) || referrals[0];

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const newId = `KSH-MH-2026-${Math.floor(100 + Math.random() * 900)}`;
      const newTicket: ExpertReferral = {
        id: newId,
        farmerName: newFarmerName || 'Kisan Bandhu',
        contactNumber: newContact || '+91 98000 00000',
        district: newDistrict,
        taluka: newTaluka || 'HQ Taluka',
        village: 'Farmer Field',
        crop: newCrop,
        cropStage: newCropStage,
        soilType: 'black_cotton',
        suspectedDiseaseId: `${newCrop}-blight`,
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80',
        notes: newNotes || 'Unusual spots and leaf curling observed over past 48 hours.',
        status: 'pending',
        assignedKvk: 'kvk-yavatmal',
        submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };

      setReferrals([newTicket, ...referrals]);
      setSelectedReferralId(newId);
      setIsSubmitting(false);
      setFormSubmitted(true);
      setNewNotes('');
    }, 800);
  };

  const handleAgronomistVerify = (status: 'reviewed' | 'lab_referred') => {
    setReferrals((prev) =>
      prev.map((r) => {
        if (r.id === activeReferral.id) {
          return {
            ...r,
            status,
            agronomistName: 'Dr. Ramesh Jadhav (KVK Agronomist)',
            agronomistAdvice:
              agronomistAdviceInput ||
              'Confirmed pathogen identification. Apply recommended bio-control formulation and maintain 15cm row drainage.',
            labTestReport:
              status === 'lab_referred'
                ? 'Sample registered at MPKV Pathology Lab. Sporangia culture test in progress.'
                : r.labTestReport,
            reviewedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          };
        }
        return r;
      })
    );
    setAgronomistAdviceInput('');
  };

  const statusBadge = (st: ExpertReferral['status']) => {
    switch (st) {
      case 'reviewed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'lab_referred':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'resolved':
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="container-narrow py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-leaf-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-leaf-100 text-leaf-800">
              <Building2 className="w-3.5 h-3.5 text-leaf-600" />
              ICAR-KVK & State Agricultural University Network
            </span>
            <span className="text-xs text-leaf-600">Direct Agronomist Escalation</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-leaf-950">
            {t('title')}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-leaf-700 max-w-2xl">
            {t('subtitle')}
          </p>
        </div>

        {/* Quick KVK stats */}
        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-leaf-200 shadow-soft">
          <div className="text-center px-2">
            <span className="text-xs text-leaf-600 block">KVKs Linked</span>
            <span className="text-xl font-bold font-display text-leaf-900">
              {maharashtraKvkNetwork.length}
            </span>
          </div>
          <div className="h-8 w-px bg-leaf-200" />
          <div className="text-center px-2">
            <span className="text-xs text-leaf-600 block">Active Tickets</span>
            <span className="text-xl font-bold font-display text-amber-600">
              {referrals.length}
            </span>
          </div>
          <div className="h-8 w-px bg-leaf-200" />
          <div className="text-center px-2">
            <span className="text-xs text-leaf-600 block">Avg Response</span>
            <span className="text-xl font-bold font-display text-leaf-900">
              2.4 hrs
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-leaf-200 gap-2">
        <button
          onClick={() => setActiveTab('farmer')}
          className={cn(
            'px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2',
            activeTab === 'farmer'
              ? 'border-leaf-600 text-leaf-900 bg-leaf-50/50 rounded-t-lg'
              : 'border-transparent text-leaf-600 hover:text-leaf-900'
          )}
        >
          <UserCheck className="w-4 h-4" />
          {t('tabFarmer')}
        </button>
        <button
          onClick={() => setActiveTab('agronomist')}
          className={cn(
            'px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2',
            activeTab === 'agronomist'
              ? 'border-leaf-600 text-leaf-900 bg-leaf-50/50 rounded-t-lg'
              : 'border-transparent text-leaf-600 hover:text-leaf-900'
          )}
        >
          <Microscope className="w-4 h-4" />
          {t('tabAgronomist')}
        </button>
        <button
          onClick={() => setActiveTab('directory')}
          className={cn(
            'px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2',
            activeTab === 'directory'
              ? 'border-leaf-600 text-leaf-900 bg-leaf-50/50 rounded-t-lg'
              : 'border-transparent text-leaf-600 hover:text-leaf-900'
          )}
        >
          <Building2 className="w-4 h-4" />
          {t('tabDirectory')}
        </button>
      </div>

      {/* TAB 1: Farmer Ticket Tracker */}
      {activeTab === 'farmer' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Referral Tickets List (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-xs font-bold text-leaf-800 uppercase tracking-wider px-1">
                Your Submitted Cases ({referrals.length})
              </h3>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {referrals.map((r) => {
                  const isSelected = r.id === activeReferral.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedReferralId(r.id)}
                      className={cn(
                        'card p-4 cursor-pointer transition-all border text-left',
                        isSelected
                          ? 'border-leaf-600 bg-leaf-50/60 shadow-soft'
                          : 'border-leaf-100 hover:border-leaf-300 bg-white'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono text-xs font-bold text-leaf-900">
                          {r.id}
                        </span>
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase',
                            statusBadge(r.status)
                          )}
                        >
                          {r.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="font-semibold text-sm text-leaf-950 capitalize">
                        {r.crop} • {r.suspectedDiseaseId.replace(`${r.crop}-`, '')}
                      </div>
                      <div className="text-xs text-leaf-600 mt-1 flex items-center justify-between">
                        <span>{r.village}, {r.district}</span>
                        <span>{r.submittedAt.slice(0, 10)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit New Referral Toggle */}
              <div className="pt-2">
                <a
                  href="#referral-form"
                  className="btn-secondary w-full text-center text-xs py-2.5 block"
                >
                  + Create New Expert Referral
                </a>
              </div>
            </div>

            {/* Detailed Case Dossier (8 cols) */}
            <div className="lg:col-span-8 card p-6 space-y-6 border border-leaf-200">
              <div className="flex items-start justify-between gap-4 border-b border-leaf-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-leaf-700">
                      {activeReferral.id}
                    </span>
                    <span className="text-xs text-leaf-500">• Submitted {activeReferral.submittedAt}</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-leaf-950 capitalize">
                    {activeReferral.crop} Disease Consultation
                  </h3>
                  <p className="text-xs text-leaf-600 mt-0.5">
                    Assigned to: {maharashtraKvkNetwork.find((k) => k.id === activeReferral.assignedKvk)?.nameEn || 'Maharashtra KVK Central Hub'}
                  </p>
                </div>

                <span
                  className={cn(
                    'text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider',
                    statusBadge(activeReferral.status)
                  )}
                >
                  Status: {activeReferral.status.replace('_', ' ')}
                </span>
              </div>

              {/* Digital Sample Dossier Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="rounded-xl overflow-hidden aspect-[4/3] bg-leaf-100 relative">
                    <img
                      src={activeReferral.imageUrl}
                      alt="Crop disease sample"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                      Geo-Tagged Field Capture
                    </span>
                  </div>

                  <div className="p-3 bg-cream-50 rounded-xl border border-leaf-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-leaf-600">Farmer:</span>
                      <span className="font-bold text-leaf-900">{activeReferral.farmerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-leaf-600">Location:</span>
                      <span className="font-semibold text-leaf-900">
                        {activeReferral.village}, {activeReferral.taluka}, {activeReferral.district}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-leaf-600">Crop Stage:</span>
                      <span className="capitalize text-leaf-900">{activeReferral.cropStage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-leaf-600">Soil Type:</span>
                      <span className="capitalize text-leaf-900">{activeReferral.soilType?.replace('_', ' ') || 'Black Cotton'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-leaf-900 uppercase tracking-wider mb-1">
                      Farmer Reported Symptoms & Trap Observation:
                    </h4>
                    <p className="text-xs text-leaf-700 bg-leaf-50 p-3 rounded-xl border border-leaf-100 leading-relaxed">
                      "{activeReferral.notes}"
                    </p>
                  </div>

                  {/* Agronomist Advice section */}
                  {activeReferral.agronomistAdvice ? (
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          Agronomist Prescription:
                        </h4>
                        <span className="text-[11px] text-emerald-800 font-semibold">
                          {activeReferral.agronomistName}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-900 leading-relaxed">
                        {activeReferral.agronomistAdvice}
                      </p>

                      {/* Mock audio note */}
                      <div className="pt-2">
                        <button
                          onClick={() => setAudioPlaying(!audioPlaying)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          {audioPlaying ? 'Playing Scientist Voice Advisory...' : 'Listen to Agronomist Audio Advisory (Marathi)'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      Assigned scientist is reviewing this specimen. Estimated turnaround: under 3 hours.
                    </div>
                  )}

                  {/* Lab Test Report section */}
                  {activeReferral.labTestReport && (
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-1.5">
                      <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Microscope className="w-4 h-4 text-purple-700" />
                        State Pathology Lab Analysis:
                      </h4>
                      <p className="text-xs text-purple-900 leading-relaxed font-mono">
                        {activeReferral.labTestReport}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* New Referral Submission Form */}
          <div id="referral-form" className="card p-6 bg-leaf-50/70 border border-leaf-200 space-y-4">
            <h3 className="font-display text-xl font-bold text-leaf-950 flex items-center gap-2">
              <Send className="w-5 h-5 text-leaf-700" />
              {t('submitReferral')}
            </h3>
            <p className="text-xs text-leaf-700">
              Unable to identify symptoms from AI scanning? Send high-resolution images directly to the nearest Krishi Vigyan Kendra specialist in Maharashtra.
            </p>

            {formSubmitted && (
              <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                Case successfully registered and forwarded to district KVK agronomist. Ticket ID: {activeReferral.id}
              </div>
            )}

            <form onSubmit={handleCreateReferral} className="grid gap-4 sm:grid-cols-3 text-xs">
              <div>
                <label className="block font-semibold text-leaf-800 mb-1">Farmer Full Name</label>
                <input
                  type="text"
                  required
                  value={newFarmerName}
                  onChange={(e) => setNewFarmerName(e.target.value)}
                  placeholder="e.g. Dnyaneshwar Patil"
                  className="w-full px-3 py-2 rounded-lg border border-leaf-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-leaf-800 mb-1">Mobile Contact</label>
                <input
                  type="tel"
                  required
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full px-3 py-2 rounded-lg border border-leaf-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-leaf-800 mb-1">District</label>
                <select
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-leaf-300 bg-white font-medium"
                >
                  <option value="Yavatmal">Yavatmal (विदर्भ)</option>
                  <option value="Nashik">Nashik (उत्तर महाराष्ट्र)</option>
                  <option value="Kolhapur">Kolhapur (पश्चिम महाराष्ट्र)</option>
                  <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar (मराठवाडा)</option>
                  <option value="Pune">Pune (पुणे विभाग)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-leaf-800 mb-1">Taluka & Village</label>
                <input
                  type="text"
                  required
                  value={newTaluka}
                  onChange={(e) => setNewTaluka(e.target.value)}
                  placeholder="e.g. Ralegaon / Wadki"
                  className="w-full px-3 py-2 rounded-lg border border-leaf-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-leaf-800 mb-1">Crop</label>
                <select
                  value={newCrop}
                  onChange={(e) => setNewCrop(e.target.value as CropId)}
                  className="w-full px-3 py-2 rounded-lg border border-leaf-300 bg-white font-medium"
                >
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {tCrops(c.id)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-leaf-800 mb-1">Crop Stage</label>
                <select
                  value={newCropStage}
                  onChange={(e) => setNewCropStage(e.target.value as CropStage)}
                  className="w-full px-3 py-2 rounded-lg border border-leaf-300 bg-white font-medium"
                >
                  <option value="nursery">Nursery / Seedling</option>
                  <option value="vegetative">Vegetative</option>
                  <option value="flowering">Flowering</option>
                  <option value="fruiting">Fruiting / Boll formation</option>
                  <option value="maturity">Harvest Maturity</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-leaf-800 mb-1">
                  Observed Symptoms, Pheromone Catch, or Chemical History
                </label>
                <textarea
                  rows={3}
                  required
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Describe leaf spots, wilting, moth catch in traps, recent weather (rain/fog), or previous pesticide sprays..."
                  className="w-full px-3 py-2 rounded-lg border border-leaf-300 bg-white"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-6 py-2.5 text-xs font-semibold"
                >
                  {isSubmitting ? 'Registering Ticket...' : 'Dispatch Sample to KVK Agronomist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Agronomist Console */}
      {activeTab === 'agronomist' && (
        <div className="card p-6 space-y-6 animate-fade-in">
          <div>
            <h3 className="font-display text-xl font-bold text-leaf-950 flex items-center gap-2">
              <Microscope className="w-5 h-5 text-leaf-700" />
              Agronomist Review & Diagnostic Validation Portal
            </h3>
            <p className="text-xs text-leaf-700 mt-1">
              Authorised interface for KVK scientists, SAU plant pathologists, and Gram Krishi Sahayak extension officers to evaluate farmer sample tickets.
            </p>
          </div>

          <div className="p-4 bg-cream-50 rounded-xl border border-leaf-200 grid gap-4 sm:grid-cols-2 text-xs">
            <div>
              <span className="font-semibold text-leaf-900 block mb-1">Current Selected Case:</span>
              <p className="font-mono text-leaf-800 font-bold">{activeReferral.id} ({activeReferral.farmerName})</p>
              <p className="text-leaf-600">{activeReferral.village}, {activeReferral.district} • Crop: {activeReferral.crop}</p>
              <p className="mt-2 text-leaf-700 italic">"{activeReferral.notes}"</p>
            </div>

            <div className="space-y-3">
              <label className="block font-semibold text-leaf-900">
                Agronomist Clinical Advice & CIBRC Treatment Order:
              </label>
              <textarea
                rows={3}
                value={agronomistAdviceInput}
                onChange={(e) => setAgronomistAdviceInput(e.target.value)}
                placeholder="Enter scientific recommendation, biocontrol protocol, water volume, and Pre-Harvest Interval (PHI)..."
                className="w-full p-2.5 rounded-lg border border-leaf-300 bg-white text-xs"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleAgronomistVerify('reviewed')}
                  className="btn-primary text-xs px-4 py-2"
                >
                  Confirm Diagnosis & Issue Advisory
                </button>
                <button
                  onClick={() => handleAgronomistVerify('lab_referred')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition"
                >
                  Refer to SAU Pathology Lab
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Maharashtra KVK & Lab Directory */}
      {activeTab === 'directory' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {maharashtraKvkNetwork.map((kvk) => (
              <div key={kvk.id} className="card p-5 border border-leaf-200 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-leaf-100 text-leaf-800 uppercase">
                    {kvk.district}
                  </span>
                  <h4 className="font-display font-bold text-base text-leaf-950 mt-2">
                    {locale === 'mr' ? kvk.nameMr : kvk.nameEn}
                  </h4>
                  <p className="text-xs text-leaf-600 mt-1 font-medium">
                    {kvk.university}
                  </p>
                  <p className="text-xs text-leaf-700 mt-3">
                    <span className="font-semibold">Lead Scientist:</span> {kvk.leadScientist}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-leaf-100 space-y-1 text-xs text-leaf-600">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-leaf-600" />
                    <span>{kvk.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-leaf-600" />
                    <span>{kvk.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
