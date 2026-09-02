import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { UserMedicalProfile } from '../types';
import { 
  X, 
  ShieldCheck, 
  Heart, 
  PhoneCall, 
  Droplet, 
  Save, 
  Edit3, 
  CheckCircle2,
  FileBadge
} from 'lucide-react';

interface MedicalProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export const MedicalProfileModal: React.FC<MedicalProfileModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, saveUserProfile, t } = useApp();

  const [isEditing, setIsEditing] = useState<boolean>(!userProfile);
  const [name, setName] = useState(userProfile?.name || '');
  const [age, setAge] = useState(userProfile?.age || '');
  const [gender, setGender] = useState(userProfile?.gender || 'Female');
  const [bloodGroup, setBloodGroup] = useState(userProfile?.bloodGroup || 'O+');
  const [emergencyKinName, setEmergencyKinName] = useState(userProfile?.emergencyKinName || userProfile?.emergencyContactName || '');
  const [emergencyKinPhone, setEmergencyKinPhone] = useState(userProfile?.emergencyKinPhone || userProfile?.emergencyContactPhone || '');
  const [conditions, setConditions] = useState<string[]>(userProfile?.conditions || ['None / Healthy']);
  const [pregnancyTrimester, setPregnancyTrimester] = useState(userProfile?.pregnancyTrimester || '3rd Trimester (Months 7-9, Near Delivery)');
  const [schemeCardNumber, setSchemeCardNumber] = useState(userProfile?.schemeCardNumber || '');
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

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
      schemeCardNumber: schemeCardNumber.trim(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    saveUserProfile(profile);
    setIsEditing(false);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white p-5 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-teal-300 font-bold uppercase tracking-wider">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
              <span>Offline Triage & Safety</span>
            </div>
            <h3 className="text-xl font-black">{t('medicalCardTitle')}</h3>
            <p className="text-xs text-teal-200 leading-relaxed max-w-md">
              {t('medicalCardSubtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors tap-target flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-3 text-xs font-bold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('healthCardSavedSuccess')}</span>
          </div>
        )}

        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {/* VIEW MODE: Offline Emergency Health Pass */}
          {!isEditing && userProfile ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50/50 rounded-2xl border-2 border-teal-600/30 p-5 shadow-sm space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-teal-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-black text-sm">
                      HP
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-teal-800 tracking-wider uppercase block">
                        {t('emergencyPassTitle')}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900">{userProfile.name}</h4>
                    </div>
                  </div>

                  <div className="bg-rose-100 border border-rose-300 text-rose-800 px-3 py-1 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold block leading-none">Blood</span>
                    <span className="text-lg font-black leading-tight text-rose-900">{userProfile.bloodGroup}</span>
                  </div>
                </div>

                {/* Patient Vitals Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 font-semibold block">Age & Gender</span>
                    <span className="font-bold text-slate-900">{userProfile.age} yrs • {userProfile.gender}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 col-span-1 sm:col-span-2">
                    <span className="text-[10px] text-slate-500 font-semibold block">Emergency Kin Contact</span>
                    <span className="font-bold text-slate-900 truncate block">
                      {userProfile.emergencyKinName || userProfile.emergencyContactName || 'Family'}
                    </span>
                  </div>
                </div>

                {/* Direct Dial Emergency Kin Button */}
                {(userProfile.emergencyKinPhone || userProfile.emergencyContactPhone) && (
                  <a
                    href={`tel:${(userProfile.emergencyKinPhone || userProfile.emergencyContactPhone)?.replace(/[^0-9+]/g, '')}`}
                    className="w-full bg-emergency-600 hover:bg-emergency-700 active:scale-95 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all tap-target shadow-md shadow-emergency-600/20"
                  >
                    <PhoneCall className="w-4 h-4 animate-pulse" />
                    <span>{t('callKin')}: {userProfile.emergencyKinPhone || userProfile.emergencyContactPhone}</span>
                  </a>
                )}

                {/* Conditions Chips */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                    Medical Alerts / Chronic Conditions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {userProfile.conditions.map((c, i) => (
                      <span key={i} className="bg-white border border-teal-300 text-teal-900 text-xs font-bold px-2.5 py-1 rounded-lg">
                        {c}
                      </span>
                    ))}
                    {userProfile.pregnancyTrimester && (
                      <span className="bg-pink-100 border border-pink-300 text-pink-800 text-xs font-bold px-2.5 py-1 rounded-lg">
                        Trimester: {userProfile.pregnancyTrimester}
                      </span>
                    )}
                  </div>
                </div>

                {/* Scheme & Privacy */}
                {userProfile.schemeCardNumber && (
                  <div className="text-xs bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2 text-slate-700 font-medium">
                    <FileBadge className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>Govt Health Scheme ID: <strong>{userProfile.schemeCardNumber}</strong></span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Offline Ready on this Device
                  </span>
                  <span>Updated: {userProfile.lastUpdated}</span>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors tap-target"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Medical Card Details</span>
              </button>
            </div>
          ) : (
            /* EDIT / CREATE MODE FORM */
            <form onSubmit={handleSave} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{t('fullName')} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Savita Shinde"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{t('age')} *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 26"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{t('gender')}</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Blood Group */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-rose-600" />
                  <span>{t('bloodGroup')} *</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {BLOOD_GROUPS.map((bg) => (
                    <button
                      type="button"
                      key={bg}
                      onClick={() => setBloodGroup(bg)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all tap-target ${
                        bloodGroup === bg 
                          ? 'bg-rose-600 text-white shadow-sm' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-emergency-700 uppercase tracking-wider flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Emergency Kin Contact (Family / Relative)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">{t('emergencyKinName')}</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Shinde (Husband)"
                      value={emergencyKinName}
                      onChange={(e) => setEmergencyKinName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">{t('emergencyKinPhone')} *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9822123456"
                      value={emergencyKinPhone}
                      onChange={(e) => setEmergencyKinPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Conditions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{t('healthConditions')}</label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_CONDITIONS.map((cond) => {
                    const isSelected = conditions.includes(cond);
                    return (
                      <button
                        type="button"
                        key={cond}
                        onClick={() => toggleCondition(cond)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all tap-target ${
                          isSelected
                            ? 'bg-teal-700 text-white font-bold shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {cond}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pregnancy Trimester if selected */}
              {conditions.includes('Pregnancy') && (
                <div className="bg-pink-50 p-3 rounded-xl border border-pink-200 space-y-1">
                  <label className="text-xs font-bold text-pink-900">Current Trimester:</label>
                  <select
                    value={pregnancyTrimester}
                    onChange={(e) => setPregnancyTrimester(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-pink-300 bg-white text-pink-900 font-bold"
                  >
                    <option value="1st Trimester (Months 1-3)">1st Trimester (Months 1-3)</option>
                    <option value="2nd Trimester (Months 4-6)">2nd Trimester (Months 4-6)</option>
                    <option value="3rd Trimester (Months 7-9, Near Delivery)">3rd Trimester (Months 7-9, Near Delivery)</option>
                  </select>
                </div>
              )}

              {/* Scheme ID */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{t('schemeIdLabel')}</label>
                <input
                  type="text"
                  placeholder="e.g. PMJAY-MH-8472910"
                  value={schemeCardNumber}
                  onChange={(e) => setSchemeCardNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                {userProfile && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md tap-target"
                >
                  <Save className="w-4 h-4" />
                  <span>{t('saveHealthCard')}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
