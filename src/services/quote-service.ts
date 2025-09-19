
'use server';

import { ensureDbConnected } from '@/lib/firebase-admin';
import type { LineItem } from './invoice-service'; // Reuse line item type
import { getDownloadUrl } from './storage-service';
import { createDocumentWithCustomId } from './firestore-service';
import { unstable_noStore } from 'next/cache';

export type Quote = {
  id: string;
  customer: string;
  driver: string;
  customerId: string;
  dateIssued: string;
  expiryDate: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Expired';
  reference?: string;
  taxType: 'exclusive' | 'inclusive' | 'no_tax';
  lineItems: LineItem[];
  subtotal: number;
  totalTax: number;
  total: number;
  hasAttachment?: boolean | false;
  attachmentPath?: string;
};

export type QuoteWithUrl = Quote & {
    attachmentUrl?: string | null;
};

export type QuoteData = Omit<Quote, 'id'>;

export async function createQuote(quoteData: QuoteData): Promise<Quote> {
  const db = ensureDbConnected();
  // const docRef = db.collection('quotes').doc();
  // const newQuote: Quote = {
  //     id: docRef.id,
  //     hasAttachment: false,
  //     ...quoteData,
  // } as Quote;
  // await docRef.set(newQuote);
  
  const newQuote = await createDocumentWithCustomId<QuoteData>('quotes', 'Q', quoteData);

  return newQuote;
}

export async function updateQuote(id: string, quoteData: Partial<QuoteData>): Promise<void> {
  const db = ensureDbConnected();
  const docRef = db.collection('quotes').doc(id);
  await docRef.update(quoteData);
}

export async function deleteQuote(id: string): Promise<void> {
  const db = ensureDbConnected();
  const docRef = db.collection('quotes').doc(id);
  await docRef.delete();
}

export async function getQuotes(): Promise<Quote[]> {
  
  unstable_noStore();

  try {
    const db = ensureDbConnected();
    const quotesSnapshot = await db.collection('quotes').orderBy('dateIssued', 'desc').get();
    if (quotesSnapshot.empty) {
      return [];
    }
    return quotesSnapshot.docs.map((doc) => doc.data() as Quote);
  } catch (error: any) {
    console.warn(`Could not connect to Firestore to get quotes. Returning empty array. Error: ${error.message}`);
    return [];
  }
}

export async function getQuoteById(id: string): Promise<QuoteWithUrl | null> {
  try {
    const db = ensureDbConnected();
    const docRef = db.collection('quotes').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }
    const quote = docSnap.data() as Quote;
    const attachmentUrl = await getDownloadUrl(quote.attachmentPath);

    return { ...quote, attachmentUrl };
  } catch (error: any) {
    console.warn(`Could not connect to Firestore to get quote ${id}. Returning null. Error: ${error.message}`);
    return null;
  }
}
