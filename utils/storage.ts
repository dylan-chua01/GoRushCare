import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const MEDICATION_KEY = '@medications';
const DOSE_HISTORY_KEY = '@dose_history';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  startDate: string;
  duration: string;
  color: string;
  reminderEnabled: boolean;
  currentSupply: number;
  totalSupply: number;
  refillAt: number;
  refillReminder: boolean;
  lastRefillDate?: string;
}

export interface DoseHistory {
  notes: string;
  id: string;
  medicationId: string;
  timestamp: string;   // ISO string
  taken: boolean;
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
    timestamp: string = new Date().toISOString(),
  ): Promise<void> {
    const history = await getDoseHistory();
    history.unshift({
        id: uuidv4(),
        medicationId,
        timestamp,
        taken,
        notes: ''
    });
    await AsyncStorage.setItem(DOSE_HISTORY_KEY, JSON.stringify(history));
  }

export async function getTodaysDoses(): Promise<DoseHistory[]> {
  const today = new Date().toDateString();
  return (await getDoseHistory()).filter(
    (d) => new Date(d.timestamp).toDateString() === today,
  );
}

/* ------------------------------------------------------------------ */
/*  Utilities                                                         */
/* ------------------------------------------------------------------ */

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([MEDICATION_KEY, DOSE_HISTORY_KEY]);
}