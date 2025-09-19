
'use server';

import { ensureDbConnected } from '@/lib/firebase-admin';
import { getDownloadUrl } from './storage-service';
import { createDocumentWithCustomId } from './firestore-service';

export type LineItem = {
  item?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  account?: string;
  taxRate?: string;
};

export type Invoice = {
  id: string;
  customer: string;
  customerId: string;
  tripId?: string;
  dateIssued: string;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Draft';
  reference?: string;
  taxType: 'exclusive' | 'inclusive' | 'no_tax';
  lineItems: LineItem[];
  subtotal: number;
  totalTax: number;
  total: number;
  hasAttachment?: boolean | false;
  attachmentPath?: string;
};

export type InvoiceWithUrl = Invoice & {
    attachmentUrl?: string | null;
}

export type InvoiceData = Omit<Invoice, 'id'>;

export async function createInvoice(invoiceData: InvoiceData): Promise<Invoice> {
  const db = ensureDbConnected();
  // const docRef = db.collection('invoices').doc();
  // const newInvoice: Invoice = {
  //     id: docRef.id,
  //     hasAttachment: false,
  //     ...invoiceData,
  // } as Invoice;
  // await docRef.set(newInvoice);

  const newInvoice = await createDocumentWithCustomId<InvoiceData>('invoices', 'INV', invoiceData);

  return newInvoice;
}

export async function updateInvoice(id: string, invoiceData: Partial<InvoiceData>): Promise<void> {
  const db = ensureDbConnected();
  const docRef = db.collection('invoices').doc(id);
  await docRef.update(invoiceData);
}

export async function deleteInvoice(id: string): Promise<void> {
  const db = ensureDbConnected();
  const docRef = db.collection('invoices').doc(id);
  await docRef.delete();
}

export async function getInvoices(options: { startDate?: string, endDate?: string, customerId?: string } = {}): Promise<Invoice[]> {
  try {
    const db = ensureDbConnected();
    let query: FirebaseFirestore.Query = db.collection('invoices');
    
    if (options.startDate) {
        query = query.where('dateIssued', '>=', options.startDate);
    }
    if (options.endDate) {
        query = query.where('dateIssued', '<=', options.endDate);
    }
    if (options.customerId) {
        query = query.where('customerId', '==', options.customerId);
    }
    
    query = query.orderBy('dateIssued', 'desc');

    const invoicesSnapshot = await query.get();
    if (invoicesSnapshot.empty) {
      return [];
    }
    return invoicesSnapshot.docs.map((doc) => doc.data() as Invoice);
  } catch (error: any) {
     console.warn(`Could not connect to Firestore to get invoices. Returning empty array. Error: ${error.message}`);
     return [];
  }
}

export async function getInvoiceById(id: string): Promise<InvoiceWithUrl | null> {
  try {
    const db = ensureDbConnected();
    const docRef = db.collection('invoices').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }
    const invoice = docSnap.data() as Invoice;
    const attachmentUrl = await getDownloadUrl(invoice.attachmentPath);

    return { ...invoice, attachmentUrl };
  } catch (error: any) {
    console.warn(`Could not connect to Firestore to get invoice ${id}. Returning null. Error: ${error.message}`);
    return null;
  }
}
