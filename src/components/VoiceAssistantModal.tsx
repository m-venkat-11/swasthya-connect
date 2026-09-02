import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { voiceAssistantService } from '../services/voiceAssistantService';
import type { VoiceParseResult, LanguageCode } from '../types';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  X, 
  PhoneCall, 
  ArrowRight,
  Send
} from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage } = useApp();
  const navigate = useNavigate();

  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [typedInput, setTypedInput] = useState<string>('');
  const [parseResult, setParseResult] = useState<VoiceParseResult | null>(null);
  const [activeLang, setActiveLang] = useState<LanguageCode>(language);
  const [isSpeechAvailable, setIsSpeechAvailable] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setIsSpeechAvailable(voiceAssistantService.isSpeechSupported());
  }, []);

  useEffect(() => {
    setActiveLang(language);
  }, [language]);

  if (!isOpen) return null;

  const handleProcessInput = (input: string) => {
    if (!input.trim()) return;

    setTranscript(input);
    const result = voiceAssistantService.parseHealthcareInput(input, activeLang);
    setParseResult(result);

    // Audio Feedback
    voiceAssistantService.speak(result.voiceResponse, activeLang);
  };

  const startListening = () => {
    if (!isSpeechAvailable) return;

    setTranscript('');
    setParseResult(null);

    try {
      const rec = voiceAssistantService.createRecognition(
        activeLang,
        (recognizedText) => {
          setIsListening(false);
          handleProcessInput(recognizedText);
        },
        (error) => {
          setIsListening(false);
          console.log("Voice Recognition Error:", error);
        }
      );

      if (rec) {
        recognitionRef.current = rec;
        rec.start();
        setIsListening(true);
      }
    } catch (e) {
      console.warn("Could not start microphone:", e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log(e);
      }
    }
    setIsListening(false);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    handleProcessInput(typedInput);
    setTypedInput('');
  };

  const handleExecuteAction = () => {
    if (!parseResult) return;

    onClose();
    if (parseResult.targetRoute) {
      navigate(parseResult.targetRoute);
    }
  };

  const quickPresets = [
    {
      label: activeLang === 'te' ? "నాకు జ్వరం & దగ్గు ఉంది" : activeLang === 'mr' ? "मला ताप व खोकला आहे" : "I have fever & cough",
      text: activeLang === 'te' ? "నాకు మూడు రోజులుగా జ్వరం మరియు దగ్గు ఉంది" : activeLang === 'mr' ? "मला दोन दिवसांपासून ताप व खोकला आहे" : "I have fever and cough for three days"
    },
    {
      label: activeLang === 'te' ? "ప్రభుత్వ ఆసుపత్రి చూపించండి" : activeLang === 'mr' ? "जवळचे सरकारी दवाखाना" : "Find government hospital",
      text: activeLang === 'te' ? "నాకు దగ్గరలోని ప్రభుత్వ ఆసుపత్రి కావాలి" : activeLang === 'mr' ? "मला जवळचे सरकारी रुग्णालय दाखवा" : "Show me nearby government health facilities"
    },
    {
      label: activeLang === 'te' ? "ఊపిరి తీసుకోవడం కష్టంగా ఉంది" : activeLang === 'mr' ? "श्वास घेण्यास त्रास" : "Severe breathing difficulty",
      text: activeLang === 'te' ? "నాకు ఊపిరి తీసుకోవడం చాలా కష్టంగా ఉంది" : activeLang === 'mr' ? "मला श्वास घेण्यास खूप त्रास होत आहे" : "I am having severe difficulty breathing"
    },
    {
      label: activeLang === 'te' ? "గర్భిణీ ప్రసవ సంరక్షణ" : activeLang === 'mr' ? "प्रसूती तपासणी" : "Maternal checkup",
      text: activeLang === 'te' ? "గర్భిణీలకు దగ్గరలోని ప్రసవ ఆసుపత్రి చూపించండి" : activeLang === 'mr' ? "महिला व प्रसूती रुग्णालय कुठे आहे" : "Nearest maternal and delivery government hospital"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 relative overflow-hidden">
        
        {/* Top Bar with Language Selector & Close */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-700 to-emerald-900 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <h3 className="font-black text-xs sm:text-sm text-slate-900 uppercase tracking-wider">
                Voice Healthcare Guide
              </h3>
              <span className="text-[10px] text-teal-700 font-bold block">
                Speech to Guided Public Healthcare
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-black">
              {(['te', 'en', 'mr'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setActiveLang(l);
                    setLanguage(l);
                  }}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    activeLang === l ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {l === 'te' ? 'తెలుగు' : l === 'mr' ? 'मराठी' : 'EN'}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Microphone Pulse & Status */}
        <div className="text-center py-2 space-y-3">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-xl transition-all tap-target relative ${
              isListening
                ? 'bg-rose-600 text-white scale-110 shadow-rose-600/40 ring-4 ring-rose-300 animate-pulse'
                : 'bg-gradient-to-br from-teal-600 to-emerald-800 text-white hover:scale-105 shadow-teal-700/30 ring-4 ring-teal-100'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              {isListening 
                ? activeLang === 'te' ? "వింటోంది... ఇప్పుడు మాట్లాడండి" : "Listening... Speak clearly" 
                : activeLang === 'te' ? "మాట్లాడటానికి మైక్ నొక్కండి" : "Tap microphone to speak"}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Explain what you feel, ask for hospitals, or describe your medical symptoms.
            </p>
          </div>
        </div>

        {/* Live Transcript Display */}
        {transcript && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 font-medium">
            <span className="text-[10px] font-bold text-slate-500 block uppercase mb-1">
              What you said:
            </span>
            "{transcript}"
          </div>
        )}

        {/* PARSED INTENT RESULT & ACTION DISPATCH */}
        {parseResult && (
          <div className={`p-4 rounded-2xl border-2 space-y-3 animate-in fade-in ${
            parseResult.isEmergency 
              ? 'bg-rose-50 border-rose-500' 
              : 'bg-teal-50 border-teal-600'
          }`}>
            
            {/* Header with intent badge */}
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                parseResult.isEmergency ? 'bg-rose-200 text-rose-900' : 'bg-teal-200 text-teal-900'
              }`}>
                {parseResult.isEmergency ? '🚨 Critical Emergency Detected' : `Action: ${parseResult.intent.replace('_', ' ')}`}
              </span>

              <button
                onClick={() => voiceAssistantService.speak(parseResult.voiceResponse, activeLang)}
                className="text-slate-600 hover:text-slate-900 p-1 rounded"
                title="Replay Voice Response"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Assistant Voice Response Text */}
            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
              {parseResult.voiceResponse}
            </p>

            {/* Emergency 108 Action Buttons */}
            {parseResult.isEmergency ? (
              <div className="flex items-center gap-2 pt-1">
                <a
                  href="tel:108"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 uppercase"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call 108 Ambulance</span>
                </a>

                <button
                  onClick={handleExecuteAction}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 uppercase"
                >
                  <span>24x7 Casualty Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleExecuteAction}
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all tap-target uppercase tracking-wider"
              >
                <span>Continue to Guided Healthcare</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

          </div>
        )}

        {/* Text Fallback Input (Type Instead) */}
        <form onSubmit={handleTextSubmit} className="pt-2 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            placeholder={activeLang === 'te' ? "లేదా ఇక్కడ టైప్ చేయండి..." : "Or type what you need here..."}
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50 font-medium"
          />
          <button
            type="submit"
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors tap-target"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Sample Spoken Prompts */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Try saying (or tap to test):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickPresets.map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleProcessInput(preset.text)}
                className="text-[11px] font-bold bg-slate-100 hover:bg-teal-50 hover:text-teal-900 border border-slate-200/80 px-2.5 py-1 rounded-lg text-slate-700 transition-colors text-left"
              >
                "{preset.label}"
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
