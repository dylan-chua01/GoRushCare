import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const MEDICATION_KEY = '@medications';
const DOSE_HISTORY_KEY = '@dose_history';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface Medication {
  refillAt: any;
  currentSupply: any;
  id: string;
  name: string;
  // Add medication type
  medicationType: 'pill-count' | 'dose-based';
  
  
  // For pill-count medications
  pillsPerDose?: number;    // How many pills per dose (default 1)
  currentPills?: number;    // Current pill count
  totalPills?: number;     // Full pill supply
  refillAtPills?: number;  // When to trigger reminder
  
  // For dose-based medications
  dosage?: string;         // e.g. "200mg"
  dosePerTake?: number;    // e.g. 20 (mg)
  currentDose?: number;    // Current mg remaining
  totalDose?: number;      // Full mg supply
  refillAtDose?: number;   // When to trigger reminder
  
  // Common fields
  times: string[];
  startDate: string;
  duration: string;
  color: string;
  reminderEnabled: boolean;
  refillReminder: boolean;
  lastRefillDate?: string;
  refillNotifiedAt?: Date | string;
}

export interface DoseHistory {
  id: string;
  medicationId: string;
  timestamp: string;   // ISO string
  taken: boolean;
  notes?: string;
}

/* ------------------------------------------------------------------ */
/*  Medication helpers                                                */
/* ------------------------------------------------------------------ */

