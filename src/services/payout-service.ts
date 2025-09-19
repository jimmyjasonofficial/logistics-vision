
'use server';

import { ensureDbConnected } from '@/lib/firebase-admin';
import { createDocumentWithCustomId } from './firestore-service';

export type Payout = {
  id: string;
  payoutDate: string;
  status: 'Completed' | 'Scheduled';
  totalAmount: number;
  commissionsCount: number;
};

export type PayoutData = Omit<Payout, 'id'>;

export async function createPayout(data: PayoutData): Promise<Payout> {
  const db = ensureDbConnected();
  // const docRef = db.collection('payouts').doc();
  // const newPayout: Payout = { id: docRef.id, ...data };

  // await docRef.set(newPayout);
  
  const newPayout = await createDocumentWithCustomId<PayoutData>('payouts', 'PO', data);


  return newPayout;
}

export async function getPayouts(): Promise<Payout[]> {
  try {
    const db = ensureDbConnected();
    const snapshot = await db.collection('payouts').orderBy('payoutDate', 'desc').get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => doc.data() as Payout);
  } catch (error: any) {
    console.warn(`Could not connect to Firestore to get payouts. Returning empty array. Error: ${error.message}`);
    return [];
  }
}
