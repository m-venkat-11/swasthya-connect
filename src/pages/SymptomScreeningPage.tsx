import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { HealthNeedType, ScreeningTriageResult } from '../types';
import { 
  HeartPulse, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  PhoneCall, 
  Stethoscope, 
  Sparkles,
  MapPin
} from 'lucide-react';

interface SymptomOption {
  id: string;
  name: string;
  category: HealthNeedType;
  isRedFlag: boolean;
}

const AVAILABLE_SYMPTOMS: SymptomOption[] = [
  { id: 'fever', name: 'High Fever & Chills (జ్వరం / ताप)', category: 'general', isRedFlag: false },
  { id: 'cough', name: 'Persistent Cough & Cold (దగ్గు / खोकला)', category: 'general', isRedFlag: false },
  { id: 'breathing', name: 'Difficulty Breathing / Chest Tightness (శ్వాస తీసుకోవడంలో ఇబ్బంది)', category: 'emergency', isRedFlag: true },
  { id: 'chest_pain', name: 'Sudden Severe Chest Pain (గుండె నొప్పి)', category: 'emergency', isRedFlag: true },
  { id: 'maternal_pain', name: 'Maternal Delivery Pain / Contractions (ప్రసవ నొప్పులు)', category: 'maternity', isRedFlag: false },
  { id: 'severe_bleeding', name: 'Severe Bleeding / Hemorrhage (తీవ్ర రక్తస్రావం)', category: 'emergency', isRedFlag: true },
  { id: 'vomiting', name: 'Severe Vomiting & Dehydration (వాంతులు)', category: 'general', isRedFlag: false },
  { id: 'child_fever', name: 'Child High Fever or Lethargy (శిశువులకు అధిక జ్వరం)', category: 'child_care', isRedFlag: false },
  { id: 'trauma', name: 'Fracture / Deep Wound / Trauma (గాయం / ఎముక విరగడం)', category: 'emergency', isRedFlag: true }
];