export async function getMedication(): Promise<Medication[]> {
  try {
    const raw = await AsyncStorage.getItem(MEDICATION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error getting medications:', e);
    return [];
  }
}

export async function addMedication(med: Medication): Promise<void> {
  const all = await getMedication();
  await AsyncStorage.setItem(MEDICATION_KEY, JSON.stringify([...all, med]));
}

export async function updateMedication(medication: Medication): Promise<boolean> {
  try {
    const meds = await getMedication();
    const updated = meds.map(med => med.id === medication.id ? medication : med);
    await AsyncStorage.setItem(MEDICATION_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.error('Error updating medication:', e);
    return false;
  }
}

export const deleteMedication = async (id: string): Promise<boolean> => {
  try {
    const meds = (await getMedication()).filter((m) => m.id !== id);
    await AsyncStorage.setItem(MEDICATION_KEY, JSON.stringify(meds));

    // remove related dose history
    const history = (await getDoseHistory()).filter((d) => d.medicationId !== id);
    await AsyncStorage.setItem(DOSE_HISTORY_KEY, JSON.stringify(history));

    return true;
  } catch (e) {
    console.error('Error deleting medication:', e);
    return false;
  }
};

/* ------------------------------------------------------------------ */
/*  Dose-history helpers                                              */
/* ------------------------------------------------------------------ */

export async function getDoseHistory(): Promise<DoseHistory[]> {
  try {
    const raw = await AsyncStorage.getItem(DOSE_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error getting dose history:', e);
    return [];
  }
}

export async function recordDose(
  medicationId: string, 
  taken: boolean,
  timestamp: string = new Date().toISOString()
): Promise<boolean> {
  try {
    const history = await getDoseHistory();
    const meds = await getMedication();
    const medication = meds.find(m => m.id === medicationId);
    
    if (!medication) {
      console.error('Medication not found');
      return false;
    }

    // Create the new dose record first
    const newRecord = {
      id: uuidv4(),
      medicationId,
      timestamp,
      taken,
      notes: ''
    };

    // Only decrement supply if it's for today or future
    const doseDate = new Date(timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (taken && doseDate >= today) {
      if (medication.medicationType === 'pill-count') {
        medication.currentPills = Math.max(0, medication.currentPills! - (medication.pillsPerDose || 1));
      } else {
        medication.currentDose = Math.max(0, medication.currentDose! - (medication.dosePerTake || 0));
      }
      await updateMedication(medication);
    }

    // Add the new record and save
    await AsyncStorage.setItem(DOSE_HISTORY_KEY, JSON.stringify([newRecord, ...history]));
    return true;
  } catch (error) {
    console.error('Error recording dose:', error);
    return false;
  }
}

export async function getTodaysDoses(): Promise<DoseHistory[]> {
  const today = new Date().toDateString();
  return (await getDoseHistory()).filter(
    (d) => new Date(d.timestamp).toDateString() === today,
  );
}

/* ------------------------------------------------------------------ */
/*  Supply management                                                 */
/* ------------------------------------------------------------------ */

export async function updateMedicationSupply(
  medicationId: string,
  newSupply: number,
  type: 'pill-count' | 'dose-based' = 'pill-count'
): Promise<boolean> {
  try {
    const meds = await getMedication();
    const updated = meds.map(med => {
      if (med.id === medicationId) {
        if (type === 'pill-count') {
          return { ...med, currentPills: newSupply };
        } else {
          return { ...med, currentDose: newSupply };
        }
      }
      return med;
    });
    await AsyncStorage.setItem(MEDICATION_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.error('Error updating supply:', e);
    return false;
  }
}

export async function refillMedication(
  medicationId: string,
  quantity: number,
  type: 'pill-count' | 'dose' = 'pill-count'
): Promise<boolean> {
  try {
    const meds = await getMedication();
    const updated = meds.map(med => {
      if (med.id === medicationId) {
        const now = new Date().toISOString();
        
        if (type === 'pill-count' || med.medicationType === 'pill-count') {
          return { 
            ...med, 
            currentPills: (med.currentPills || 0) + quantity,
            lastRefillDate: now,
            refillReminder: false, // Clear the reminder
            refillNotifiedAt: undefined
          };
        } else {
          return { 
            ...med, 
            currentDose: (med.currentDose || 0) + quantity,
            lastRefillDate: now,
            refillReminder: false, // Clear the reminder
            refillNotifiedAt: undefined
          };
        }
      }
      return med;
    });
    await AsyncStorage.setItem(MEDICATION_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.error('Error refilling medication:', e);
    return false;
  }
}


export async function clearMedicationNotification(medicationId: string): Promise<boolean> {
  try {
    const medications = await getMedication();
    const updated = medications.map(m => {
      if (m.id === medicationId) {
        return {
          ...m,
          refillReminder: false,  // Ensure this is set to false
          refillNotifiedAt: undefined, // Clear the timestamp
          // Don't modify current supply here - that should only happen on actual refill
        };
      }
      return m;
    });
    
    await AsyncStorage.setItem(MEDICATION_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.error('Error clearing notification:', e);
    return false;
  }
}


export async function setRefillNotification(medicationId: string): Promise<boolean> {
  try {
    const medications = await getMedication();
    const updated = medications.map(m => {
      if (m.id === medicationId) {
        return {
          ...m,
          refillReminder: true,
          refillNotifiedAt: new Date().toISOString() // Set current timestamp
        };
      }
      return m;
    });
    
    await AsyncStorage.setItem(MEDICATION_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.error('Error setting refill notification:', e);
    return false;
  }
}


/* ------------------------------------------------------------------ */
/*  Utilities                                                         */
/* ------------------------------------------------------------------ */

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([MEDICATION_KEY, DOSE_HISTORY_KEY]);
}

export async function checkMedicationNeedsRefill(medicationId: string): Promise<boolean> {
  try {
    const medications = await getMedication();
    const medication = medications.find(m => m.id === medicationId);
    
    if (!medication) return false;
    
    if (medication.medicationType === 'pill-count') {
      return (medication.currentPills ?? 0) <= (medication.refillAtPills ?? 0);
    } else {
      return (medication.currentDose ?? 0) <= (medication.refillAtDose ?? 0);
    }
  } catch (e) {
    console.error('Error checking refill status:', e);
    return false;
  }
}

export async function getDosesForDate(date: Date): Promise<DoseHistory[]> {
  try {
    const history = await getDoseHistory();
    const dateStr = date.toDateString();
    return history.filter(dose => new Date(dose.timestamp).toDateString() === dateStr);
  } catch (e) {
    console.error('Error getting doses for date:', e);
    return [];
  }
}