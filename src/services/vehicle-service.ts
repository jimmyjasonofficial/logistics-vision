
'use server';

import { ensureDbConnected } from '@/lib/firebase-admin';
import { createDocumentWithCustomId } from './firestore-service';
import { unstable_noStore } from 'next/cache';

export type Vehicle = {
  id: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  status: 'Operational' | 'In Repair' | 'Awaiting Inspection';
  maintenanceDue: string;
  driverId?: string;
  driverName?: string;
};

export type VehicleData = Omit<Vehicle, 'id'>;

export async function createVehicle(vehicleData: VehicleData): Promise<Vehicle> {
  const db = ensureDbConnected();
  // const docRef = db.collection('vehicles').doc();
  // const newVehicle = {
  //     id: docRef.id,
  //     ...vehicleData,
  // };
  // await docRef.set(newVehicle);
  
  const newVehicle = await createDocumentWithCustomId<VehicleData>('vehicles', 'VEH', vehicleData);

  return newVehicle;
}

export async function updateVehicle(id: string, vehicleData: VehicleData): Promise<void> {
  const db = ensureDbConnected();
  const docRef = db.collection('vehicles').doc(id);
  await docRef.update(vehicleData);
}

export async function getVehicles(): Promise<Vehicle[]> {

  unstable_noStore();
  try {
    const db = ensureDbConnected();
    const vehiclesSnapshot = await db.collection('vehicles').get();
    if (vehiclesSnapshot.empty) {
      return [];
    }
    const vehicles = vehiclesSnapshot.docs.map(doc => doc.data() as Vehicle);
    vehicles.sort((a,b) => a.model.localeCompare(b.model));
    return vehicles;
  } catch (error: any) {
    console.warn(`Could not connect to Firestore to get vehicles. Returning empty array. Error: ${error.message}`);
    return [];
  }
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  try {
    const db = ensureDbConnected();
    const docRef = db.collection('vehicles').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }
    return docSnap.data() as Vehicle;
  } catch (error: any) {
    console.warn(`Could not connect to Firestore to get vehicle ${id}. Returning null. Error: ${error.message}`);
    return null;
  }
}
