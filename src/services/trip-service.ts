
'use server';

import { ensureDbConnected } from '@/lib/firebase-admin';
import { createDocumentWithCustomId } from '../services/firestore-service';
import { unstable_noStore } from 'next/cache';

export type Trip = {
  id: string;
  customer: string;
  customerId: string;
  origin: string;
  destination: string;
  driver: string;
  driverId: string;
  status: 'Planned' | 'In Transit' | 'Delivered' | 'Cancelled' | 'Pending';
  pickupTime: string;
  estimatedDelivery: string;
  vehicleId: string;
  distance: number;
  revenue: number;
  notes: string;
  truck: string;
};

export type TripData = Omit<Trip, 'id'>;

export async function createTrip(tripData: TripData): Promise<Trip> {
  const db = ensureDbConnected();
  const docRef = db.collection('trips').doc();
  // const newTrip = {
  //     id: docRef.id,
  //     ...tripData,
  // };

  const newTrip = await createDocumentWithCustomId<TripData>('trips', 'TRPS', tripData);
  // await docRef.set(newTrip);
  return newTrip;
}


export async function updateTrip(id: string, tripData: Partial<TripData>): Promise<void> {
  const db = ensureDbConnected();
  const docRef = db.collection('trips').doc(id);
  await docRef.update({ ...tripData });
}

export async function getTrips(options: { startDate?: string, endDate?: string, customerId?: string } = {}): Promise<Trip[]> {

  unstable_noStore();

  try {
    const db = ensureDbConnected();
    let query: FirebaseFirestore.Query = db.collection('trips');

    if (options.startDate) {
        query = query.where('estimatedDelivery', '>=', options.startDate);
    }
    if (options.endDate) {
        query = query.where('estimatedDelivery', '<=', options.endDate);
    }
    if (options.customerId) {
        query = query.where('customerId', '==', options.customerId);
    }

    if (options.startDate || options.endDate) {
      query = query.orderBy('estimatedDelivery', 'desc');
    } else {
      query = query.orderBy('pickupTime', 'desc');
    }

    const tripsSnapshot = await query.get();
    if (tripsSnapshot.empty) {
      return [];
    }
    return tripsSnapshot.docs.map((doc) => doc.data() as Trip);
  } catch (error: any) {
    console.warn(`Could not connect to Firestore to get trips. Returning empty array. Error: ${error.message}`);
    return [];
  }
}

export async function getTripById(id: string): Promise<Trip | null> {
  try {
    const db = ensureDbConnected();
    const docRef = db.collection('trips').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }
    return docSnap.data() as Trip;
  } catch (error: any) {
    console.warn(`Could not connect to Firestore to get trip ${id}. Returning null. Error: ${error.message}`);
    return null;
  }
}
