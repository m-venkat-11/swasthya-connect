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
  nameKey: { en: string; mr: string; te: string };
  category: HealthNeedType;
  isRedFlag: boolean;
}

const AVAILABLE_SYMPTOMS: SymptomOption[] = [
  { 
    id: 'fever', 
    nameKey: {
      en: 'High Fever & Chills (Fever)',
      mr: 'तीव्र ताप आणि थंडी वाजणे (ताप)',
      te: 'తీవ్ర జ్వరం & చలి (జ్వరం)'
    }, 
    category: 'general', 
    isRedFlag: false 
  },
  { 
    id: 'cough', 
    nameKey: {
      en: 'Persistent Cough & Cold',
      mr: 'सतत खोकला आणि सर्दी',
      te: 'ఎడతెగని దగ్గు & జలుబు'
    }, 
    category: 'general', 
    isRedFlag: false 
  },
  { 
    id: 'breathing', 
    nameKey: {
      en: 'Difficulty Breathing / Chest Tightness',
      mr: 'श्वास घेण्यास त्रास / धाप लागणे',
      te: 'శ్వాస తీసుకోవడంలో తీవ్ర ఇబ్బంది'
    }, 
    category: 'emergency', 
    isRedFlag: true 
  },
  { 
    id: 'chest_pain', 
    nameKey: {
      en: 'Sudden Severe Chest Pain',
      mr: 'छातीत तीव्र कळ किंवा वेदना',
      te: 'గుండెల్లో తీవ్రమైన నొప్పి'
    }, 
    category: 'emergency', 
    isRedFlag: true 
  },
  { 
    id: 'maternal_pain', 
    nameKey: {
      en: 'Maternal Delivery Pain / Contractions',
      mr: 'प्रसूती वेदना / पोटात कळा',
      te: 'ప్రసవ నొప్పులు / గర్భాశయ నొప్పి'
    }, 
    category: 'maternity', 
    isRedFlag: false 
  },
  { 
    id: 'severe_bleeding', 
    nameKey: {
      en: 'Severe Bleeding / Hemorrhage',
      mr: 'जास्त रक्तस्राव होणे',
      te: 'తీవ్ర రక్తస్రావం'
    }, 
    category: 'emergency', 
    isRedFlag: true 
  },
  { 
    id: 'vomiting', 
    nameKey: {
      en: 'Severe Vomiting & Dehydration',
      mr: 'वारंवार उलट्या आणि जुलाब',
      te: 'తీవ్ర వాంతులు & నీరసం'
    }, 
    category: 'general', 
    isRedFlag: false 
  },
  { 
    id: 'child_fever', 
    nameKey: {
      en: 'Child High Fever or Lethargy',
      mr: 'लहान मुलास जास्त ताप किंवा सुस्ती',
      te: 'చిన్నపిల్లలకు అధిక జ్వరం & నిస్సత్తువ'
    }, 
    category: 'child_care', 
    isRedFlag: false 
  },
  { 
    id: 'trauma', 
    nameKey: {
      en: 'Fracture / Deep Wound / Trauma',
      mr: 'हाड मोडणे / गंभीर जखम / अपघात',
      te: 'ఎముక విరగడం / తీవ్ర గాయం / ప్రమాదం'
    }, 
    category: 'emergency', 
    isRedFlag: true 
  }
];

