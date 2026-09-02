import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import type { Facility } from '../types';
import { 
  Search, 
  Edit3, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  PhoneCall, 
  User, 
  ArrowLeft,
  FileSpreadsheet,
  Upload,
  Download,
  Lock,
  Unlock,
  KeyRound,
  FileText
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { 
    facilities, 
    selectedDistrict, 
    updateFacilityAdmin, 
    resetMasterData, 
    isAdminUnlocked, 
    unlockAdmin, 
    lockAdmin,
    importFacilitiesData,
    allAvailableStates,
    t 
  } = useApp();

  const navigate = useNavigate();

  // Pin Gate State
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Search & Edit
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPhone, setEditPhone] = useState('');
  const [editContact, setEditContact] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  const districtFacilities = facilities.filter(f => 
    f.district.toLowerCase() === selectedDistrict.toLowerCase() &&
    (f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.phone.includes(searchTerm))
  );

  const handlePinUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = unlockAdmin(pinInput);
    if (ok) {
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

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
    setSuccessMessage("Facility phone & contact updated! Timestamp refreshed.");
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all records to the original official dataset?")) {
      resetMasterData();
      setSuccessMessage("Reset to original master dataset completed.");
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Process Excel / CSV File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        if (!data || data.length === 0) {
          alert("Spreadsheet appears to be empty.");
          setIsProcessingFile(false);
          return;
        }

        // Map spreadsheet rows to Facility schema
        const parsedFacilities: Facility[] = data.map((row: any, i: number) => {
          let servicesList: string[] = ["General Care", "Pharmacy"];
          if (row.services) {
            if (Array.isArray(row.services)) {
              servicesList = row.services;
            } else if (typeof row.services === 'string') {
              servicesList = row.services.split(',').map((s: string) => s.trim()).filter(Boolean);
            }
          }

          return {
            id: row.id || `IMP_${Date.now()}_${i + 1}`,
            name: row.name || row.facility_name || `Healthcare Facility ${i + 1}`,
            contact_person: row.contact_person || row.doctor_incharge || "Medical Officer",
            phone: String(row.phone || row.contact_number || "108"),
            category: row.category || row.facility_type || "Primary Health Centre (PHC)",
            sector: row.sector || (String(row.is_govt) === 'false' ? 'Private' : 'Government'),
            address: row.address || `${row.district || 'District Area'}, ${row.state || 'State'}`,
            pincode: String(row.pincode || "400001"),
            district: row.district || "Default District",
            state: row.state || "State",
            services: servicesList,
            last_updated: new Date().toISOString().split('T')[0],
            data_source: "Imported via District Admin Excel/CSV",
            is_govt: String(row.sector).toLowerCase().includes('private') ? false : true
          };
        });

        const result = importFacilitiesData(parsedFacilities);
        setIsProcessingFile(false);

        if (result.success) {
          const statesAdded = result.newStates.join(', ');
          const districtsAdded = result.newDistricts.join(', ');
          setImportSummary(`Successfully imported ${result.addedCount} facilities! Added/Updated States: [${statesAdded}] and Districts: [${districtsAdded}].`);
        } else {
          alert(`Import issue: ${result.errors.join(', ')}`);
        }
      } catch (err: any) {
        console.error("Excel parse error", err);
        alert(`Failed to parse file: ${err.message}`);
        setIsProcessingFile(false);
      }
    };

    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        name: "District Civil Hospital Example",
        contact_person: "Dr. A. K. Sharma (Civil Surgeon)",
        phone: "020-256489",
        category: "District General Hospital (200 Beds)",
        sector: "Government",
        address: "Station Road, Near Bus Complex",
        pincode: "411001",
        district: "Gadchiroli (Tribal Agency)",
        state: "Maharashtra",
        services: "General Care, Maternal Care, Child Care, Emergency Care, Pharmacy, Laboratory"
      },
      {
        name: "Rural Hospital Example",
        contact_person: "Dr. P. Patil (Superintendent)",
        phone: "02564-222100",
        category: "Rural Hospital (RH)",
        sector: "Government",
        address: "Main Bazaar Road",
        pincode: "425412",
        district: "Nandurbar (Satpura Tribal Belt)",
        state: "Maharashtra",
        services: "General Care, Maternal Care, Emergency Care, Pharmacy"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "SwasthyaConnect_Facility_Import_Template.xlsx");
  };

  // Export Updated Master Seed JSON for GitHub commit
  const handleExportSeed = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(facilities, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "facilities_seed_updated.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // 1. PIN GATE VIEW IF LOCKED
  if (!isAdminUnlocked) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200 p-8 shadow-card space-y-6 text-center animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mx-auto shadow-sm">
          <KeyRound className="w-8 h-8 text-teal-700" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-slate-900">{t('secretAdminGateTitle')}</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('secretAdminGateSubtitle')}
          </p>
        </div>

        <form onSubmit={handlePinUnlock} className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-slate-700">Administrator Passcode</label>
            <input
              type="password"
              required
              autoFocus
              placeholder={t('enterPinPlaceholder')}
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
            />
          </div>

          {pinError && (
            <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2 rounded-lg border border-rose-200">
              Access denied. Enter valid passcode (default: sih2026).
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all tap-target"
          >
            {t('unlockBtn')}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Protected Prototype Portal</span>
          <button onClick={() => navigate('/')} className="text-teal-700 font-bold hover:underline">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // 2. UNLOCKED ADMIN DASHBOARD
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-14">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition-all tap-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back')}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 flex items-center gap-1 transition-colors tap-target"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('resetDefaults')}</span>
          </button>

          <button
            onClick={lockAdmin}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1 shadow-sm"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t('lockBtn')}</span>
          </button>
        </div>
      </div>

      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-card space-y-3">
        <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
          <Unlock className="w-4 h-4 text-emerald-400" />
          <span>Administrator Access Unlocked</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black">{t('adminTitle')}</h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
          {t('adminSubtitle')} You can now import new Excel/CSV state datasets, edit hospital details, or export updated master seeds.
        </p>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* SECTION: CSV & EXCEL STATE DATASET IMPORT */}
      <div className="bg-white rounded-3xl border-2 border-teal-600/30 p-6 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-teal-700" />
            <div>
              <h2 className="font-extrabold text-base text-slate-900">{t('importSectionTitle')}</h2>
              <p className="text-xs text-slate-500">{t('importSubtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors tap-target"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('downloadTemplate')}</span>
            </button>
            <button
              onClick={handleExportSeed}
              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold rounded-xl border border-teal-200 flex items-center gap-1.5 transition-colors tap-target"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('exportMasterSeed')}</span>
            </button>
          </div>
        </div>

        {/* Drag & Drop File Upload Input */}
        <div className="relative border-2 border-dashed border-teal-300 hover:border-teal-500 rounded-2xl p-6 sm:p-8 text-center bg-teal-50/20 hover:bg-teal-50/40 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-2 pointer-events-none">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div className="font-bold text-xs sm:text-sm text-slate-800">
              {isProcessingFile ? "Reading & Validating Spreadsheet..." : t('dragDropCsv')}
            </div>
            <p className="text-[11px] text-slate-500">
              Supported formats: <strong>.xlsx, .xls, .csv</strong> • Automatically registers new States and Districts
            </p>
          </div>
        </div>

        {importSummary && (
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs font-bold text-emerald-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{importSummary}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 pt-1">
          <span className="font-bold">Currently Registered States:</span>
          {allAvailableStates.map((st) => (
            <span key={st} className="bg-slate-100 font-medium px-2 py-0.5 rounded-md border border-slate-200">
              {st}
            </span>
          ))}
          <span className="text-teal-700 font-bold ml-auto">Total Facilities: {facilities.length}</span>
        </div>
      </div>

      {/* SECTION: FACILITY METADATA & PHONE EDITOR */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-100 pb-3">
          <span>District Facilities Editor: <strong className="text-teal-800">{selectedDistrict}</strong></span>
          <span>{districtFacilities.length} facilities</span>
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

        {/* Facilities List */}
        <div className="space-y-3 pt-2">
          {districtFacilities.map((facility) => {
            const isEditing = editingId === facility.id;

            return (
              <div 
                key={facility.id}
                className={`bg-slate-50/60 rounded-2xl border p-4 transition-all space-y-3 ${
                  isEditing ? 'border-teal-600 ring-2 ring-teal-600/20 bg-teal-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <span className="bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
                        ID: {facility.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded ${facility.is_govt ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
                        {facility.sector}
                      </span>
                      <span className="text-slate-500 font-normal">
                        Last Updated: <strong className="text-slate-900">{facility.last_updated}</strong>
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-slate-900">{facility.name}</h3>
                    <p className="text-xs text-slate-500">{facility.category} • {facility.address}</p>
                  </div>

                  {!isEditing && (
                    <button
                      onClick={() => handleStartEdit(facility.id, facility.phone, facility.contact_person)}
                      className="self-start sm:self-auto px-3 py-1.5 bg-white hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors tap-target shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Phone</span>
                    </button>
                  )}
                </div>

                {/* Edit Form */}
                {isEditing ? (
                  <div className="bg-white p-4 rounded-xl border border-teal-200 space-y-3 pt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 uppercase">
                          Phone (Direct dialer link):
                        </label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-600"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/60">
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

    </div>
  );
};
