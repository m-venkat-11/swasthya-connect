import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { HealthNeedType } from '../types';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, Sparkles, X, CheckCircle2, ArrowRight } from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { language, setSelectedNeed, t } = useApp();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [recognizedNeed, setRecognizedNeed] = useState<HealthNeedType | null>(null);

  const voicePresets = [
    {
      text: language === 'mr' 
        ? "मला प्रसूती व महिला रुग्णालय दाखवा" 
        : language === 'te' 
        ? "గర్భిణీలకు దగ్గరలోని ప్రసవ ఆసుపత్రి చూపించండి" 
        : "Show me nearest maternity and delivery government hospital",
      need: 'maternity' as HealthNeedType,
      label: language === 'mr' ? "प्रसूती रुग्णालय" : language === 'te' ? "ప్రసవ ఆసుపత్రి" : "Maternity Hospital"
    },
    {
      text: language === 'mr' 
        ? "लहान मुलांचे डॉक्टर व लसीकरण केंद्र दाखवा" 
        : language === 'te' 
        ? "చిన్న పిల్లల వైద్యం & టీకా కేంద్రం ఎక్కడుంది?" 
        : "Find child care and pediatric vaccination clinic",
      need: 'child_care' as HealthNeedType,
      label: language === 'mr' ? "बालरोग व लसीकरण" : language === 'te' ? "శిశు సంరక్షణ" : "Child Care"
    },
    {
      text: language === 'mr' 
        ? "तातडीच्या आपत्कालीन उपचारासाठी २४x७ रुग्णालय" 
        : language === 'te' 
        ? "అత్యవసర చికిత్స కోసం 24x7 ఆసుపత్రి" 
        : "Emergency 24x7 casualty hospital nearby",
      need: 'emergency' as HealthNeedType,
      label: language === 'mr' ? "२४x७ आपत्कालीन" : language === 'te' ? "అత్యవసర సేవ" : "Emergency"
    },
    {
      text: language === 'mr' 
        ? "ताप व सामान्य तपासणीसाठी जवळचे सरकारी दवाखाना" 
        : language === 'te' 
        ? "సాధారణ జ్వరం కోసం ప్రాథమిక ఆరోగ్య కేంద్రం" 
        : "General fever consultation and PHC OPD",
      need: 'general' as HealthNeedType,
      label: language === 'mr' ? "सामान्य तपासणी" : language === 'te' ? "సాధారణ జ్వరం" : "General OPD"
    }
  ];

  const handleSelectQuery = (text: string, need: HealthNeedType) => {
    setTranscript(text);
    setRecognizedNeed(need);
    
    // Play voice feedback if available
    if ('speechSynthesis' in window) {
      try {
        const langCode = language === 'mr' ? 'mr-IN' : language === 'te' ? 'te-IN' : 'en-IN';
        const msgText = language === 'mr' 
          ? `आपल्यासाठी ${text} शोधत आहे.` 
          : language === 'te' 
          ? `మీ కోసం సరిపోయే ప్రభుత్వ ఆసుపత్రులను చూపిస్తున్నాము.` 
          : `Finding suitable government facilities for your need.`;
        const utterance = new SpeechSynthesisUtterance(msgText);
        utterance.lang = langCode;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.log("Speech synthesis unavailable", e);
      }
    }
  };

  const handleApplyVoiceNeed = () => {
    if (recognizedNeed) {
      setSelectedNeed(recognizedNeed);
      onClose();
      navigate('/results');
    }
  };

  // Web Speech API simulation / listener
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setTranscript(language === 'mr' ? "ऐकत आहे..." : language === 'te' ? "వింటోంది..." : "Listening...");

    // Simulate recognition or hook to SpeechRecognition
    setTimeout(() => {
      setIsListening(false);
      const randomPreset = voicePresets[0];
      setTranscript(randomPreset.text);
      setRecognizedNeed(randomPreset.need);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-teal-800 text-white p-5 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-teal-300 font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{t('voiceTitle')}</span>
            </div>
            <h3 className="text-lg font-bold">{t('voiceSubtitle')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors tap-target flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Microphone Visualizer */}
          <div className="flex flex-col items-center justify-center py-4 space-y-3">
            <button
              onClick={toggleListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all tap-target shadow-lg ${
                isListening 
                  ? 'bg-emergency-600 text-white animate-ping' 
                  : 'bg-teal-700 hover:bg-teal-800 text-white hover:scale-105 shadow-teal-900/20'
              }`}
              aria-label="Toggle voice listening"
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
            <p className="text-xs font-semibold text-slate-700">
              {isListening ? t('listening') : t('speakNow')}
            </p>
          </div>

          {/* Transcript / Output display */}
          {transcript && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-teal-700" />
                <span>Spoken Command:</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 italic">
                "{transcript}"
              </p>
              {recognizedNeed && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {t('voiceRecognized')} <strong className="capitalize">{recognizedNeed.replace('_', ' ')}</strong>
                  </span>
                  <button
                    onClick={handleApplyVoiceNeed}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <span>View Results</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Voice Demo Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Or Tap Common Rural Queries:
            </label>
            <div className="space-y-2">
              {voicePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectQuery(preset.text, preset.need)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 transition-all flex items-center justify-between group tap-target"
                >
                  <span className="text-xs text-slate-800 font-medium group-hover:text-teal-900">
                    "{preset.text}"
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 group-hover:bg-teal-200 text-slate-700 px-2 py-0.5 rounded-full shrink-0 ml-2">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