export const SymptomScreeningPage: React.FC = () => {
  const { selectedDistrict, setSelectedNeed, language, t } = useApp();
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
      const advice = language === 'mr'
        ? 'लक्षणे अतिगंभीर आजार किंवा श्वास घेण्यास अडथळा दर्शवतात. नेहमीच्या ओपीडीची वाट पाहू नका. त्वरित जवळच्या २४ तास सुरू असलेल्या सरकारी आपत्कालीन रुग्णालयात जा किंवा १०८ वर कॉल करा.'
        : language === 'te'
        ? 'ఈ లక్షణాలు తీవ్రమైన అనారోగ్యాన్ని లేదా శ్వాసకోశ సమస్యను సూచిస్తున్నాయి. సాధారణ ఓపీడీ సమయం వరకు వేచి ఉండకండి. వెంటనే సమీపంలోని 24x7 అత్యవసర ఆసుపత్రికి వెళ్లండి లేదా 108కి కాల్ చేయండి.'
        : 'Symptoms indicate potential critical illness or respiratory distress. Do not wait for routine OPD hours. Proceed immediately to the nearest 24x7 casualty hospital or call 108.';

      const risk = language === 'mr'
        ? 'अतिदक्षता सूचना — तात्काळ आपत्कालीन उपचारांची गरज'
        : language === 'te'
        ? 'హై రిస్క్ అలర్ట్ — తక్షణ అత్యవసర వైద్యం అవసరం'
        : 'High Risk Alert — Immediate Emergency Care Required';

      const level = language === 'mr'
        ? 'उप-जिल्हा किंवा जिल्हा रुग्णालय (SDH / DH)'
        : language === 'te'
        ? 'సబ్-డిస్ట్రిక్ట్ / జిల్లా సివిల్ ఆసుపత్రి (SDH / DH)'
        : 'Sub-District / Civil Hospital (SDH/DH)';

      setTriageResult({
        symptoms: selectedSymptoms,
        duration,
        severity: 'emergency',
        riskLevel: risk,
        recommendedLevel: level,
        recommendedServiceNeed: 'emergency',
        adviceSummary: advice,
        isEmergency: true
      });
      return;
    }

    const hasMaternal = selectedSymptoms.includes('maternal_pain');
    const hasChild = selectedSymptoms.includes('child_fever');

    if (hasMaternal) {
      const advice = language === 'mr'
        ? 'प्रसूती वेदना किंवा गरोदरपणातील त्रासासाठी सुसज्ज प्रसूती कक्ष, सोनोग्राफी तपासणी आणि २४ तास प्रशिक्षित परिचारिका असलेल्या ग्रामीण किंवा उप-जिल्हा रुग्णालयात (CHC/SDH) जाणे आवश्यक आहे.'
        : language === 'te'
        ? 'ప్రసవ నొప్పులు లేదా గర్భధారణ సంబంధిత ఇబ్బందులకు డెలివరీ సూట్, అల్ట్రాసౌండ్ స్కానింగ్ మరియు నిపుణులైన సిబ్బంది ఉన్న సామాజిక ఆరోగ్య కేంద్రం (CHC/SDH) అత్యంత సరైనది.'
        : 'Maternal labor pain or pregnancy discomfort requires professional delivery suite, ultrasound verification, and skilled nursing staff at a First Referral Unit (CHC/SDH).';

      const risk = language === 'mr'
        ? 'प्रसूती तपासणी — स्त्रीरोग व प्रसूती कक्ष आवश्यक'
        : language === 'te'
        ? 'ప్రసవ నిర్ధారణ — ప్రసవ వార్డు అవసరం'
        : 'Maternal Assessment — Obstetric Unit Required';

      const level = language === 'mr'
        ? 'ग्रामीण रुग्णालय (CHC)'
        : language === 'te'
        ? 'సామాజిక ఆరోగ్య కేంద్రం (CHC)'
        : 'Community Health Centre (CHC)';

      setTriageResult({
        symptoms: selectedSymptoms,
        duration,
        severity: 'moderate',
        riskLevel: risk,
        recommendedLevel: level,
        recommendedServiceNeed: 'maternity',
        adviceSummary: advice,
        isEmergency: false
      });
      return;
    }

    if (hasChild) {
      const advice = language === 'mr'
        ? 'लहान मुलांच्या तापासाठी वैद्यकीय अधिकाऱ्यांचा सल्ला, तोंडावाटे ओआरएस (ORS) आणि प्राथमिक तपासणी प्राथमिक आरोग्य केंद्रात (PHC) मोफत उपलब्ध आहे.'
        : language === 'te'
        ? 'పిల్లలకు జ్వరం వచ్చినప్పుడు ప్రాథమిక ఆరోగ్య కేంద్రంలో (PHC) వైద్యుని సంప్రదింపులు మరియు ఓఆర్ఎస్ డీహైడ్రేషన్ చికిత్స సరిపోతుంది.'
        : 'Child fever requires pediatrician or primary medical officer consultation and oral hydration checkup.';

      const risk = language === 'mr'
        ? 'बालरोग काळजी — वैद्यकीय अधिकारी तपासणी'
        : language === 'te'
        ? 'శిశు సంరక్షణ — వైద్యాధికారి పరీక్ష'
        : 'Pediatric Care — Medical Officer Attention';

      const level = language === 'mr'
        ? 'प्राथमिक आरोग्य केंद्र (PHC)'
        : language === 'te'
        ? 'ప్రాథమిక ఆరోగ్య కేంద్రం (PHC)'
        : 'Primary Health Centre (PHC)';

      setTriageResult({
        symptoms: selectedSymptoms,
        duration,
        severity: 'moderate',
        riskLevel: risk,
        recommendedLevel: level,
        recommendedServiceNeed: 'child_care',
        adviceSummary: advice,
        isEmergency: false
      });
      return;
    }

    // General low to moderate risk
    const isModerate = duration === 'Over a Week' || severity === 'moderate';
    const advice = isModerate
      ? language === 'mr'
        ? 'अनेक दिवस टिकून राहणाऱ्या आजारासाठी ग्रामीण रुग्णालय (CHC) किंवा उपजिल्हा रुग्णालयात रक्त तपासणी व डॉक्टरांचा सल्ला घ्यावा.'
        : language === 'te'
        ? 'చాలా రోజుల నుండి కొనసాగుతున్న అనారోగ్యానికి సామాజిక ఆరోగ్య కేంద్రం (CHC) వద్ద రక్త పరీక్షలు చేయించుకోవడం మంచిది.'
        : 'Symptoms persisting over several days should be evaluated with blood tests and doctor examination at a Community Health Centre (CHC).'
      : language === 'mr'
        ? 'सामान्य लक्षणांवर तुमच्या गावातील प्राथमिक आरोग्य केंद्रामध्ये (PHC) मोफत औषधे व ओपीडी सल्ला सहज उपलब्ध आहे. लांब जाण्याची गरज नाही.'
        : language === 'te'
        ? 'సాధారణ లక్షణాలకు మీ గ్రామ ప్రాథమిక ఆరోగ్య కేంద్రంలోనే (PHC) ఉచిత మందులు మరియు వైద్య పరీక్షలు అందుబాటులో ఉన్నాయి.'
        : 'Mild acute symptoms can be effectively managed with generic essential medicines and consultation at your local village Primary Health Centre (PHC).';

    const risk = isModerate
      ? language === 'mr' ? 'मध्यम आरोग्य समस्या — ग्रामीण रुग्णालय (CHC)' : language === 'te' ? 'మధ్యస్థ ఆరోగ్యం — సీహెచ్‌సీ (CHC)' : 'Moderate Health Concern — CHC'
      : language === 'mr' ? 'प्राथमिक काळजी — स्थानिक PHC पुरेसे आहे' : language === 'te' ? 'ప్రాథమిక సంరక్షణ — పీహెచ్‌సీ సరిపోతుంది' : 'Primary Care — Nearest PHC Sufficient';

    const level = isModerate
      ? language === 'mr' ? 'ग्रामीण रुग्णालय (CHC)' : language === 'te' ? 'సామాజిక ఆరోగ్య కేంద్రం (CHC)' : 'Community Health Centre (CHC)'
      : language === 'mr' ? 'प्राथमिक आरोग्य केंद्र (PHC)' : language === 'te' ? 'ప్రాథమిక ఆరోగ్య కేంద్రం (PHC)' : 'Primary Health Centre (PHC)';

    setTriageResult({
      symptoms: selectedSymptoms,
      duration,
      severity: isModerate ? 'moderate' : 'mild',
      riskLevel: risk,
      recommendedLevel: level,
      recommendedServiceNeed: 'general',
      adviceSummary: advice,
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

  const durationOptions = [
    { 
      id: 'Since Today', 
      label: language === 'mr' ? 'आजपासून' : language === 'te' ? 'ఈ రోజు నుండి' : 'Since Today' 
    },
    { 
      id: '2-3 Days', 
      label: language === 'mr' ? '२-३ दिवस' : language === 'te' ? '2-3 రోజులు' : '2-3 Days' 
    },
    { 
      id: 'Over a Week', 
      label: language === 'mr' ? '१ आठवड्यापेक्षा जास्त' : language === 'te' ? 'ఒక వారం కంటే ఎక్కువ' : 'Over a Week' 
    }
  ];

  const severityOptions = [
    { 
      id: 'mild', 
      label: language === 'mr' ? 'कमी / सौम्य' : language === 'te' ? 'సాధారణం' : 'Mild / Manageable' 
    },
    { 
      id: 'moderate', 
      label: language === 'mr' ? 'मध्यम वेदना' : language === 'te' ? 'మధ్యస్థ నొప్పి' : 'Moderate Pain' 
    },
    { 
      id: 'emergency', 
      label: language === 'mr' ? 'अतिगंभीर / असह्य' : language === 'te' ? 'తీవ్ర అత్యవసరం' : 'Severe / Unbearable' 
    }
  ];

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
          <span>{t('locationLabel')}: <strong>{selectedDistrict}</strong></span>
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden border border-teal-800/40">
        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-300 uppercase tracking-wider">
            <HeartPulse className="w-4 h-4 text-rose-400" />
            <span>{language === 'mr' ? 'क्लिनिकल लक्षण तपासणी व रुग्णालय मार्गदर्शन' : language === 'te' ? 'క్లినికల్ లక్షణాల విశ్లేషణ & ఆసుపత్రి మార్గదర్శకత్వం' : 'CLINICAL SYMPTOM TRIAGE & FACILITY ROUTING'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {t('screeningTitle')}
          </h1>

          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed max-w-3xl">
            {t('screeningSubtitle')}
          </p>
        </div>
      </div>

      {/* Symptom Selection Form */}
      <form onSubmit={handleRunTriage} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-card space-y-6">
        
        {/* Step 1: Select Symptoms */}
        <div className="space-y-3">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span>{t('selectSymptomsTitle')}</span>
            <span className="text-[10px] text-teal-700 font-semibold">{t('selectSymptomsSubtitle')}</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {AVAILABLE_SYMPTOMS.map((sym) => {
              const isSelected = selectedSymptoms.includes(sym.id);
              const displayName = sym.nameKey[language as 'en' | 'mr' | 'te'] || sym.nameKey.en;
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
                      {displayName}
                    </div>
                    {sym.isRedFlag && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700">
                        <AlertTriangle className="w-3 h-3" /> {language === 'mr' ? 'तातडीचे लक्षण' : language === 'te' ? 'అత్యవసర లక్షణం' : 'Red-Flag Symptom'}
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
              {t('durationLabel')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {durationOptions.map((d) => (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => setDuration(d.id)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    duration === d.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              {t('severityLabel')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {severityOptions.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSeverity(s.id as 'mild' | 'moderate' | 'emergency')}
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
            <span>{t('checkRecommendationBtn')}</span>
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
                  {t('recommendedTierLabel')}: {triageResult.recommendedLevel}
                </h3>
              </div>
            </div>

            {triageResult.isEmergency && (
              <a
                href="tel:108"
                className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 tap-target shrink-0 uppercase"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{t('callAmbulanceAction')}</span>
              </a>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-white/80 p-4 rounded-2xl border border-slate-200">
            {triageResult.adviceSummary}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-600">
              {t('locationLabel')}: <strong>{selectedDistrict}</strong>
            </span>

            <button
              onClick={handleProceedToFacilities}
              className="bg-slate-950 hover:bg-slate-800 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-md tap-target"
            >
              <span>{t('proceedToHospitalAction')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
