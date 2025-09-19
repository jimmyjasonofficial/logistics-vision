
'use server';

import { ensureDbConnected } from '@/lib/firebase-admin';
import { getDownloadUrl } from './storage-service';
import { createDocumentWithCustomId } from '../services/firestore-service';
import { unstable_noStore } from 'next/cache';

export type Expense = {
  id: string;
  category: 'Fuel' | 'Repairs' | 'Maintenance' | 'Tyres' | 'Tolls' | 'Admin' | 'Food & Lodging' | 'Salaries' | 'Other';
  amount: number;
  date: string;
  description: string;
  paidBy: 'Cash' | 'Card' | 'EFT' | 'Petty Cash';
  tripId?: string | null;
  hasAttachment: boolean | false;
  notes?: string;
  attachmentPath?: string;
};

export type ExpenseWithUrl = Expense & {
    attachmentUrl?: string | null;
}

export type ExpenseData = Omit<Expense, 'id'>;

export async function createExpense(expenseData: ExpenseData): Promise<Expense> {
  const db = ensureDbConnected();
  // const docRef = db.collection('expenses').doc();
  // const newExpense = {
  //     id: docRef.id,
  //     hasAttachment: false, // Default to false
  //     ...expenseData,
  // } as Expense;

  const newExpense = await createDocumentWithCustomId<ExpenseData>('expenses', 'EXP', expenseData);
  // await docRef.set(newExpense);


  return newExpense;
}

export async function updateExpense(id: string, expenseData: Partial<ExpenseData>): Promise<void> {
  const db = ensureDbConnected();
  const docRef = db.collection('expenses').doc(id);
  await docRef.update(expenseData);
}

export async function deleteExpense(id: string): Promise<void> {
  const db = ensureDbConnected();
  const docRef = db.collection('expenses').doc(id);
  await docRef.delete();
}

export async function getExpenses(options: { startDate?: string, endDate?: string, tripId?: string } = {}): Promise<Expense[]> {
  unstable_noStore();
  try {
    const db = ensureDbConnected();
    let query: FirebaseFirestore.Query = db.collection('expenses');
    
    if (options.startDate) {
        query = query.where('date', '>=', options.startDate);
    }
    if (options.endDate) {
        query = query.where('date', '<=', options.endDate);
    }
    if (options.tripId) {
        query = query.where('tripId', '==', options.tripId);
    }

    if (!options.tripId) {
        query = query.orderBy('date', 'desc');
    }

    const expensesSnapshot = await query.get();
    if (expensesSnapshot.empty) {
      return [];
    }
    return expensesSnapshot.docs.map(doc => doc.data() as Expense);
  } catch (error: any) {
    console.warn(`Could not connect to Firestore to get expenses. Returning empty array. Error: ${error.message}`);
    return [];
  }
}

export async function getExpenseById(id: string): Promise<ExpenseWithUrl | null> {
  try {
    const db = ensureDbConnected();
    const docRef = db.collection('expenses').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }
    const expense = docSnap.data() as Expense;
    const attachmentUrl = await getDownloadUrl(expense.attachmentPath);

    return { ...expense, attachmentUrl };
  } catch (error: any) {
    console.warn(`Could not connect to Firestore to get expense ${id}. Returning null. Error: ${error.message}`);
    return null;
  }
}
