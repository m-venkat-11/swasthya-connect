import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { InteractiveMap } from '../components/InteractiveMap';
import { rankFacilitiesForNeed } from '../utils/recommendationEngine';
import { 
  ArrowLeft, 
  MapPin, 
  PhoneCall, 
  User, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  Navigation, 
  Clock,
  Copy,
  Check,
  Calendar,
  X,
  Sparkles
} from 'lucide-react';

export const FacilityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { facilities, selectedNeed, requireAuthentication, bookAppointment, userProfile, t } = useApp();
  const [copied, setCopied] = useState(false);

  // Appointment Modal state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [patientName, setPatientName] = useState(userProfile?.name || 'Self');
  const [appointmentDate, setAppointmentDate] = useState('2026-09-08');
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [reason, setReason] = useState('General Consultation & Health Check');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const facility = facilities.find(f => f.id === id);

  if (!facility) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto my-12">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Facility Not Found</h2>
        <p className="text-xs text-slate-700">The healthcare facility requested could not be located in the current district records.</p>
        <button
          onClick={() => navigate('/results')}
          className="px-5 py-2.5 bg-teal-700 text-white font-bold text-xs rounded-xl"
        >
          Back to Results
        </button>
      </div>
    );
  }

  const cleanPhone = facility.phone.replace(/[^0-9+]/g, '');

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${facility.name}, ${facility.address}, ${facility.district}, ${facility.state}`
  )}`;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(facility.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenBooking = () => {
    requireAuthentication(`To book and permanently record an appointment at ${facility.name}:`, () => {
      setIsBookingOpen(true);
    });
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    await bookAppointment({
      title: `${facility.name} — ${reason}`,
      facilityName: facility.name,
      doctorName: facility.contact_person || 'Medical Officer on Duty',
      date: appointmentDate,
      time: appointmentTime,
      status: 'upcoming',
      notes: `Patient: ${patientName}. Sector: ${facility.sector}. Verified Government Record.`
    });
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setIsBookingOpen(false);
      navigate('/profile');
    }, 1800);
  };

  // Wrap in recommendation structure for mini map
  const singleRec = rankFacilitiesForNeed([facility], selectedNeed, facility.district)[0] || {
    facility,
    accessibilityScore: 90,
    distanceKm: 12,
    estimatedTravelMinutes: 25,
    isRecommended: true,
    hasRequiredService: true,
    hasEmergencyCapability: facility.services.includes('Emergency Care'),
    is24x7: true,
    matchReasons: ['Verified District Facility'],
    missingServices: [],
    scoreBreakdown: { serviceMatch: 35, emergencyReadiness: 20, publicPriority: 20, distanceConvenience: 10, freshnessTrust: 5 }
  };

  return (
    <div className="w-full space-y-6 pb-14 animate-in fade-in duration-200">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition-all tap-target"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('back')}</span>
      </button>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-950 p-6 sm:p-8 text-white relative">
          <div className="space-y-3 relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-teal-700/80 text-teal-100 text-[10px] sm:text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-teal-500/30">
                {facility.category}
              </span>
              <span className={`text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full ${
                facility.is_govt 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {facility.sector}
              </span>
              {facility.services.includes('Emergency Care') && (
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>24x7 Casualty & Emergency</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              {facility.name}
            </h1>

            <div className="flex items-start gap-1.5 text-xs text-teal-100/90 font-medium">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{facility.address}, {facility.district}, {facility.state} - {facility.pincode}</span>
            </div>
          </div>
        </div>

        {/* Core Actions Bar: Call, Directions, & Book Appointment */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center gap-3">
          <a
            href={`tel:${cleanPhone}`}
            className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 tap-target"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{t('callFacility')} ({cleanPhone})</span>
          </a>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 tap-target"
          >
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span>{t('openInMaps')}</span>
          </a>

          <button
            onClick={handleOpenBooking}
            className="w-full sm:w-auto px-5 py-3 bg-teal-700 hover:bg-teal-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 tap-target sm:ml-auto"
          >
            <Calendar className="w-4 h-4" />
            <span>Book OPD / Checkup</span>
          </button>

          <button
            onClick={handleCopyPhone}
            className="p-3 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-1 text-xs font-bold"
            title="Copy Phone Number"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
          </button>
        </div>

        {/* Content Details Grid */}
        <div className="p-6 sm:p-8 space-y-7">
          
          {/* Contact Person & Institutional Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold uppercase tracking-wider">
                <User className="w-4 h-4 text-teal-700" />
                <span>{t('contactPerson')}</span>
              </div>
              <p className="font-bold text-sm text-slate-900">{facility.contact_person}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Public Health Coverage</span>
              </div>
              <p className="font-bold text-sm text-emerald-800">
                {facility.is_govt ? "100% Free Public Hospital" : "Cashless Aarogyasri / PMJAY"}
              </p>
            </div>

          </div>

          {/* Services Offered */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-700" />
              <span>{t('servicesOffered')} at this Facility:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {facility.services.map((service, index) => (
                <div 
                  key={index}
                  className="bg-teal-50/60 border border-teal-200/80 p-3 rounded-xl flex items-center gap-2 text-xs font-bold text-teal-900"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location Map Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-700" />
                <span>Facility Map Pin & Surroundings:</span>
              </h3>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
              >
                <span>Open in Full Navigation</span>
                <Navigation className="w-3 h-3" />
              </a>
            </div>

            <InteractiveMap
              recommendations={[singleRec]}
              height="300px"
            />
          </div>

          {/* Trust Metadata & Verification Note */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5 text-teal-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Data Freshness & Provenance</span>
              </span>
              <span className="text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                {t('lastUpdated')}: {facility.last_updated}
              </span>
            </div>
            <p className="leading-relaxed">
              <strong>Source:</strong> {facility.data_source}. Compiled from official State Health Department master facility records.
            </p>
            <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
              {t('callAheadDisclaimer')}
            </p>
          </div>

        </div>

      </div>

      {/* Appointment Booking Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 relative">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-teal-700 uppercase tracking-wider block">
                  SCHEDULE CHECKUP / OPD
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {facility.name}
                </h3>
              </div>
              <button
                onClick={() => setIsBookingOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-slate-900">Appointment Confirmed!</h4>
                <p className="text-xs text-slate-600">
                  Successfully saved to your digital Aarogya pass and synced to cloud records.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Patient Name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Time Slot</label>
                    <select
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
                    >
                      <option>09:30 AM (Morning OPD)</option>
                      <option>10:30 AM (Morning OPD)</option>
                      <option>11:30 AM (Specialist Clinic)</option>
                      <option>02:30 PM (Afternoon ANC)</option>
                      <option>03:30 PM (Afternoon General)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Reason / Health Need</label>
                  <input
                    type="text"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 tap-target uppercase tracking-wider"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Confirm Appointment Booking</span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
