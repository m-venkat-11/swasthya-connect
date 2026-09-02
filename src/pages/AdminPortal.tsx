import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Search, 
  Edit3, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  PhoneCall, 
  User,
  ArrowLeft
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { facilities, selectedDistrict, updateFacilityAdmin, resetMasterData, t } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPhone, setEditPhone] = useState('');
  const [editContact, setEditContact] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const districtFacilities = facilities.filter(f => 
    f.district.toLowerCase() === selectedDistrict.toLowerCase() &&
    (f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.phone.includes(searchTerm))
  );

  const handleStartEdit = (id: string, currentPhone: string, currentContact: string) => {
    setEditingId(id);
    setEditPhone(currentPhone);
    setEditContact(currentContact);
  };

  const handleSave = (id: string) => {
    updateFacilityAdmin(id, {
      phone: editPhone.trim(),
      contact_person: editContact.trim()
    });
    setEditingId(null);
    setSuccessMessage("Facility phone & contact updated successfully! 'Last updated' timestamp refreshed to today.");
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all records to the original official dataset?")) {
      resetMasterData();
      setSuccessMessage("Reset to original master dataset completed.");
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-14">
      
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition-all tap-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back')}</span>
        </button>

        <button
          onClick={handleReset}
          className="text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 flex items-center gap-1 transition-colors tap-target"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('resetDefaults')}</span>
        </button>
      </div>

      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-soft space-y-2">
        <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>District Health In-Charge Admin View</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold">{t('adminTitle')}</h1>
        <p className="text-xs text-slate-300 leading-relaxed">
          {t('adminSubtitle')} Changes update the public data trust timestamp in real-time and persist in your browser.
        </p>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 p-4 rounded-xl flex items-center gap-3 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Active District: <strong className="text-teal-800">{selectedDistrict}</strong></span>
          <span>{districtFacilities.length} facilities in this district</span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search facility name or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
          />
        </div>
      </div>

      {/* Editable Facilities List */}
      <div className="space-y-3.5">
        {districtFacilities.map((facility) => {
          const isEditing = editingId === facility.id;

          return (
            <div 
              key={facility.id}
              className={`bg-white rounded-2xl border p-5 transition-all shadow-soft space-y-3 ${
                isEditing ? 'border-teal-600 ring-2 ring-teal-600/20 bg-teal-50/20' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] font-bold">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      ID: {facility.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${facility.is_govt ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
                      {facility.sector}
                    </span>
                    <span className="text-slate-500 font-normal">
                      Last Updated: <strong className="text-slate-900">{facility.last_updated}</strong>
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900">{facility.name}</h3>
                  <p className="text-xs text-slate-500">{facility.category} • {facility.address}</p>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => handleStartEdit(facility.id, facility.phone, facility.contact_person)}
                    className="self-start sm:self-auto px-3.5 py-2 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors tap-target shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>
                )}
              </div>

              {/* Edit Mode Inputs */}
              {isEditing ? (
                <div className="bg-white p-4 rounded-xl border border-teal-200 space-y-3 pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">
                        Phone (Tap-to-call number):
                      </label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-600"
                        placeholder="e.g. 08935-250033"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">
                        Medical In-Charge / Contact Person:
                      </label>
                      <input
                        type="text"
                        value={editContact}
                        onChange={(e) => setEditContact(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-600"
                        placeholder="e.g. Dr. K. Visweswara Rao (DCHS)"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSave(facility.id)}
                      className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{t('saveChanges')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50/80 p-2.5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span>Phone: <strong className="font-mono">{facility.phone}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span>In-Charge: <strong>{facility.contact_person || 'N/A'}</strong></span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
