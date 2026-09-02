import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { 
  UserMedicalProfile, 
  PrescriptionItem, 
  MedicalAppointment, 
  VaccinationRecord, 
  LabReportItem 
} from '../types';
import { 
  Heart, 
  PhoneCall, 
  Droplet, 
  Save, 
  Edit3, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft, 
  FileBadge, 
  Download, 
  User, 
  Activity, 
  Pill, 
  Calendar, 
  Syringe, 
  FileText, 
  Plus, 
  Trash2, 
  Clock, 
  Building2 
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];
const COMMON_CONDITIONS = [
  'Pregnancy',
  'Diabetes',
  'Hypertension (High BP)',
  'Cardiac / Heart Disease',
  'Asthma / Respiratory',
  'Severe Allergies',
  'None / Healthy'
];

type ActiveProfileTab = 'pass' | 'prescriptions' | 'appointments' | 'vaccines' | 'labs';

export const MedicalCardPage: React.FC = () => {
  const { userProfile, saveUserProfile, t } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ActiveProfileTab>('pass');
  const [isEditingVitals, setIsEditingVitals] = useState<boolean>(!userProfile);

  // Form Vitals State (starts blank unless saved by user)
  const [name, setName] = useState(userProfile?.name || '');
  const [age, setAge] = useState(userProfile?.age || '');
  const [gender, setGender] = useState(userProfile?.gender || 'Female');
  const [bloodGroup, setBloodGroup] = useState(userProfile?.bloodGroup || 'O+');
  const [emergencyKinName, setEmergencyKinName] = useState(userProfile?.emergencyKinName || userProfile?.emergencyContactName || '');
  const [emergencyKinPhone, setEmergencyKinPhone] = useState(userProfile?.emergencyKinPhone || userProfile?.emergencyContactPhone || '');
  const [conditions, setConditions] = useState<string[]>(userProfile?.conditions || []);
  const [pregnancyTrimester, setPregnancyTrimester] = useState(userProfile?.pregnancyTrimester || '');
  const [allergies, setAllergies] = useState(userProfile?.allergies || '');
  const [schemeCardNumber, setSchemeCardNumber] = useState(userProfile?.schemeCardNumber || '');
  
  // Dynamic Lists State
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>(userProfile?.prescriptions || []);
  const [appointments, setAppointments] = useState<MedicalAppointment[]>(userProfile?.appointments || []);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>(userProfile?.vaccinations || []);
  const [labReports, setLabReports] = useState<LabReportItem[]>(userProfile?.labReports || []);

  // Modal / Inline Add Form States
  const [showAddRx, setShowAddRx] = useState(false);
  const [newRxName, setNewRxName] = useState('');
  const [newRxDosage, setNewRxDosage] = useState('');
  const [newRxFreq, setNewRxFreq] = useState('');
  const [newRxDoctor, setNewRxDoctor] = useState('');

  const [showAddApt, setShowAddApt] = useState(false);
  const [newAptTitle, setNewAptTitle] = useState('');
  const [newAptFacility, setNewAptFacility] = useState('');
  const [newAptDate, setNewAptDate] = useState('');
  const [newAptTime, setNewAptTime] = useState('');

  const [showAddLab, setShowAddLab] = useState(false);
  const [newLabName, setNewLabName] = useState('');
  const [newLabValue, setNewLabValue] = useState('');
  const [newLabRange, setNewLabRange] = useState('');

  const [showAddVac, setShowAddVac] = useState(false);
  const [newVacName, setNewVacName] = useState('');
  const [newVacDate, setNewVacDate] = useState('');
  const [newVacCenter, setNewVacCenter] = useState('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const notifySuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleAddVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVacName.trim()) return;

    const newItem: VaccinationRecord = {
      id: `vac-${Date.now()}`,
      vaccineName: newVacName.trim(),
      dateGiven: newVacDate || new Date().toISOString().split('T')[0],
      centerName: newVacCenter.trim() || 'Primary Health Centre (PHC)'
    };

    const updated = [newItem, ...vaccinations];
    setVaccinations(updated);
    if (userProfile) {
      saveUserProfile({ ...userProfile, vaccinations: updated });
    }
    setNewVacName('');
    setNewVacDate('');
    setNewVacCenter('');
    setShowAddVac(false);
    notifySuccess("Vaccination record added!");
  };

  const handleDeleteVaccine = (id: string) => {
    const updated = vaccinations.filter(v => v.id !== id);
    setVaccinations(updated);
    if (userProfile) {
      saveUserProfile({ ...userProfile, vaccinations: updated });
    }
  };

  const toggleCondition = (cond: string) => {
    if (cond === 'None / Healthy') {
      setConditions(['None / Healthy']);
      return;
    }
    const filtered = conditions.filter(c => c !== 'None / Healthy');
    if (filtered.includes(cond)) {
      setConditions(filtered.filter(c => c !== cond));
    } else {
      setConditions([...filtered, cond]);
    }
  };

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserMedicalProfile = {
      name: name.trim(),
      age: age.trim(),
      gender,
      bloodGroup,
      emergencyContactName: emergencyKinName.trim(),
      emergencyContactPhone: emergencyKinPhone.trim(),
      emergencyKinName: emergencyKinName.trim(),
      emergencyKinPhone: emergencyKinPhone.trim(),
      conditions,
      pregnancyTrimester: conditions.includes('Pregnancy') ? pregnancyTrimester : undefined,
      allergies: allergies.trim(),
      schemeCardNumber: schemeCardNumber.trim(),
      prescriptions,
      appointments,
      vaccinations,
      labReports,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    saveUserProfile(updated);
    setIsEditingVitals(false);
    notifySuccess("Personal vitals and medical card updated successfully!");
  };

  // Add Prescription Handler
  const handleAddPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRxName.trim()) return;

    const newItem: PrescriptionItem = {
      id: `rx-${Date.now()}`,
      medicineName: newRxName.trim(),
      dosage: newRxDosage.trim() || '1 tablet',
      frequency: newRxFreq.trim() || 'Once daily after food',
      prescribedBy: newRxDoctor.trim() || 'Government Medical Officer',
      startDate: new Date().toISOString().split('T')[0],
      durationDays: '30 Days',
      isActive: true
    };

    const updatedList = [newItem, ...prescriptions];
    setPrescriptions(updatedList);
    if (userProfile) {
      saveUserProfile({ ...userProfile, prescriptions: updatedList });
    }
    setNewRxName('');
    setNewRxDosage('');
    setNewRxFreq('');
    setNewRxDoctor('');
    setShowAddRx(false);
    notifySuccess("New prescription medicine added!");
  };

  const handleDeletePrescription = (id: string) => {
    const updated = prescriptions.filter(p => p.id !== id);
    setPrescriptions(updated);
    if (userProfile) {
      saveUserProfile({ ...userProfile, prescriptions: updated });
    }
  };

  // Add Appointment Handler
  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAptTitle.trim()) return;

    const newItem: MedicalAppointment = {
      id: `apt-${Date.now()}`,
      title: newAptTitle.trim(),
      facilityName: newAptFacility.trim() || 'Primary Health Centre (PHC)',
      date: newAptDate || new Date().toISOString().split('T')[0],
      time: newAptTime || '10:00 AM',
      status: 'upcoming',
      notes: 'Follow-up checkup and vital screening'
    };

    const updatedList = [newItem, ...appointments];
    setAppointments(updatedList);
    if (userProfile) {
      saveUserProfile({ ...userProfile, appointments: updatedList });
    }
    setNewAptTitle('');
    setNewAptFacility('');
    setNewAptDate('');
    setNewAptTime('');
    setShowAddApt(false);
    notifySuccess("New health checkup appointment scheduled!");
  };

  const handleDeleteAppointment = (id: string) => {
    const updated = appointments.filter(a => a.id !== id);
    setAppointments(updated);
    if (userProfile) {
      saveUserProfile({ ...userProfile, appointments: updated });
    }
  };

  // Add Lab Report Handler
  const handleAddLabReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabName.trim()) return;

    const newItem: LabReportItem = {
      id: `lab-${Date.now()}`,
      testName: newLabName.trim(),
      resultValue: newLabValue.trim() || 'Normal',
      normalRange: newLabRange.trim() || 'Standard Reference',
      testDate: new Date().toISOString().split('T')[0],
      status: 'Normal'
    };

    const updatedList = [newItem, ...labReports];
    setLabReports(updatedList);
    if (userProfile) {
      saveUserProfile({ ...userProfile, labReports: updatedList });
    }
    setNewLabName('');
    setNewLabValue('');
    setNewLabRange('');
    setShowAddLab(false);
    notifySuccess("Diagnostic test record added!");
  };

  const handleDeleteLabReport = (id: string) => {
    const updatedList = labReports.filter(l => l.id !== id);
    setLabReports(updatedList);
    if (userProfile) {
      saveUserProfile({ ...userProfile, labReports: updatedList });
    }
  };

  const cleanKinPhone = (emergencyKinPhone || '').replace(/[^0-9+]/g, '');

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      
      {/* Top Header Bar with Back and Print Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all tap-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back')}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-colors tap-target"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Print / Save Health Record</span>
          </button>

          <button
            onClick={() => setIsEditingVitals(!isEditingVitals)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 px-4 py-2.5 rounded-xl border border-teal-200 transition-colors tap-target"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingVitals ? 'View Pass Mode' : 'Edit Personal Vitals'}</span>
          </button>
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden border border-teal-800/40">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-300 uppercase tracking-wider">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            <span>COMPREHENSIVE RURAL HEALTH PROFILE & MEDICAL RECORD</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {name ? `${name} — Digital Aarogya Pass` : 'My Digital Aarogya Health Pass'}
          </h1>

          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed max-w-3xl">
            Complete offline medical record containing emergency triage passes, active doctor prescriptions, prenatal/chronic checkup appointments, vaccination histories, and diagnostic lab tests. Accessible anywhere with <strong>zero network connectivity</strong>.
          </p>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-bold shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* INTERACTIVE NAVIGATION TABS ACROSS THE HEALTH PROFILE */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => { setActiveTab('pass'); setIsEditingVitals(false); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all tap-target ${
            activeTab === 'pass' && !isEditingVitals
              ? 'bg-teal-700 text-white shadow-md shadow-teal-700/25'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          <span>Emergency Health Pass</span>
        </button>

        <button
          onClick={() => { setActiveTab('prescriptions'); setIsEditingVitals(false); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all tap-target ${
            activeTab === 'prescriptions' && !isEditingVitals
              ? 'bg-teal-700 text-white shadow-md shadow-teal-700/25'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Pill className="w-4 h-4 text-emerald-600" />
          <span>Active Prescriptions ({prescriptions.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('appointments'); setIsEditingVitals(false); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all tap-target ${
            activeTab === 'appointments' && !isEditingVitals
              ? 'bg-teal-700 text-white shadow-md shadow-teal-700/25'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Appointments & Visits ({appointments.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('vaccines'); setIsEditingVitals(false); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all tap-target ${
            activeTab === 'vaccines' && !isEditingVitals
              ? 'bg-teal-700 text-white shadow-md shadow-teal-700/25'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Syringe className="w-4 h-4 text-purple-600" />
          <span>Immunizations ({vaccinations.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('labs'); setIsEditingVitals(false); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all tap-target ${
            activeTab === 'labs' && !isEditingVitals
              ? 'bg-teal-700 text-white shadow-md shadow-teal-700/25'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-600" />
          <span>Lab Reports ({labReports.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EMERGENCY HEALTH PASS */}
      {/* ========================================================================= */}
      {activeTab === 'pass' && !isEditingVitals && (
        <div className="space-y-6">
          {!name ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-card">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
                <Heart className="w-8 h-8 text-rose-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">Your Health Pass is Currently Blank</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  No personal vitals recorded yet. Enter your details to create your official digital emergency pass for 108 ambulance and hospital OPD.
                </p>
              </div>
              <button
                onClick={() => setIsEditingVitals(true)}
                className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md inline-flex items-center gap-2 tap-target"
              >
                <Plus className="w-4 h-4" />
                <span>Enter My Details & Create Health Pass</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-teal-600/30 shadow-card p-6 sm:p-8 space-y-6">
              
              {/* Top Pass Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-700 to-emerald-900 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-teal-900/20 shrink-0">
                    {name.charAt(0).toUpperCase() || 'P'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider">
                        OFFLINE EMERGENCY PASS
                      </span>
                      <span className="text-xs text-slate-600 font-medium">
                        Record Trust ID: <strong>{schemeCardNumber || 'VERIFIED-RURAL-ID'}</strong>
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{name}</h2>
                  </div>
                </div>

                {/* High-Contrast Blood Group Badge */}
                <div className="bg-rose-50 border-2 border-rose-300 text-rose-900 px-5 py-3 rounded-2xl text-center self-start sm:self-auto shadow-xs">
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">BLOOD GROUP</span>
                  <span className="text-3xl sm:text-4xl font-black leading-tight text-rose-800">{bloodGroup}</span>
                </div>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-teal-700" />
                  <span>Age & Gender</span>
                </span>
                <p className="text-base font-extrabold text-slate-900">{age} Years • {gender}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-teal-700" />
                  <span>Emergency Kin Contact</span>
                </span>
                <p className="text-base font-extrabold text-slate-900 truncate">{emergencyKinName}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <FileBadge className="w-4 h-4 text-teal-700" />
                  <span>Government Scheme ID</span>
                </span>
                <p className="text-base font-extrabold text-teal-800 font-mono">{schemeCardNumber}</p>
              </div>
            </div>

            {/* Direct Dial Emergency Kin Action Bar */}
            {emergencyKinPhone && (
              <div className="bg-emergency-50/70 border border-emergency-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emergency-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emergency-900 block">
                      Emergency Kin Phone: <strong>{emergencyKinPhone}</strong> ({emergencyKinName})
                    </span>
                    <span className="text-[11px] text-emergency-700">1-Tap direct phone dial to alert family or ambulance paramedic</span>
                  </div>
                </div>

                <a
                  href={`tel:${cleanKinPhone}`}
                  className="w-full sm:w-auto bg-emergency-600 hover:bg-emergency-700 active:scale-95 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md shadow-emergency-600/30 flex items-center justify-center gap-2 transition-all tap-target shrink-0 uppercase tracking-wider"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Emergency Kin Now</span>
                </a>
              </div>
            )}

            {/* Medical Alerts & Conditions */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-700" />
                <span>Known Medical Conditions & Allergy Alerts:</span>
              </h3>

              <div className="flex flex-wrap gap-2">
                {conditions.map((cond, index) => (
                  <span 
                    key={index}
                    className="bg-teal-50 border border-teal-300 text-teal-900 text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-xl shadow-2xs"
                  >
                    {cond}
                  </span>
                ))}
                {pregnancyTrimester && conditions.includes('Pregnancy') && (
                  <span className="bg-pink-100 border border-pink-300 text-pink-900 text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-xl">
                    Pregnancy: {pregnancyTrimester}
                  </span>
                )}
                <span className="bg-amber-100 border border-amber-300 text-amber-900 text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-xl">
                  Allergies: {allergies}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Saved 100% Locally on this Device • Zero Cellular Internet Required</span>
              </div>
              <span>Digital Health Registry — SIH PS 26133</span>
            </div>
          </div>
        )}
      </div>
    )}

      {/* ========================================================================= */}
      {/* TAB 2: ACTIVE PRESCRIPTIONS */}
      {/* ========================================================================= */}
      {activeTab === 'prescriptions' && !isEditingVitals && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Doctor Prescriptions & Medications</h2>
              <p className="text-xs text-slate-600">Track active medicines prescribed at government PHCs, CHCs, and district hospitals.</p>
            </div>
            <button
              onClick={() => setShowAddRx(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-md tap-target"
            >
              <Plus className="w-4 h-4" />
              <span>Add Prescription</span>
            </button>
          </div>

          {/* Add Prescription Modal/Drawer */}
          {showAddRx && (
            <form onSubmit={handleAddPrescription} className="bg-teal-50/70 border-2 border-teal-600/30 rounded-3xl p-6 space-y-4 animate-in fade-in">
              <h3 className="font-bold text-sm text-teal-950 uppercase tracking-wider flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-700" />
                <span>Add Prescribed Medicine</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Medicine Name (e.g. Iron & Folic Acid)"
                  value={newRxName}
                  onChange={(e) => setNewRxName(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g. 500mg or 1 tab)"
                  value={newRxDosage}
                  onChange={(e) => setNewRxDosage(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
                />
                <input
                  type="text"
                  placeholder="Schedule (e.g. Twice daily after food)"
                  value={newRxFreq}
                  onChange={(e) => setNewRxFreq(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
                />
                <input
                  type="text"
                  placeholder="Prescribing Doctor / PHC"
                  value={newRxDoctor}
                  onChange={(e) => setNewRxDoctor(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRx(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Save to Prescriptions
                </button>
              </div>
            </form>
          )}

          {/* Prescriptions List */}
          {prescriptions.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-3 shadow-card">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <Pill className="w-7 h-7 text-emerald-700" />
              </div>
              <h3 className="text-base font-black text-slate-800">No Prescriptions Recorded</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No doctor prescriptions saved on this device. Tap "Add Prescription" to record medications advised by your doctor or PHC.
              </p>
              <button
                onClick={() => setShowAddRx(true)}
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Prescription</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prescriptions.map((rx) => (
                <div 
                  key={rx.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-soft hover:shadow-card transition-all space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{rx.medicineName}</h4>
                        <span className="text-[11px] text-teal-800 font-semibold">{rx.dosage}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePrescription(rx.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove Prescription"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-xs text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Frequency:</span>
                      <span className="font-bold text-slate-900">{rx.frequency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Doctor / PHC:</span>
                      <span className="font-medium text-slate-800">{rx.prescribedBy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HOSPITAL APPOINTMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'appointments' && !isEditingVitals && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Hospital Visits & Scheduled Checkups</h2>
              <p className="text-xs text-slate-600">Track antenatal visits, chronic reviews, and ASHA home consultations.</p>
            </div>
            <button
              onClick={() => setShowAddApt(true)}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-md tap-target"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Appointment</span>
            </button>
          </div>

          {/* Add Appointment Modal */}
          {showAddApt && (
            <form onSubmit={handleAddAppointment} className="bg-blue-50/70 border-2 border-blue-600/30 rounded-3xl p-6 space-y-4 animate-in fade-in">
              <h3 className="font-bold text-sm text-blue-950 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-700" />
                <span>Add Medical Visit / Follow-Up</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Checkup Title (e.g. ANC Ultrasound #4)"
                  value={newAptTitle}
                  onChange={(e) => setNewAptTitle(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="text"
                  placeholder="Hospital / Centre Name"
                  value={newAptFacility}
                  onChange={(e) => setNewAptFacility(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="date"
                  required
                  value={newAptDate}
                  onChange={(e) => setNewAptDate(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 font-bold"
                />
                <input
                  type="text"
                  placeholder="Time (e.g. 10:30 AM)"
                  value={newAptTime}
                  onChange={(e) => setNewAptTime(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddApt(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Save Appointment
                </button>
              </div>
            </form>
          )}

          {/* Appointments Grid */}
          {appointments.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-3 shadow-card">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
                <Calendar className="w-7 h-7 text-blue-700" />
              </div>
              <h3 className="text-base font-black text-slate-800">No Scheduled Appointments</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No hospital checkups or OPD visits recorded. Tap "Schedule Appointment" to add an upcoming visit or record a past consult.
              </p>
              <button
                onClick={() => setShowAddApt(true)}
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule First Appointment</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appointments.map((apt) => (
                <div 
                  key={apt.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-soft hover:shadow-card transition-all space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          apt.status === 'upcoming' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {apt.status}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 leading-snug mt-1">{apt.title}</h4>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteAppointment(apt.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{apt.date} • {apt.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{apt.facilityName}</span>
                    </div>
                    {apt.notes && (
                      <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">{apt.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: IMMUNIZATIONS & VACCINES */}
      {/* ========================================================================= */}
      {activeTab === 'vaccines' && !isEditingVitals && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Immunization & Vaccination Records</h2>
              <p className="text-xs text-slate-600">Official record of maternal and pediatric vaccinations administered at government centres.</p>
            </div>
            <button
              onClick={() => setShowAddVac(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-md tap-target"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vaccine Record</span>
            </button>
          </div>

          {/* Add Vaccine Form */}
          {showAddVac && (
            <form onSubmit={handleAddVaccine} className="bg-purple-50/70 border-2 border-purple-600/30 rounded-3xl p-6 space-y-4 animate-in fade-in">
              <h3 className="font-bold text-sm text-purple-950 uppercase tracking-wider flex items-center gap-2">
                <Syringe className="w-4 h-4 text-purple-700" />
                <span>Record Administered Vaccine</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Vaccine Name (e.g. Td Booster or Polio)"
                  value={newVacName}
                  onChange={(e) => setNewVacName(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-purple-600"
                />
                <input
                  type="date"
                  required
                  value={newVacDate}
                  onChange={(e) => setNewVacDate(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-purple-600 font-bold"
                />
                <input
                  type="text"
                  placeholder="Centre / Hospital Name"
                  value={newVacCenter}
                  onChange={(e) => setNewVacCenter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddVac(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Save Vaccine Record
                </button>
              </div>
            </form>
          )}

          {/* Vaccines List */}
          {vaccinations.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-3 shadow-card">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto">
                <Syringe className="w-7 h-7 text-purple-700" />
              </div>
              <h3 className="text-base font-black text-slate-800">No Immunization Records</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No vaccination history saved on this device. Tap "Add Vaccine Record" to track maternal or child immunizations.
              </p>
              <button
                onClick={() => setShowAddVac(true)}
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Vaccine Record</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {vaccinations.map((vac) => (
                <div 
                  key={vac.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-soft space-y-2.5 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold shrink-0">
                        <Syringe className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{vac.vaccineName}</h4>
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Administered on {vac.dateGiven}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteVaccine(vac.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Vaccine Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    Centre: <strong>{vac.centerName}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DIAGNOSTIC & LAB TEST REPORTS */}
      {/* ========================================================================= */}
      {activeTab === 'labs' && !isEditingVitals && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Diagnostic Reports & Lab Tests</h2>
              <p className="text-xs text-slate-600">Pathology and lab results compiled from government diagnostic labs.</p>
            </div>
            <button
              onClick={() => setShowAddLab(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-md tap-target"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lab Result</span>
            </button>
          </div>

          {/* Add Lab Form */}
          {showAddLab && (
            <form onSubmit={handleAddLabReport} className="bg-amber-50/70 border-2 border-amber-600/30 rounded-3xl p-6 space-y-4 animate-in fade-in">
              <h3 className="font-bold text-sm text-amber-950 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-700" />
                <span>Record Diagnostic Test Result</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Test Name (e.g. Hemoglobin)"
                  value={newLabName}
                  onChange={(e) => setNewLabName(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-600"
                />
                <input
                  type="text"
                  required
                  placeholder="Result (e.g. 11.2 g/dL)"
                  value={newLabValue}
                  onChange={(e) => setNewLabValue(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-600 font-bold"
                />
                <input
                  type="text"
                  placeholder="Normal Range (e.g. 11.0 - 15.0)"
                  value={newLabRange}
                  onChange={(e) => setNewLabRange(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLab(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Save Lab Report
                </button>
              </div>
            </form>
          )}

          {/* Labs Grid */}
          {labReports.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-3 shadow-card">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7 text-amber-700" />
              </div>
              <h3 className="text-base font-black text-slate-800">No Diagnostic Reports Recorded</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No pathology or blood test records stored. Tap "Add Lab Result" to record your lab test values.
              </p>
              <button
                onClick={() => setShowAddLab(true)}
                className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Lab Result</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {labReports.map((lab) => (
                <div 
                  key={lab.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-soft space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{lab.testName}</h4>
                      <span className="text-[11px] text-slate-500">Date: {lab.testDate}</span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {lab.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                    <div className="text-xl font-black text-slate-900">{lab.resultValue}</div>
                    <div className="text-[11px] text-slate-500">Reference: {lab.normalRange}</div>
                  </div>

                  <button
                    onClick={() => handleDeleteLabReport(lab.id)}
                    className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 pt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Report</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: FULL-SIZE EDIT VITALS FORM */}
      {/* ========================================================================= */}
      {isEditingVitals && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Update Personal Vitals & Emergency Contacts
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Keep your contact and medical info updated so government ambulance and hospital staff can assist promptly during emergencies.
            </p>
          </div>

          <form onSubmit={handleSaveVitals} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{t('fullName')} *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 text-xs sm:text-sm font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{t('age')} *</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-3 text-xs sm:text-sm font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{t('gender')}</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 text-xs sm:text-sm font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50 text-slate-800"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Blood Group */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-rose-600" />
                <span>{t('bloodGroup')} *</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                {BLOOD_GROUPS.map((bg) => (
                  <button
                    type="button"
                    key={bg}
                    onClick={() => setBloodGroup(bg)}
                    className={`py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all tap-target ${
                      bloodGroup === bg 
                        ? 'bg-rose-600 text-white shadow-md' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Kin Contact */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="text-xs font-bold text-emergency-700 uppercase tracking-wider flex items-center gap-2">
                <PhoneCall className="w-4 h-4" />
                <span>Emergency Kin Contact (Family / Relative for 1-Tap Dialing)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('emergencyKinName')} *</label>
                  <input
                    type="text"
                    required
                    value={emergencyKinName}
                    onChange={(e) => setEmergencyKinName(e.target.value)}
                    className="w-full px-4 py-3 text-xs sm:text-sm font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('emergencyKinPhone')} *</label>
                  <input
                    type="tel"
                    required
                    value={emergencyKinPhone}
                    onChange={(e) => setEmergencyKinPhone(e.target.value)}
                    className="w-full px-4 py-3 text-xs sm:text-sm font-mono font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Health Conditions */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">{t('healthConditions')}</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_CONDITIONS.map((cond) => {
                  const isSelected = conditions.includes(cond);
                  return (
                    <button
                      type="button"
                      key={cond}
                      onClick={() => toggleCondition(cond)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all tap-target ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cond}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pregnancy Trimester if pregnancy chosen */}
            {conditions.includes('Pregnancy') && (
              <div className="bg-pink-50 p-4 rounded-2xl border border-pink-200 space-y-2">
                <label className="text-xs font-bold text-pink-900">Current Trimester of Pregnancy:</label>
                <select
                  value={pregnancyTrimester}
                  onChange={(e) => setPregnancyTrimester(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl border border-pink-300 bg-white text-pink-900"
                >
                  <option value="1st Trimester (Months 1-3)">1st Trimester (Months 1-3)</option>
                  <option value="2nd Trimester (Months 4-6)">2nd Trimester (Months 4-6)</option>
                  <option value="3rd Trimester (Months 7-9, Near Delivery)">3rd Trimester (Months 7-9, Near Delivery)</option>
                </select>
              </div>
            )}

            {/* Scheme Card ID & Allergies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{t('schemeIdLabel')}</label>
                <input
                  type="text"
                  value={schemeCardNumber}
                  onChange={(e) => setSchemeCardNumber(e.target.value)}
                  className="w-full px-4 py-3 text-xs sm:text-sm font-mono font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Known Drug Allergies</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-4 py-3 text-xs sm:text-sm font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditingVitals(false)}
                className="px-5 py-3 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-teal-700 hover:bg-teal-800 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-md tap-target"
              >
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
