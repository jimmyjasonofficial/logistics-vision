
'use server';

import { ensureDbConnected } from '@/lib/firebase-admin';

export type Customer = {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'Active' | 'Inactive';
  phone: string;
  address: string;
};

export type CustomerData = Omit<Customer, 'id'>;


export async function createCustomer(customerData: CustomerData): Promise<Customer> {
  const db = ensureDbConnected();
  const docRef = db.collection('customers').doc();
  const newCustomer = {
      id: docRef.id,
      ...customerData,
  };
  await docRef.set(newCustomer);
  return newCustomer;
}

export async function updateCustomer(id: string, customerData: Partial<CustomerData>): Promise<void> {
  const db = ensureDbConnected();
  const docRef = db.collection('customers').doc(id);
  await docRef.update(customerData);
}


export async function getCustomers(): Promise<Customer[]> {
    try {
        const db = ensureDbConnected();
        const customersSnapshot = await db.collection('customers').get();
        if (customersSnapshot.empty) {
          return [];
        }
        const customers = customersSnapshot.docs.map(doc => doc.data() as Customer);
        customers.sort((a, b) => a.company.localeCompare(b.company));
        return customers;
    } catch (error: any) {
        console.warn(`Could not connect to Firestore to get customers. Returning empty array. Error: ${error.message}`);
        return [];
    }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const db = ensureDbConnected();
    const docRef = db.collection('customers').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }
    return docSnap.data() as Customer;
  } catch (error: any) {
    console.warn(`Could not connect to Firestore to get customer ${id}. Returning null. Error: ${error.message}`);
    return null;
  }
}
