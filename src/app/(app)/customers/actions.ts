
'use server';

import { createCustomer, updateCustomer, type CustomerData } from '@/services/customer-service';
import { revalidatePath } from 'next/cache';

export async function createCustomerAction(data: CustomerData): Promise<{ success: boolean, error?: string, customerId?: string }> {
    try {
        const newCustomer = await createCustomer(data);
        revalidatePath('/customers');
        return { success: true, customerId: newCustomer.id };
    } catch(e: any) {
        let errorMessage = e.message || "An unknown error occurred.";
        if (String(e.message).includes('Firestore is not initialized')) {
             errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
        }
        return { success: false, error: errorMessage };
    }
}

export async function updateCustomerAction(id: string, data: CustomerData): Promise<{ success: boolean, error?: string }> {
    try {
        await updateCustomer(id, data);
        revalidatePath('/customers');
        revalidatePath(`/customers/${id}`);
        return { success: true };
    } catch(e: any) {
        let errorMessage = e.message || "An unknown error occurred.";
         if (String(e.message).includes('Firestore is not initialized')) {
             errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
        }
        return { success: false, error: errorMessage };
    }
}

export async function deactivateCustomerAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await updateCustomer(id, { status: 'Inactive' });
    revalidatePath('/customers');
    revalidatePath(`/customers/${id}`);
    return { success: true };
  } catch (e: any) {
    let errorMessage = e.message || 'An unknown error occurred.';
    if (String(e.message).includes('Firestore is not initialized')) {
        errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
    }
    return { success: false, error: errorMessage };
  }
}