export const SymptomScreeningPage: React.FC = () => {
  const { selectedDistrict, setSelectedNeed, t } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>('2-3 Days');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'emergency'>('mild');
  const [triageResult, setTriageResult] = useState<ScreeningTriageResult | null>(null);

  // Pre-fill symptoms if coming from voice command
  useEffect(() => {
    const rawSymptoms = searchParams.get('symptoms');
    if (rawSymptoms) {
      const decoded = decodeURIComponent(rawSymptoms).toLowerCase();
      const matchedIds: string[] = [];
      if (decoded.includes('fever')) matchedIds.push('fever');
      if (decoded.includes('cough')) matchedIds.push('cough');
      if (decoded.includes('vomit')) matchedIds.push('vomiting');
      if (decoded.includes('breath') || decoded.includes('chest')) matchedIds.push('breathing');
      if (decoded.includes('maternal') || decoded.includes('pregnant')) matchedIds.push('maternal_pain');
      if (matchedIds.length > 0) {
        setSelectedSymptoms(matchedIds);
      }
    }
  }, [searchParams]);

  const toggleSymptom = (id: string) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
    setTriageResult(null);
  };

  const handleRunTriage = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSymptoms.length === 0) return;

    const hasRedFlag = selectedSymptoms.some(sId => {
      const item = AVAILABLE_SYMPTOMS.find(s => s.id === sId);
      return item?.isRedFlag;
    });

    if (hasRedFlag || severity === 'emergency') {
      setTriageResult({
        symptoms: selectedSymptoms,
        duration,
        severity: 'emergency',
        riskLevel: 'High Risk Alert — Immediate Emergency Care Required',
        recommendedLevel: 'Sub-District / Civil Hospital (SDH/DH)',
        recommendedServiceNeed: 'emergency',
        adviceSummary: 'Symptoms indicate potential critical illness or respiratory distress. Do not wait for routine OPD hours. Proceed immediately to the nearest 24x7 casualty hospital or call 108.',
        isEmergency: true
      });
      return;
    }

    const hasMaternal = selectedSymptoms.includes('maternal_pain');
    const hasChild = selectedSymptoms.includes('child_fever');

    if (hasMaternal) {
      setTriageResult({
        symptoms: selectedSymptoms,
        duration,
        severity: 'moderate',
        riskLevel: 'Maternal Assessment — Obstetric Unit Required',
        recommendedLevel: 'Community Health Centre (CHC)',
        recommendedServiceNeed: 'maternity',
        adviceSummary: 'Maternal labor pain or pregnancy discomfort requires professional delivery suite, ultrasound verification, and skilled nursing staff at a First Referral Unit (CHC/SDH).',
        isEmergency: false
      });
      return;
    }

    if (hasChild) {
      setTriageResult({
        symptoms: selectedSymptoms,
        duration,
        severity: 'moderate',
        riskLevel: 'Pediatric Care — Medical Officer Attention',
        recommendedLevel: 'Primary Health Centre (PHC)',
        recommendedServiceNeed: 'child_care',
        adviceSummary: 'Child fever requires pediatrician or primary medical officer consultation and oral hydration checkup.',
        isEmergency: false
      });
      return;
    }

    // General low to moderate risk
    const isModerate = duration === 'Over a Week' || severity === 'moderate';
    setTriageResult({
      symptoms: selectedSymptoms,
      duration,
      severity: isModerate ? 'moderate' : 'mild',
      riskLevel: isModerate ? 'Moderate Health Concern — CHC / Civil OPD' : 'Primary Care — Nearest PHC Sufficient',
      recommendedLevel: isModerate ? 'Community Health Centre (CHC)' : 'Primary Health Centre (PHC)',
      recommendedServiceNeed: 'general',
      adviceSummary: isModerate
        ? 'Symptoms persisting over several days should be evaluated with blood tests and doctor examination at a Community Health Centre (CHC).'
        : 'Mild acute symptoms can be effectively managed with generic essential medicines and consultation at your local village Primary Health Centre (PHC).',
      isEmergency: false
    });
  };

  const handleProceedToFacilities = () => {
    if (triageResult) {
      setSelectedNeed(triageResult.recommendedServiceNeed);
      if (triageResult.isEmergency) {
        navigate('/emergency');
      } else {
        navigate('/results');
      }
    }
  };

  return (
    <div className="w-full space-y-6 pb-14 animate-in fade-in duration-200">
      
      {/* Top Back & Location Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all tap-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back')}</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-teal-600" />
          <span>Active Location: <strong>{selectedDistrict}</strong></span>
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden border border-teal-800/40">
        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-300 uppercase tracking-wider">
            <HeartPulse className="w-4 h-4 text-rose-400" />
            <span>CLINICAL SYMPTOM TRIAGE & FACILITY ROUTING</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            I Don't Feel Well — Healthcare Screening
          </h1>

          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed max-w-3xl">
            Tell us what symptoms you are experiencing. SwasthyaConnect evaluates the risk level and directs you to the right government facility—preventing unnecessary travel to distant hospitals when a local PHC can help.
          </p>
        </div>
      </div>

      {/* Symptom Selection Form */}
      <form onSubmit={handleRunTriage} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-card space-y-6">
        
        {/* Step 1: Select Symptoms */}
        <div className="space-y-3">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span>Step 1: Select Your Current Symptoms</span>
            <span className="text-[10px] text-teal-700 font-semibold">(Select all that apply)</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {AVAILABLE_SYMPTOMS.map((sym) => {
              const isSelected = selectedSymptoms.includes(sym.id);
              return (
                <button
                  type="button"
                  key={sym.id}
                  onClick={() => toggleSymptom(sym.id)}
                  className={`p-4 rounded-2xl border text-left transition-all tap-target flex items-start justify-between gap-3 ${
                    isSelected
                      ? sym.isRedFlag
                        ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/30'
                        : 'bg-teal-50 border-teal-600 ring-2 ring-teal-600/30'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                      {sym.name}
                    </div>
                    {sym.isRedFlag && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700">
                        <AlertTriangle className="w-3 h-3" /> Red-Flag Symptom
                      </span>
                    )}
                  </div>
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border ${
                    isSelected ? 'bg-teal-700 border-teal-700 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Duration & Severity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              How long have you had these symptoms?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Since Today', '2-3 Days', 'Over a Week'].map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    duration === d
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              Discomfort Severity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'mild', label: 'Mild / Manageable' },
                { id: 'moderate', label: 'Moderate Pain' },
                { id: 'emergency', label: 'Severe / Unbearable' }
              ].map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSeverity(s.id as any)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    severity === s.id
                      ? s.id === 'emergency' 
                        ? 'bg-rose-600 text-white shadow-sm' 
                        : 'bg-teal-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Evaluate Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={selectedSymptoms.length === 0}
            className="w-full sm:w-auto px-8 py-3.5 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 tap-target uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze Symptoms & Get Facility Recommendation</span>
          </button>
        </div>
      </form>

      {/* TRIAGE RESULT CARD */}
      {triageResult && (
        <div className={`rounded-3xl border-2 p-6 sm:p-8 space-y-5 shadow-card animate-in fade-in ${
          triageResult.isEmergency 
            ? 'bg-rose-50/90 border-rose-500' 
            : 'bg-teal-50/90 border-teal-600'
        }`}>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                triageResult.isEmergency ? 'bg-rose-600 animate-pulse' : 'bg-teal-700'
              }`}>
                {triageResult.isEmergency ? <AlertTriangle className="w-6 h-6" /> : <Stethoscope className="w-6 h-6" />}
              </div>
              <div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  triageResult.isEmergency ? 'bg-rose-200 text-rose-900' : 'bg-teal-200 text-teal-900'
                }`}>
                  {triageResult.riskLevel}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Recommended: {triageResult.recommendedLevel}
                </h3>
              </div>
            </div>

            {triageResult.isEmergency && (
              <a
                href="tel:108"
                className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 tap-target shrink-0 uppercase"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call 108 Ambulance</span>
              </a>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-white/80 p-4 rounded-2xl border border-slate-200">
            {triageResult.adviceSummary}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-600">
              Filtered for: <strong>{selectedDistrict}</strong>
            </span>

            <button
              onClick={handleProceedToFacilities}
              className="bg-slate-950 hover:bg-slate-800 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-md tap-target"
            >
              <span>View Equipped Government Facilities</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
