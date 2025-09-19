
'use server';

import { ensureDbConnected } from '@/lib/firebase-admin';
import { unstable_noStore } from 'next/cache';

export type Commission = {
  id: string;
  broker: string;
  tripId: string;
  status: 'Paid' | 'Pending';
  payoutDate: string;
  payoutId?: string;
};

export type CommissionData = Omit<Commission, 'id'>;

export async function getCommissions(options: { status?: 'Paid' | 'Pending' } = {}): Promise<Commission[]> {
  unstable_noStore();

  try {
    const db = ensureDbConnected();
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection('commissions');
    if (options.status) {
        query = query.where('status', '==', options.status);
    }
    const snapshot = await query.orderBy('payoutDate', 'desc').get();

    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map((doc) => doc.data() as Commission);
  } catch (error: any) {
    console.warn(`Could not connect to Firestore to get commissions. Returning empty array. Error: ${error.message}`);
    return [];
  }
}

export async function updateCommissionsStatus(commissionIds: string[], payoutId: string, payoutDate: string): Promise<void> {
    const db = ensureDbConnected();
    const batch = db.batch();

    commissionIds.forEach(id => {
        const commissionRef = db.collection('commissions').doc(id);
        batch.update(commissionRef, {
            status: 'Paid',
            payoutId: payoutId,
            payoutDate: payoutDate,
        });
    });

    await batch.commit();
}
