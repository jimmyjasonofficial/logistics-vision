
'use server';

import { ensureDbConnected } from '@/lib/firebase-admin';

export type FuelLog = {
  id: string;
  vehicleId: string;
  driverId: string;
  date: string;
  liters: number;
  cost: number;
  kmDriven: number;
};

export type FuelLogData = Omit<FuelLog, 'id'>;

export async function createFuelLog(data: FuelLogData): Promise<FuelLog> {
  const db = ensureDbConnected();
  const docRef = db.collection('fuelLogs').doc();
  const newLog: FuelLog = {
      id: docRef.id,
      ...data,
  };
  await docRef.set(newLog);
  // const newLog = await createDocumentWithCustomId<FuelLogData>('expenses', 'EXP', data);
  
  return newLog;
}

export async function getFuelLogs(): Promise<FuelLog[]> {
  try {
    const db = ensureDbConnected();
    const snapshot = await db.collection('fuelLogs').orderBy('date', 'desc').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map((doc) => doc.data() as FuelLog);
  } catch (error: any) {
    console.warn(`Could not connect to Firestore to get fuel logs. Returning empty array. Error: ${error.message}`);
    return [];
  }
}
