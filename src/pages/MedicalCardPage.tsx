import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { UserMedicalProfile } from '../types';
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
  Activity
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

export const MedicalCardPage: React.FC = () => {
  const { userProfile, saveUserProfile, t } = useApp();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState<boolean>(!userProfile);
  const [name, setName] = useState(userProfile?.name || '');
  const [age, setAge] = useState(userProfile?.age || '');
  const [gender, setGender] = useState(userProfile?.gender || 'Female');
  const [bloodGroup, setBloodGroup] = useState(userProfile?.bloodGroup || 'O+');
  const [emergencyKinName, setEmergencyKinName] = useState(userProfile?.emergencyKinName || userProfile?.emergencyContactName || '');
  const [emergencyKinPhone, setEmergencyKinPhone] = useState(userProfile?.emergencyKinPhone || userProfile?.emergencyContactPhone || '');
  const [conditions, setConditions] = useState<string[]>(userProfile?.conditions || ['None / Healthy']);
  const [pregnancyTrimester, setPregnancyTrimester] = useState(userProfile?.pregnancyTrimester || '3rd Trimester (Months 7-9, Near Delivery)');
  const [allergies, setAllergies] = useState(userProfile?.allergies || '');
  const [schemeCardNumber, setSchemeCardNumber] = useState(userProfile?.schemeCardNumber || '');
  const [successMsg, setSuccessMsg] = useState(false);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: UserMedicalProfile = {
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
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    saveUserProfile(profile);
    setIsEditing(false);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  const cleanKinPhone = (userProfile?.emergencyKinPhone || userProfile?.emergencyContactPhone || '').replace(/[^0-9+]/g, '');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      
      {/* Top Bar with Back Button and Quick Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all tap-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back')}</span>
        </button>

        <div className="flex items-center gap-2">
          {userProfile && (
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition-colors tap-target"
              title="Print Emergency Pass"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print / Save Pass</span>
            </button>
          )}

          {!isEditing && userProfile && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl border border-teal-200 transition-colors tap-target"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden border border-teal-800/40">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-300 uppercase tracking-wider">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            <span>OFFLINE EMERGENCY HEALTHCARE PASS</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {t('medicalCardTitle')}
          </h1>

          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed max-w-2xl">
            {t('medicalCardSubtitle')} This health card is saved directly on this phone and is completely accessible even when you have <strong>zero cellular internet</strong> in remote villages.
          </p>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-bold shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{t('healthCardSavedSuccess')}</span>
        </div>
      )}

      {/* FULL-SIZE REGULAR TAB VIEW */}
      {!isEditing && userProfile ? (
        <div className="space-y-6">
          
          {/* Main Full-Width Emergency Health Pass Card */}
          <div className="bg-white rounded-3xl border-2 border-teal-600/30 shadow-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
            
            {/* Top Pass Bar: Name, Health Pass ID, Blood Group Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-700 to-emerald-900 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-teal-900/20 shrink-0">
                  {userProfile.name.charAt(0).toUpperCase() || 'P'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider">
                      {t('emergencyPassTitle')}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">
                      Updated: <strong>{userProfile.lastUpdated}</strong>
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{userProfile.name}</h2>
                </div>
              </div>

              {/* High-Contrast Blood Group Badge */}
              <div className="bg-rose-50 border-2 border-rose-300 text-rose-900 px-5 py-3 rounded-2xl text-center self-start sm:self-auto shadow-xs">
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">BLOOD GROUP</span>
                <span className="text-3xl sm:text-4xl font-black leading-tight text-rose-800">{userProfile.bloodGroup}</span>
              </div>
            </div>

            {/* Vitals Grid in Maximum View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-teal-700" />
                  <span>Age & Gender</span>
                </span>
                <p className="text-base font-extrabold text-slate-900">{userProfile.age} Years • {userProfile.gender}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-teal-700" />
                  <span>Emergency Kin Contact</span>
                </span>
                <p className="text-base font-extrabold text-slate-900 truncate">
                  {userProfile.emergencyKinName || userProfile.emergencyContactName || 'Family Contact'}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <FileBadge className="w-4 h-4 text-teal-700" />
                  <span>Government Scheme ID</span>
                </span>
                <p className="text-base font-extrabold text-teal-800 font-mono">
                  {userProfile.schemeCardNumber || "PMJAY / MPJAY Eligible"}
                </p>
              </div>

            </div>

            {/* Direct Dial Emergency Kin Action Bar */}
            {(userProfile.emergencyKinPhone || userProfile.emergencyContactPhone) && (
              <div className="bg-emergency-50/70 border border-emergency-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emergency-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emergency-900 block">
                      Emergency Kin Phone: <strong>{userProfile.emergencyKinPhone || userProfile.emergencyContactPhone}</strong>
                    </span>
                    <span className="text-[11px] text-emergency-700">1-Tap direct call to alert family or ambulance dispatch</span>
                  </div>
                </div>

                <a
                  href={`tel:${cleanKinPhone}`}
                  className="w-full sm:w-auto bg-emergency-600 hover:bg-emergency-700 active:scale-95 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md shadow-emergency-600/30 flex items-center justify-center gap-2 transition-all tap-target shrink-0 uppercase tracking-wider"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{t('callKin')}</span>
                </a>
              </div>
            )}

            {/* Medical Alerts & Conditions Section */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-700" />
                <span>Known Medical Conditions & Allergy Alerts:</span>
              </h3>

              <div className="flex flex-wrap gap-2">
                {userProfile.conditions.map((cond, index) => (
                  <span 
                    key={index}
                    className="bg-teal-50 border border-teal-300 text-teal-900 text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-xl shadow-2xs"
                  >
                    {cond}
                  </span>
                ))}

                {userProfile.pregnancyTrimester && (
                  <span className="bg-pink-100 border border-pink-300 text-pink-900 text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-xl">
                    Pregnancy: {userProfile.pregnancyTrimester}
                  </span>
                )}

                {userProfile.allergies && (
                  <span className="bg-amber-100 border border-amber-300 text-amber-900 text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-xl">
                    Allergies: {userProfile.allergies}
                  </span>
                )}
              </div>
            </div>

            {/* Security & Offline Verification Footer */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Encrypted in Local Device Storage • Available 100% Offline with Zero Network</span>
              </div>
              <span>Data Version: 2026.09 (SIH Prototype)</span>
            </div>

          </div>

          {/* Quick Switch to Edit */}
          <div className="text-center">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 shadow-sm transition-all tap-target"
            >
              <Edit3 className="w-4 h-4" />
              <span>Update Emergency Details</span>
            </button>
          </div>

        </div>
      ) : (
        /* FULL-SIZE EDIT FORM VIEW */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {userProfile ? 'Edit Your Emergency Medical Card' : 'Create Your Emergency Medical Card'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Please enter your accurate medical details. This information will be used during medical triage and emergency ambulance transfers.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Name, Age, Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{t('fullName')} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Savita Ramesh Shinde"
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
                  placeholder="e.g. 26"
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

            {/* Blood Group Selector */}
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
                    placeholder="e.g. Ramesh Shinde (Husband / Parent)"
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
                    placeholder="e.g. 9822123456"
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

            {/* Scheme Card ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">{t('schemeIdLabel')}</label>
              <input
                type="text"
                placeholder="e.g. PMJAY-MH-8472910 or Aarogyasri Card No."
                value={schemeCardNumber}
                onChange={(e) => setSchemeCardNumber(e.target.value)}
                className="w-full px-4 py-3 text-xs sm:text-sm font-mono font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
              />
            </div>

            {/* Allergies */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Known Allergies (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Penicillin allergy, Sulfa drugs, Peanuts"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full px-4 py-3 text-xs sm:text-sm font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              {userProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-3 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-3 bg-teal-700 hover:bg-teal-800 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-md tap-target"
              >
                <Save className="w-4 h-4" />
                <span>{t('saveHealthCard')}</span>
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
