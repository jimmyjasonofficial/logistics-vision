
'use server';

import { ensureDbConnected } from '@/lib/firebase-admin';
import { createDocumentWithCustomId } from './firestore-service';
import { unstable_noStore } from 'next/cache';

export type EmployeePayrollData = {
  employeeId: string;
  name: string;
  basePay: number;
  overtime: number;
  bonus: number;
  taxes: number;
  deductions: number;
};

export type PayrollRun = {
  id: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  paymentDate: string;
  status: 'Draft' | 'Approved' | 'Paid';
  employees: EmployeePayrollData[];
};

export type PayrollRunData = Omit<PayrollRun, 'id'>;

export async function createPayrollRun(data: PayrollRunData): Promise<PayrollRun> {
  const db = ensureDbConnected();
  // const docRef = db.collection('payrollRuns').doc();
  // const newRun: PayrollRun = { id: docRef.id, ...data };
  // await docRef.set(newRun);

  
  const newRun = await createDocumentWithCustomId<PayrollRunData>('payrollRuns', 'PR', data);


  return newRun;
}

export async function updatePayrollRun(id: string, data: Partial<PayrollRunData>): Promise<void> {
  const db = ensureDbConnected();
  const docRef = db.collection('payrollRuns').doc(id);
  await docRef.update(data);
}

export async function finalizePayrollRun(id: string): Promise<void> {
    const db = ensureDbConnected();
    const docRef = db.collection('payrollRuns').doc(id);
    await docRef.update({ status: 'Paid' });
}

export async function getPayrollRuns(): Promise<PayrollRun[]> {

  unstable_noStore();

  try {
    const db = ensureDbConnected();
    const snapshot = await db.collection('payrollRuns').orderBy('paymentDate', 'desc').get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => doc.data() as PayrollRun);
  } catch (error: any) {
    console.warn(`Could not connect to Firestore to get payroll runs. Returning empty array. Error: ${error.message}`);
    return [];
  }
}

export async function getPayrollRunById(id: string): Promise<PayrollRun | null> {
  try {
    const db = ensureDbConnected();
    const doc = await db.collection('payrollRuns').doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as PayrollRun;
  } catch (error: any) {
    console.warn(`Could not connect to Firestore to get payroll run ${id}. Returning null. Error: ${error.message}`);
    return null;
  }
}
