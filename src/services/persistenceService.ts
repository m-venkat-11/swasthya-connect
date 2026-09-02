import { db, isFirebaseConfigured } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import type { MedicalAppointment, ReferralRecord, FollowUpItem } from '../types';

const STORAGE_APPOINTMENTS = 'swasthya_user_appointments';
const STORAGE_REFERRALS = 'swasthya_user_referrals';
const STORAGE_FOLLOWUPS = 'swasthya_user_followups';

export const persistenceService = {
  // Appointments
  async saveAppointment(appointment: MedicalAppointment, userId?: string): Promise<MedicalAppointment> {
    // 1. Always save in Local Storage for offline guarantee
    const existing = this.getLocalAppointments();
    const updated = [appointment, ...existing.filter(a => a.id !== appointment.id)];
    localStorage.setItem(STORAGE_APPOINTMENTS, JSON.stringify(updated));

    // 2. If online and Firebase configured, sync to Firestore
    if (isFirebaseConfigured && db && navigator.onLine) {
      try {
        await addDoc(collection(db, 'appointments'), {
          ...appointment,
          userId: userId || 'anonymous',
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn("Firestore appointment sync deferred to local cache", e);
      }
    }

    return appointment;
  },

  getLocalAppointments(): MedicalAppointment[] {
    try {
      const raw = localStorage.getItem(STORAGE_APPOINTMENTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async fetchAppointments(userId?: string): Promise<MedicalAppointment[]> {
    const local = this.getLocalAppointments();
    if (isFirebaseConfigured && db && userId && navigator.onLine) {
      try {
        const q = query(collection(db, 'appointments'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        const cloudItems: MedicalAppointment[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<MedicalAppointment, 'id'>)
        }));
        // Merge without duplicates
        const map = new Map<string, MedicalAppointment>();
        [...local, ...cloudItems].forEach(item => map.set(item.id, item));
        const merged = Array.from(map.values());
        localStorage.setItem(STORAGE_APPOINTMENTS, JSON.stringify(merged));
        return merged;
      } catch (e) {
        console.warn("Using offline appointments cache:", e);
      }
    }
    return local;
  },

  // Referrals
  async saveReferral(referral: ReferralRecord): Promise<ReferralRecord> {
    const existing = this.getLocalReferrals();
    const updated = [referral, ...existing.filter(r => r.id !== referral.id)];
    localStorage.setItem(STORAGE_REFERRALS, JSON.stringify(updated));

    if (isFirebaseConfigured && db && navigator.onLine) {
      try {
        await addDoc(collection(db, 'referrals'), {
          ...referral,
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn("Firestore referral sync deferred to local cache", e);
      }
    }
    return referral;
  },

  getLocalReferrals(): ReferralRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_REFERRALS);
      if (raw) return JSON.parse(raw);
      
      // Default sample rural referral for presentation
      const defaultReferrals: ReferralRecord[] = [
        {
          id: 'ref-01',
          patientName: 'Savita Ramesh Shinde',
          fromFacility: 'Kurkheda Primary Health Centre (PHC)',
          destinationFacility: 'District Civil Hospital Gadchiroli',
          specialty: 'Obstetrics & High-Risk Maternal Delivery',
          reason: 'Severe Anemia (Hb < 8.5) & Previous C-Section requiring Blood Bank & Surgical OT on standby',
          urgency: 'urgent',
          status: 'active',
          date: '2026-08-25'
        }
      ];
      localStorage.setItem(STORAGE_REFERRALS, JSON.stringify(defaultReferrals));
      return defaultReferrals;
    } catch {
      return [];
    }
  },

  // Follow-ups
  getLocalFollowUps(): FollowUpItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_FOLLOWUPS);
      if (raw) return JSON.parse(raw);

      const defaultFollowUps: FollowUpItem[] = [
        {
          id: 'fol-01',
          patientName: 'Savita Ramesh Shinde',
          title: '36-Week Ultrasound & Delivery Care Plan',
          facilityName: 'Sub-District Hospital / Civil Hospital',
          date: '2026-09-10',
          type: 'maternal',
          status: 'pending',
          notes: 'Carry antenatal MCP card and blood test records'
        },
        {
          id: 'fol-02',
          patientName: 'Savita Ramesh Shinde',
          title: 'ASHA Facilitator Home Visit & Nutrition Counseling',
          facilityName: 'Sub-Centre / Anganwadi',
          date: '2026-09-05',
          type: 'maternal',
          status: 'pending',
          notes: 'Janani Suraksha Yojana verification'
        }
      ];
      localStorage.setItem(STORAGE_FOLLOWUPS, JSON.stringify(defaultFollowUps));
      return defaultFollowUps;
    } catch {
      return [];
    }
  }
};
