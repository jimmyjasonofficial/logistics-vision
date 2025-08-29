
'use server';

import {
  parseExpenseReceipt,
  ExpenseParserInput,
  ExpenseParserOutput,
} from '@/ai/flows/expense-parser-flow';
import {
  createExpense,
  updateExpense,
  deleteExpense,
  type ExpenseData,
} from '@/services/expense-service';
import { uploadFile } from '@/services/storage-service';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth-utils';

export async function parseReceiptAction(
  input: ExpenseParserInput
): Promise<ExpenseParserOutput | { error: string }> {
  try {
    const result = await parseExpenseReceipt(input);
    return result;
  } catch (e: any) {
    console.error('AI receipt parsing failed:', e.message || 'An unknown error occurred.');
    return { error: e.message || 'Failed to parse receipt with AI.' };
  }
}

export async function createExpenseAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; expenseId?: string }> {
  try {
    const file = formData.get('attachment') as File | null;

    const expenseData: Omit<ExpenseData, 'hasAttachment' | 'attachmentPath'> = {
      date: formData.get('date') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as ExpenseData['category'],
      amount: parseFloat(formData.get('amount') as string),
      paidBy: formData.get('paidBy') as ExpenseData['paidBy'],
      tripId: (formData.get('tripId') as string) || undefined,
      notes: (formData.get('notes') as string) || undefined,
    };
    
    // Create the initial expense record
    const newExpense = await createExpense(expenseData);

    // If there's a file, upload it and update the record
    if (file && file.size > 0) {
        const { gsPath } = await uploadFile(file, `expenses/${newExpense.id}`);
        await updateExpense(newExpense.id, {
            hasAttachment: true,
            attachmentPath: gsPath,
        });
    }

    revalidatePath('/accounting/expenses');
    revalidatePath('/accounting/pnl');
    return { success: true, expenseId: newExpense.id };

  } catch (e: any) {
    let errorMessage = e.message || 'An unknown error occurred.';
    if (String(e.message).includes('Firestore is not initialized')) {
      errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function updateExpenseAction(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const file = formData.get('attachment') as File | null;
    
    const expenseData: Partial<ExpenseData> = {
      date: formData.get('date') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as ExpenseData['category'],
      amount: parseFloat(formData.get('amount') as string),
      paidBy: formData.get('paidBy') as ExpenseData['paidBy'],
      tripId: (formData.get('tripId') as string) || undefined,
      notes: (formData.get('notes') as string) || undefined,
    };

    if (file && file.size > 0) {
        const { gsPath } = await uploadFile(file, `expenses/${id}`);
        expenseData.hasAttachment = true;
        expenseData.attachmentPath = gsPath;
    }

    await updateExpense(id, expenseData);

    revalidatePath('/accounting/expenses');
    revalidatePath(`/accounting/expenses/${id}`);
    revalidatePath('/accounting/pnl');
    return { success: true };

  } catch (e: any) {
    let errorMessage = e.message || 'An unknown error occurred.';
    if (String(e.message).includes('Firestore is not initialized')) {
      errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function deleteExpenseAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    await deleteExpense(id);
    revalidatePath('/accounting/expenses');
    revalidatePath(`/accounting/pnl`);
    return { success: true };
  } catch (e: any) {
    let errorMessage = e.message || 'An unknown error occurred.';
    if (String(e.message).includes('Firestore is not initialized')) {
      errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
    }
    return { success: false, error: errorMessage };
  }
}
