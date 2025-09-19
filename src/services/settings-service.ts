
'use server';

import { ensureDbConnected } from '@/lib/firebase-admin';
import { unstable_noStore } from 'next/cache';

export type TaxRate = {
  name: string;
  rate: number;
};

export type AppSettings = {
  id: 'global'; // Use a singleton document
  taxRates: TaxRate[];
  companyName: string;
  companyAddress: string;
  currency: string;
  taxId: string;
  defaultPaymentTerms: number;
  invoiceFooter: string;
};

const SETTINGS_DOC_ID = 'global';
const defaultSettings: AppSettings = {
    id: SETTINGS_DOC_ID,
    taxRates: [
    { name: 'Tax on Sales (15%)', rate: 15.0 },
    { name: 'Exempt', rate: 0.0 },
    ],
    companyName: 'Logistics Vision Inc.',
    companyAddress: '123 Logistics Lane, Suite 100\nTransport City, TX 75001',
    currency: 'usd',
    taxId: '',
    defaultPaymentTerms: 30,
    invoiceFooter: 'Thank you for your business! Please contact us with any questions.',
};

export async function getSettings(): Promise<AppSettings> {

  unstable_noStore();
    try {
        const db = ensureDbConnected();
        const docRef = db.collection('settings').doc(SETTINGS_DOC_ID);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return docSnap.data() as AppSettings;
        } else {
             console.warn('Settings document not found, returning default settings.');
            return defaultSettings;
        }
    } catch (error) {
        console.warn(`Could not connect to Firestore to get settings. Returning defaults. Error: ${(error as Error).message}`);
        return defaultSettings;
    }
}

export async function updateSettings(data: Partial<Omit<AppSettings, 'id'>>): Promise<void> {
  const db = ensureDbConnected();
  const docRef = db.collection('settings').doc(SETTINGS_DOC_ID);
  // Using set with merge is safer for a singleton settings document.
  await docRef.set(data, { merge: true });
}
