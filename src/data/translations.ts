import type { LanguageCode } from '../types';

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Header & Global
    appName: "SwasthyaConnect",
    tagline: "Find the right public healthcare facility for your need — fast, simple, and built for rural access.",
    subTagline: "Right Care → Right Place → Right Time",
    emergencyBtn: "24x7 Emergency",
    offlineNotice: "Offline Mode Active — Viewing cached verified district healthcare records",
    adminLink: "Health Staff Portal",
    
    // Core Navigation & Steps
    step1Need: "1. Select Healthcare Need",
    step2Location: "2. Your Location",
    step3Recommended: "3. Best Suitable Facilities",
    
    // Needs
    needEmergency: "Emergency & Casualty",
    needEmergencyDesc: "Urgent trauma, chest pain, accidents, severe illness, 24x7 critical care",
    needMaternity: "Maternity & Delivery",
    needMaternityDesc: "Normal/C-Section delivery, antenatal checkups, high-risk pregnancy care",
    needChildCare: "Child Care & Immunization",
    needChildCareDesc: "Pediatric care, newborn care, infant illness, vaccinations",
    needGeneral: "General Consultation & Fever",
    needGeneralDesc: "OPD consultation, fever, seasonal infections, non-communicable checks",
    needDiagnostics: "Diagnostics & Laboratory",
    needDiagnosticsDesc: "Blood tests, urine profile, X-ray, basic path lab diagnostics",
    needPharmacy: "Free Medicines & Pharmacy",
    needPharmacyDesc: "Government free dispensary, essential medicines, chronic refills",
    needSpecialist: "Specialist & Surgical Care",
    needSpecialistDesc: "Surgery, Ortho, ENT, Eye, Gynecology, Psychiatric, Nephro",

    // Location Step
    whereAreYou: "Where are you located?",
    locationSubtitle: "Select your state & district to find equipped public facilities nearest to your village.",
    selectState: "Select State",
    selectDistrict: "Select District",
    useGps: "Use Current Location (GPS / Demo)",
    ruralFocusBadge: "Rural & Tribal Health Network",
    detectingLocation: "Detecting location...",
    locationDetected: "Location detected",
    continueToRecommendations: "Find Suitable Facilities",
    
    // Recommendations List
    recommendedForYou: "Recommended Facilities for You",
    resultsFound: "facilities found matching your criteria",
    filterGovernment: "Government First",
    filterAll: "All Facilities",
    scoreLabel: "Accessibility Score",
    travelTime: "Travel Time",
    distance: "Distance",
    viewDetails: "View Details",
    callNow: "Call Hospital",
    getDirections: "Get Directions",
    whyRecommendedTitle: "Why We Recommend This Facility",
    compareBtn: "Compare with Closer Facilities",
    
    // Facility Details
    facilityDetailsTitle: "Facility Profile & Services",
    contactPerson: "In-Charge / Officer",
    phoneNumber: "Contact Number",
    categoryLabel: "Facility Category",
    sectorLabel: "Sector",
    addressLabel: "Complete Address",
    servicesOffered: "Available Services",
    trustBadge: "Verified Public District Record",
    lastUpdated: "Last updated",
    freeGovtCare: "100% Free Consultation & Medicines (Govt Facility)",
    callAheadDisclaimer: "Facility data compiled from public district records — please call ahead to confirm on-duty specialist availability.",
    
    // Recommendation Explanation
    explanationTitle: "Smart Recommendation Breakdown",
    explanationSubtitle: "How SwasthyaConnect picked the best facility for your specific health need:",
    serviceMatchTitle: "Service Match Verification",
    emergencyReadinessTitle: "Emergency & 24x7 Readiness",
    closerFacilityComparisonTitle: "Why Not a Closer Facility?",
    recommendationReasonText: "Although a sub-center or basic PHC may be physically closer, it lacks the specialized maternity/emergency equipment and 24x7 doctor coverage needed for this medical condition.",
    
    // Voice Assistant
    voiceTitle: "Rural Voice Assistant",
    voiceSubtitle: "Speak your medical need in your own language",
    voicePromptMarathi: "“मला जवळचे सरकारी रुग्णालय दाखवा”",
    voicePromptTelugu: "“నాకు దగ్గరలోని ప్రభుత్వ ఆసుపత్రి చూపించండి”",
    voicePromptEnglish: "“Show me nearest maternity government hospital”",
    listening: "Listening...",
    speakNow: "Tap microphone to speak",
    voiceRecognized: "Identified Need:",
    
    // Emergency Mode
    emergencyModeTitle: "EMERGENCY RESPONSE 24x7",
    emergencySubtitle: "Immediate national medical helplines & 24x7 casualty public hospitals.",
    callAmbulance108: "Call 108 Ambulance",
    callHealth104: "Call 104 Health Helpline",
    callMaternal102: "Call 102 Janani Shishu Vehicle",
    callNational112: "Call 112 Unified Emergency",
    nearestEmergencyHospitals: "Nearest Emergency-Ready Public Hospitals in District",
    
    // Admin Screen
    adminTitle: "District Health Administration Portal",
    adminSubtitle: "Verify and update facility operational status, phone numbers, and emergency readiness.",
    editPhone: "Edit Phone Number",
    editContact: "Edit In-Charge Name",
    saveChanges: "Save & Update Timestamp",
    resetDefaults: "Reset to Official Master Seed",
    savedSuccess: "Changes saved! Last updated timestamp refreshed.",
    
    // Future / Pitch Cues
    comingSoon: "Coming Soon",
    teleconsultBadge: "Teleconsultation / eSanjeevani",
    schemeCheckerBadge: "Aarogyasri / PMJAY Scheme Coverage",
    medicineStockBadge: "Live Drug Stock Level",
    
    // General
    back: "Back",
    home: "Home",
    govtBadge: "Government",
    privateBadge: "Private",
    allDistricts: "All Districts",
  },
  
  mr: {
    // Header & Global
    appName: "स्वास्थ्य कनेक्ट",
    tagline: "आपल्या गरजेनुसार योग्य सरकारी आरोग्य केंद्र शोधा — जलद, सोपे आणि ग्रामीण भागासाठी उपयुक्त.",
    subTagline: "योग्य उपचार → योग्य ठिकाणी → योग्य वेळी",
    emergencyBtn: "२४x७ आपत्कालीन मदत",
    offlineNotice: "ऑफलाइन मोड सक्रिय — जतन केलेली सरकारी आरोग्य माहिती दाखवली जात आहे",
    adminLink: "आरोग्य कर्मचारी पोर्टल",
    
    // Core Navigation & Steps
    step1Need: "१. आरोग्य गरज निवडा",
    step2Location: "२. आपले ठिकाण",
    step3Recommended: "३. सर्वात योग्य आरोग्य केंद्रे",
    
    // Needs
    needEmergency: "आपत्कालीन व अपघात उपचार",
    needEmergencyDesc: "तात्काळ अपघात, छातीत दुखणे, गंभीर आजार, २४x७ अतिदक्षता सेवा",
    needMaternity: "प्रसूती व महिला आरोग्य",
    needMaternityDesc: "नैसर्गिक/सिझर प्रसूती, गरोदरपणातील तपासणी, सुरक्षित बाळंतपण",
    needChildCare: "बालरोग व लसीकरण",
    needChildCareDesc: "लहान मुलांचे आजार, नवजात शिशू कक्ष, वेळेवर लसीकरण",
    needGeneral: "सामान्य तपासणी व ताप",
    needGeneralDesc: "ओपीडी तपासणी, ताप, सर्दी-खोकला, प्राथमिक उपचार",
    needDiagnostics: "रक्त तपासणी व प्रयोगशाळा",
    needDiagnosticsDesc: "रक्त व लघवी तपासणी, एक्स-रे, पॅथॉलॉजी लॅब",
    needPharmacy: "मोफत औषधे व फार्मसी",
    needPharmacyDesc: "सरकारी मोफत औषधालय, आवश्यक गोळ्या व सिरप",
    needSpecialist: "विशेषज्ञ व शस्त्रक्रिया",
    needSpecialistDesc: "मोठ्या शस्त्रक्रिया, हाडांचे डॉक्टर, कान-नाक-घसा, नेत्ररोग",

    // Location Step
    whereAreYou: "आपण कोणत्या जिल्ह्यात आहात?",
    locationSubtitle: "आपल्या गावाजवळचे सुसज्ज सरकारी रुग्णालय शोधण्यासाठी जिल्हा निवडा.",
    selectState: "राज्य निवडा",
    selectDistrict: "जिल्हा निवडा",
    useGps: "माझे ठिकाण वापरा (GPS)",
    ruralFocusBadge: "ग्रामीण व आदिवासी आरोग्य नेटवर्क",
    detectingLocation: "ठिकाण शोधत आहे...",
    locationDetected: "ठिकाण निश्चित झाले",
    continueToRecommendations: "योग्य रुग्णालये पहा",
    
    // Recommendations List
    recommendedForYou: "आपल्यासाठी शिफारस केलेली रुग्णालये",
    resultsFound: "योग्य आरोग्य केंद्रे उपलब्ध आहेत",
    filterGovernment: "फक्त सरकारी रुग्णालये",
    filterAll: "सर्व केंद्रे",
    scoreLabel: "उपयुक्तता गुण",
    travelTime: "प्रवास वेळ",
    distance: "अंतर",
    viewDetails: "माहिती पहा",
    callNow: "कॉल करा",
    getDirections: "रस्ता पहा (नकाशा)",
    whyRecommendedTitle: "हे रुग्णालय का निवडावे?",
    compareBtn: "जवळच्या केंद्रांशी तुलना करा",
    
    // Facility Details
    facilityDetailsTitle: "रुग्णालय तपशील व उपलब्ध सेवा",
    contactPerson: "प्रमुख वैद्यकीय अधिकारी",
    phoneNumber: "संपर्क क्रमांक",
    categoryLabel: "रुग्णालय प्रकार",
    sectorLabel: "क्षेत्र",
    addressLabel: "संपूर्ण पत्ता",
    servicesOffered: "उपलब्ध आरोग्य सेवा",
    trustBadge: "प्रमाणित सरकारी नोंद",
    lastUpdated: "शेवटचे अपडेट",
    freeGovtCare: "१००% मोफत तपासणी व औषधोपचार (सरकारी रुग्णालय)",
    callAheadDisclaimer: "माहिती सार्वजनिक जिल्हा नोंदींनुसार आहे — निघण्यापूर्वी संपर्क करून खात्री करा.",
    
    // Recommendation Explanation
    explanationTitle: "स्मार्ट शिफारस विश्लेषण",
    explanationSubtitle: "स्वास्थ कनेक्टने आपल्या गरजेनुसार हे रुग्णालय का निवडले:",
    serviceMatchTitle: "आवश्यक सेवेची उपलब्धता",
    emergencyReadinessTitle: "२४x७ आपत्कालीन सज्जता",
    closerFacilityComparisonTitle: "जवळचे उपकेंद्र का नाही?",
    recommendationReasonText: "जरी जवळचे प्राथमिक उपकेंद्र अंतरदृष्ट्या जवळ असले, तरी तिथे आवश्यक प्रसूती/आपत्कालीन सुविधा व २४x७ डॉक्टर्स उपलब्ध नाहीत. त्यामुळे योग्य उपचारासाठी हे केंद्र सर्वोत्तम आहे.",
    
    // Voice Assistant
    voiceTitle: "ग्रामीण व्हॉइस असिस्टंट",
    voiceSubtitle: "आपल्या भाषेत बोला आणि योग्य रुग्णालय शोधा",
    voicePromptMarathi: "“मला जवळचे सरकारी रुग्णालय दाखवा”",
    voicePromptTelugu: "“నాకు దగ్గరలోని ప్రభుత్వ ఆసుపత్రి చూపించండి”",
    voicePromptEnglish: "“Show nearest government hospital”",
    listening: "ऐकत आहे...",
    speakNow: "माइकवर टॅप करून बोला",
    voiceRecognized: "ओळखलेली गरज:",
    
    // Emergency Mode
    emergencyModeTitle: "२४x७ आपत्कालीन कक्ष",
    emergencySubtitle: "तात्काळ रुग्णवाहिका व राष्ट्रीय आपत्कालीन संपर्क क्रमांक.",
    callAmbulance108: "१०८ रुग्णवाहिका बोलवा",
    callHealth104: "१०४ आरोग्य सल्ला हेल्पलाइन",
    callMaternal102: "१०२ जननी शिशु वाहन",
    callNational112: "११२ राष्ट्रीय आपत्कालीन सेवा",
    nearestEmergencyHospitals: "जिल्ह्यातील २४x७ आपत्कालीन सरकारी रुग्णालये",
    
    // Admin Screen
    adminTitle: "जिल्हा आरोग्य प्रशासन पोर्टल",
    adminSubtitle: "रुग्णालयाचे संपर्क क्रमांक व उपलब्ध सेवांची नोंद अद्ययावत करा.",
    editPhone: "फोन नंबर बदला",
    editContact: "अधिकारी नाव बदला",
    saveChanges: "जतन करा व वेळ अद्ययावत करा",
    resetDefaults: "मूळ सरकारी डेटा पुनर्संचयित करा",
    savedSuccess: "बदल जतन झाले! अद्ययावत तारीख नोंदवली गेली.",
    
    // Future / Pitch Cues
    comingSoon: "लवकरच येत आहे",
    teleconsultBadge: "टेलिकन्सल्टेशन / ई-संजीवनी",
    schemeCheckerBadge: "महात्मा फुले जन आरोग्य योजना / PMJAY माहिती",
    medicineStockBadge: "थेट औषध साठा तपासणी",
    
    // General
    back: "मागे",
    home: "मुख्य पृष्ठ",
    govtBadge: "सरकारी",
    privateBadge: "खाजगी",
    allDistricts: "सर्व जिल्हे",
  },

  te: {
    // Header & Global
    appName: "స్వస్థ్య కనెక్ట్",
    tagline: "మీ ఆరోగ్య అవసరానికి తగిన సరైన ప్రభుత్వ ఆసుపత్రిని సులభంగా కనుగొనండి.",
    subTagline: "సరైన వైద్యం → సరైన చోట → సరైన సమయంలో",
    emergencyBtn: "24x7 అత్యవసర సేవ",
    offlineNotice: "ఆఫ్‌లైన్ మోడ్ యాక్టివ్ — ప్రభుత్వ ఆసుపత్రుల వివరాలు అందుబాటులో ఉన్నాయి",
    adminLink: "ఆరోగ్య సిబ్బంది పోర్టల్",
    
    // Core Navigation & Steps
    step1Need: "1. ఆరోగ్య అవసరాన్ని ఎంచుకోండి",
    step2Location: "2. మీ ప్రాంతం",
    step3Recommended: "3. సరిపోయే ప్రభుత్వ ఆసుపత్రులు",
    
    // Needs
    needEmergency: "అత్యవసర & ప్రమాద చికిత్స",
    needEmergencyDesc: "గుండె నొప్పి, తీవ్ర గాయాలు, అత్యవసర చికిత్స, 24x7 కేర్",
    needMaternity: "ప్రసవ & గర్భిణీ సంరక్షణ",
    needMaternityDesc: "సాధారణ/సిజేరియన్ డెలివరీలు, గర్భధారణ పరీక్షలు",
    needChildCare: "శిశు & చిన్నపిల్లల సంరక్షణ",
    needChildCareDesc: "పిల్లల వైద్యం, నవజాత శిశు సంరక్షణ, టీకాలు",
    needGeneral: "సాధారణ జ్వరం & ఓపీడీ",
    needGeneralDesc: "ఓపీడీ వైద్య పరీక్షలు, జ్వరం, ప్రాథమిక చికిత్స",
    needDiagnostics: "ల్యాబ్ & రక్త పరీక్షలు",
    needDiagnosticsDesc: "రక్త, మూత్ర పరీక్షలు, ఎక్స్-రే, రోగ నిర్ధారణ",
    needPharmacy: "ఉచిత మందులు & ఫార్మసీ",
    needPharmacyDesc: "ప్రభుత్వ ఉచిత మందుల పంపిణీ కేంద్రం",
    needSpecialist: "స్పెషలిస్ట్ & శస్త్రచికిత్స",
    needSpecialistDesc: "ఎముకల వైద్యం, సర్జరీ, కంటి వైద్యం, ఈఎన్‌టీ",

    // Location Step
    whereAreYou: "మీరు ఏ జిల్లాలో ఉన్నారు?",
    locationSubtitle: "మీ గ్రామానికి దగ్గరలోని సరైన ప్రభుత్వ ఆసుపత్రిని కనుగొనడానికి జిల్లాను ఎంచుకోండి.",
    selectState: "రాష్ట్రం ఎంచుకోండి",
    selectDistrict: "జిల్లా ఎంచుకోండి",
    useGps: "నా లొకేషన్ ఉపయోగించు (GPS)",
    ruralFocusBadge: "గ్రామీణ & గిరిజన ఆరోగ్య సేవలు",
    detectingLocation: "స్థానాన్ని గుర్తిస్తోంది...",
    locationDetected: "లొకేషన్ గుర్తించబడింది",
    continueToRecommendations: "ఆసుపత్రులను చూడండి",
    
    // Recommendations List
    recommendedForYou: "మీ కోసం సిఫార్సు చేయబడిన ఆసుపత్రులు",
    resultsFound: "సరైన ఆరోగ్య కేంద్రాలు అందుబాటులో ఉన్నాయి",
    filterGovernment: "ప్రభుత్వ ఆసుపత్రులు మాత్రమే",
    filterAll: "అన్ని కేంద్రాలు",
    scoreLabel: "అనుకూలత స్కోర్",
    travelTime: "ప్రయాణ సమయం",
    distance: "దూరం",
    viewDetails: "వివరాలు చూడండి",
    callNow: "ఫోన్ చేయండి",
    getDirections: "దారి చూడండి (మ్యాప్)",
    whyRecommendedTitle: "ఈ ఆసుపత్రిని ఎందుకు ఎంచుకోవాలి?",
    compareBtn: "దగ్గరి కేంద్రాలతో పోల్చండి",
    
    // Facility Details
    facilityDetailsTitle: "ఆసుపత్రి పూర్తి వివరాలు",
    contactPerson: "వైద్యాధికారి / సూపరింటెండెంట్",
    phoneNumber: "ఫోన్ నంబర్",
    categoryLabel: "ఆసుపత్రి రకం",
    sectorLabel: "రంగం",
    addressLabel: "పూర్తి చిరునామా",
    servicesOffered: "అందుబాటులో ఉన్న సేవలు",
    trustBadge: "ధృవీకరించబడిన ప్రభుత్వ రికార్డు",
    lastUpdated: "చివరిగా అప్‌డేట్ చేసిన తేదీ",
    freeGovtCare: "100% ఉచిత వైద్య పరీక్షలు & మందులు (ప్రభుత్వ ఆసుపత్రి)",
    callAheadDisclaimer: "ప్రభుత్వ రికార్డుల నుండి సేకరించిన వివరాలు — వెళ్లేముందు ఫోన్ చేసి నిర్ధారించుకోండి.",
    
    // Recommendation Explanation
    explanationTitle: "సిఫార్సు విశ్లేషణ",
    explanationSubtitle: "మీ అవసరానికి ఈ ఆసుపత్రి ఎందుకు సరైనదంటే:",
    serviceMatchTitle: "అవసరమైన చికిత్స లభ్యత",
    emergencyReadinessTitle: "24x7 అత్యవసర సన్నద్ధత",
    closerFacilityComparisonTitle: "దగ్గరలోని ప్రాథమిక కేంద్రాన్ని ఎందుకు సూచించలేదు?",
    recommendationReasonText: "దగ్గరలోని ఉప-కేంద్రం దగ్గరగా ఉన్నప్పటికీ, అక్కడ ప్రసవానికి/అత్యవసర చికిత్సకు అవసరమైన పూర్తి పరికరాలు మరియు 24x7 వైద్యులు అందుబాటులో ఉండరు. కాబట్టి ఈ ఆసుపత్రి మీకు అత్యుత్తమమైనది.",
    
    // Voice Assistant
    voiceTitle: "గ్రామీణ వాయిస్ అసిస్టెంట్",
    voiceSubtitle: "మీ స్వంత భాషలో మాట్లాడి సరైన ఆసుపత్రిని తెలుసుకోండి",
    voicePromptMarathi: "“मला जवळचे सरकारी रुग्णालय दाखवा”",
    voicePromptTelugu: "“నాకు దగ్గరలోని ప్రభుత్వ ఆసుపత్రి చూపించండి”",
    voicePromptEnglish: "“Show nearest government hospital”",
    listening: "వింటోంది...",
    speakNow: "మైక్ నొక్కి మాట్లాడండి",
    voiceRecognized: "గుర్తించిన అవసరం:",
    
    // Emergency Mode
    emergencyModeTitle: "24x7 అత్యవసర సహాయం",
    emergencySubtitle: "తక్షణ అంబులెన్స్ & అత్యవసర ప్రభుత్వ హెల్ప్‌లైన్ నంబర్లు.",
    callAmbulance108: "108 అంబులెన్స్ కాల్ చేయండి",
    callHealth104: "104 ఆరోగ్య సమాచార హెల్ప్‌లైన్",
    callMaternal102: "102 తల్లి-పిల్లల వాహనం",
    callNational112: "112 జాతీయ అత్యవసర సహాయం",
    nearestEmergencyHospitals: "జిల్లాలోని 24x7 అత్యవసర ప్రభుత్వ ఆసుపత్రులు",
    
    // Admin Screen
    adminTitle: "జిల్లా ఆరోగ్య పరిపాలన పోర్టల్",
    adminSubtitle: "ఆసుపత్రి ఫోన్ నంబర్లు మరియు వివరాలను అప్‌డేట్ చేయండి.",
    editPhone: "ఫోన్ నంబర్ మార్చండి",
    editContact: "అధికారి పేరు మార్చండి",
    saveChanges: "సేవ్ చేయండి & సమయం అప్‌డేట్ చేయండి",
    resetDefaults: "ప్రభుత్వ డేటాను రీసెట్ చేయండి",
    savedSuccess: "వివరాలు సేవ్ చేయబడ్డాయి! అప్‌డేట్ సమయం మారింది.",
    
    // Future / Pitch Cues
    comingSoon: "త్వరలో అందుబాటులోకి వస్తుంది",
    teleconsultBadge: "టెలిమెడిసిన్ / ఈ-సంజీవని",
    schemeCheckerBadge: "ఆరోగ్యశ్రీ / PMJAY పథకం వివరాలు",
    medicineStockBadge: "మందుల నిల్వ లైవ్ వివరాలు",
    
    // General
    back: "వెనుకకు",
    home: "హోమ్",
    govtBadge: "ప్రభుత్వ",
    privateBadge: "ప్రైవేట్",
    allDistricts: "అన్ని జిల్లాలు",
  }
};

export const HELPLINES: { number: string; titleKey: string; descKey: string; icon: string; category: 'ambulance' | 'maternal' | 'health_info' | 'general_emergency' }[] = [
  {
    number: "108",
    titleKey: "callAmbulance108",
    descKey: "Free 24x7 Emergency Medical Transport & Critical Ambulance across Maharashtra & AP",
    icon: "Ambulance",
    category: "ambulance"
  },
  {
    number: "104",
    titleKey: "callHealth104",
    descKey: "24x7 Free Doctor Advice, Symptom Guidance & Health Grievances",
    icon: "PhoneCall",
    category: "health_info"
  },
  {
    number: "102",
    titleKey: "callMaternal102",
    descKey: "Janani Shishu Suraksha Vehicle for Pregnant Mothers & Newborns",
    icon: "Baby",
    category: "maternal"
  },
  {
    number: "112",
    titleKey: "callNational112",
    descKey: "Unified National Emergency Response System (Police, Fire & Disaster)",
    icon: "ShieldAlert",
    category: "general_emergency"
  }
];
