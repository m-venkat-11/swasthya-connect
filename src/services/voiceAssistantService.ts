import type { VoiceParseResult, LanguageCode } from '../types';

// Speech Recognition Type Shim
interface IWindowSpeechRecognition extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export const voiceAssistantService = {
  // Check if browser supports speech recognition
  isSpeechSupported(): boolean {
    const win = window as IWindowSpeechRecognition;
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  },

  // Create Speech Recognition instance
  createRecognition(language: LanguageCode, onResult: (transcript: string) => void, onError: (err: string) => void) {
    const win = window as IWindowSpeechRecognition;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    // Map language code
    const langMap: Record<LanguageCode, string> = {
      te: 'te-IN',
      mr: 'mr-IN',
      en: 'en-IN'
    };
    recognition.lang = langMap[language] || 'en-IN';

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      onError(event.error || 'Speech recognition error');
    };

    return recognition;
  },

  // Speak response back to user
  speak(text: string, language: LanguageCode) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap: Record<LanguageCode, string> = {
        te: 'te-IN',
        mr: 'mr-IN',
        en: 'en-IN'
      };
      utterance.lang = langMap[language] || 'en-IN';
      utterance.rate = 0.92; // slightly slower for rural comprehension
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis unavailable:", e);
    }
  },

  // Natural Language Intent & Clinical Symptom Parser
  parseHealthcareInput(transcript: string, currentLang: LanguageCode): VoiceParseResult {
    const text = transcript.toLowerCase().trim();
    const extractedSymptoms: string[] = [];

    // 1. Critical Red-Flag Emergency Keywords (Telugu, Hindi, Marathi, English)
    const emergencyKeywords = [
      // Telugu
      'ఊపిరి', 'శ్వాస', 'గుండె నొప్పి', 'తీవ్ర రక్తం', 'స్పృహ', 'ప్రాణాపాయం', 'అత్యవసరం', 'యాక్సిడెంట్',
      // Marathi
      'श्वास', 'छातीत दुखणे', 'रक्तस्त्राव', 'बेहोश', 'तातडीने', 'हार्ट अटॅक',
      // Hindi
      'सांस लेने में तकलीफ', 'सीने में दर्द', 'खून बह रहा', 'बेहोश', 'आपातकालीन',
      // English
      'difficulty breathing', 'cannot breathe', 'breathless', 'chest pain', 'severe bleeding',
      'unconscious', 'heart attack', 'emergency', 'stroke', 'heavy bleeding', 'severe trauma'
    ];

    const isEmergency = emergencyKeywords.some(keyword => text.includes(keyword));
    if (isEmergency) {
      let voiceResponse = "These symptoms may need urgent medical attention. Directing you to 24x7 emergency response with direct 108 ambulance dispatch.";
      if (currentLang === 'te') {
        voiceResponse = "ఈ లక్షణాలకు తక్షణ అత్యవసర వైద్య సహాయం అవసరం కావచ్చు. 24x7 అత్యవసర సహాయం మరియు 108 అంబులెన్స్ సేవకు మళ్లిస్తున్నాము.";
      } else if (currentLang === 'mr') {
        voiceResponse = "या लक्षणांसाठी तातडीने आपत्कालीन उपचारांची आवश्यकता असू शकते. २४x७ इमर्जन्सी व १०८ रुग्णवाहिका सेवेकडे घेऊन जात आहोत.";
      }

      return {
        intent: 'EMERGENCY_DISPATCH',
        languageDetected: currentLang,
        rawTranscript: transcript,
        extractedSymptoms: ['Severe Respiratory/Cardiac Distress'],
        targetRoute: '/emergency',
        voiceResponse,
        isEmergency: true
      };
    }

    // 2. Symptom Extraction for "I Don't Feel Well" / Screening
    if (text.includes('జ్వరం') || text.includes('fever') || text.includes('ताप') || text.includes('बुखार') || text.includes('temperature')) {
      extractedSymptoms.push('Fever');
    }
    if (text.includes('దగ్గు') || text.includes('cough') || text.includes('खोकला') || text.includes('खांसी')) {
      extractedSymptoms.push('Cough');
    }
    if (text.includes('వాంతులు') || text.includes('vomit') || text.includes('उलट्या') || text.includes('उल्टी') || text.includes('nausea')) {
      extractedSymptoms.push('Vomiting / Nausea');
    }
    if (text.includes('నొప్పి') || text.includes('pain') || text.includes('दुखणे') || text.includes('दर्द') || text.includes('headache') || text.includes('stomach')) {
      extractedSymptoms.push('Severe Body / Abdominal Pain');
    }
    if (text.includes('గర్భిణీ') || text.includes('ప్రసవ') || text.includes('pregnant') || text.includes('maternal') || text.includes('delivery')) {
      extractedSymptoms.push('Maternal / Pregnancy Care');
    }

    // 3. Match Intent Categories
    // A. Symptoms / Not Feeling Well
    if (
      extractedSymptoms.length > 0 ||
      text.includes('బాగులేదు') ||
      text.includes('sick') ||
      text.includes('ill') ||
      text.includes('not feeling well') ||
      text.includes('బాగాలేదు') ||
      text.includes('तपासणी') ||
      text.includes('లక్షణాలు')
    ) {
      const symList = extractedSymptoms.length > 0 ? extractedSymptoms.join(', ') : 'your symptoms';
      let response = `Understood. Opening clinical symptom screening to find the right public healthcare level for ${symList}.`;
      if (currentLang === 'te') {
        response = `అర్థమైంది. మీ ఆరోగ్య లక్షణాలను పరీక్షించి, సరైన ప్రభుత్వ ప్రాథమిక లేదా జిల్లా ఆసుపత్రిని సిఫార్సు చేస్తున్నాము.`;
      } else if (currentLang === 'mr') {
        response = `समजले. आपल्या लक्षणांनुसार योग्य सरकारी आरोग्य केंद्र तपासण्यासाठी स्क्रिनिंग सुरू करत आहोत.`;
      }

      return {
        intent: 'SCREEN_SYMPTOMS',
        languageDetected: currentLang,
        rawTranscript: transcript,
        extractedSymptoms,
        targetRoute: `/screening?symptoms=${encodeURIComponent(extractedSymptoms.join(','))}`,
        voiceResponse: response,
        isEmergency: false
      };
    }

    // B. Hospital / Facility Search
    if (
      text.includes('ఆసుపత్రి') ||
      text.includes('hospital') ||
      text.includes('phc') ||
      text.includes('chc') ||
      text.includes('రుగ్ణాలయ') ||
      text.includes('दवाखाना') ||
      text.includes('clinic') ||
      text.includes('find') ||
      text.includes('చూపించు')
    ) {
      let response = "Showing verified government hospitals and primary health centres nearby.";
      if (currentLang === 'te') {
        response = "మీ ప్రాంతంలోని సమీప ప్రభుత్వ ప్రాథమిక మరియు కమ్యూనిటీ ఆరోగ్య కేంద్రాలను చూపిస్తున్నాము.";
      } else if (currentLang === 'mr') {
        response = "आपल्या भागातील जवळचे सरकारी दवाखाने व प्राथमिक आरोग्य केंद्र दाखवत आहोत.";
      }

      return {
        intent: 'FIND_FACILITY',
        languageDetected: currentLang,
        rawTranscript: transcript,
        extractedSymptoms: [],
        targetRoute: '/results',
        voiceResponse: response,
        isEmergency: false
      };
    }

    // C. Appointment Booking
    if (
      text.includes('అపాయింట్మెంట్') ||
      text.includes('appointment') ||
      text.includes('booking') ||
      text.includes('doctor visit') ||
      text.includes('కలవాలి') ||
      text.includes('भेट')
    ) {
      let response = "Opening appointment scheduler. You can choose your health centre and date.";
      if (currentLang === 'te') {
        response = "డాక్టర్ అపాయింట్మెంట్ విభాగాన్ని తెరుస్తున్నాము. ఆసుపత్రి మరియు సమయాన్ని ఎంచుకోండి.";
      } else if (currentLang === 'mr') {
        response = "डॉक्टर भेटीची वेळ नोंदवण्यासाठी अपॉइंटमेंट विभाग सुरू करत आहोत.";
      }

      return {
        intent: 'BOOK_APPOINTMENT',
        languageDetected: currentLang,
        rawTranscript: transcript,
        extractedSymptoms: [],
        targetRoute: '/profile',
        voiceResponse: response,
        isEmergency: false
      };
    }

    // D. Referral / Follow-up Tracking
    if (
      text.includes('రిఫరల్') ||
      text.includes('referral') ||
      text.includes('follow') ||
      text.includes('checkup record') ||
      text.includes('pass') ||
      text.includes('కార్డు')
    ) {
      let response = "Opening your personal digital Aarogya Pass and referral tracker.";
      if (currentLang === 'te') {
        response = "మీ డిజిటల్ ఆరోగ్య పాస్ మరియు హాస్పిటల్ రిఫరల్ వివరాలను చూపిస్తున్నాము.";
      }

      return {
        intent: 'VIEW_REFERRAL',
        languageDetected: currentLang,
        rawTranscript: transcript,
        extractedSymptoms: [],
        targetRoute: '/profile',
        voiceResponse: response,
        isEmergency: false
      };
    }

    // Default Fallback
    return {
      intent: 'GENERAL_INFO',
      languageDetected: currentLang,
      rawTranscript: transcript,
      extractedSymptoms: [],
      voiceResponse: currentLang === 'te' 
        ? "మీరు అడిగింది విన్నాము. మీకు వైద్య సహాయం కోసం మా ఆసుపత్రి శోధన లేదా లక్షణాల పరీక్షను ఎంచుకోవచ్చు."
        : "I heard your request. You can choose hospital search or symptom screening to get guided public care.",
      isEmergency: false
    };
  }
};
