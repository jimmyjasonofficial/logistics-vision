
'use server';

import {
  createInvoice,
  updateInvoice,
  deleteInvoice,
  type InvoiceData,
  type LineItem,
} from '@/services/invoice-service';
import { uploadFile } from '@/services/storage-service';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth-utils';

function parseLineItems(formData: FormData): LineItem[] {
    const lineItems: LineItem[] = [];
    let index = 0;
    while(formData.has(`lineItems[${index}].description`)) {
        lineItems.push({
            item: formData.get(`lineItems[${index}].item`) as string | undefined,
            description: formData.get(`lineItems[${index}].description`) as string,
            quantity: parseFloat(formData.get(`lineItems[${index}].quantity`) as string),
            unitPrice: parseFloat(formData.get(`lineItems[${index}].unitPrice`) as string),
            discount: parseFloat(formData.get(`lineItems[${index}].discount`) as string),
            account: formData.get(`lineItems[${index}].account`) as string | undefined,
            taxRate: formData.get(`lineItems[${index}].taxRate`) as string | undefined,
        });
        index++;
    }
    return lineItems;
}


export async function createInvoiceAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; invoiceId?: string }> {
  try {
    const file = formData.get('attachment') as File | null;
    const lineItems = parseLineItems(formData);

    const invoiceData: InvoiceData = {
      customerId: formData.get('customerId') as string,
      customer: formData.get('customer') as string,
      reference: formData.get('reference') as string | undefined,
      dateIssued: formData.get('dateIssued') as string,
      dueDate: formData.get('dueDate') as string,
      taxType: formData.get('taxType') as InvoiceData['taxType'],
      lineItems,
      subtotal: parseFloat(formData.get('subtotal') as string),
      totalTax: parseFloat(formData.get('totalTax') as string),
      total: parseFloat(formData.get('total') as string),
      status: 'Unpaid',
    };
    
    // Create the initial invoice record
    const newInvoice = await createInvoice(invoiceData);

    // If there's a file, upload it and update the record
    if (file && file.size > 0) {
        const { gsPath } = await uploadFile(file, `invoices/${newInvoice.id}`);
        await updateInvoice(newInvoice.id, {
            hasAttachment: true,
            attachmentPath: gsPath,
        });
    }

    revalidatePath('/accounting/invoices');
    revalidatePath('/accounting/pnl');
    revalidatePath('/dashboard');
    return { success: true, invoiceId: newInvoice.id };

  } catch (e: any) {
    let errorMessage = e.message || 'An unknown error occurred.';
    if (String(e.message).includes('Firestore is not initialized')) {
      errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function updateInvoiceAction(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const file = formData.get('attachment') as File | null;
    const lineItems = parseLineItems(formData);

    const invoiceData: Partial<InvoiceData> = {
      customerId: formData.get('customerId') as string,
      customer: formData.get('customer') as string,
      reference: formData.get('reference') as string | undefined,
      dateIssued: formData.get('dateIssued') as string,
      dueDate: formData.get('dueDate') as string,
      status: formData.get('status') as InvoiceData['status'],
      taxType: formData.get('taxType') as InvoiceData['taxType'],
      lineItems,
      subtotal: parseFloat(formData.get('subtotal') as string),
      totalTax: parseFloat(formData.get('totalTax') as string),
      total: parseFloat(formData.get('total') as string),
    };

    if (file && file.size > 0) {
        const { gsPath } = await uploadFile(file, `invoices/${id}`);
        invoiceData.hasAttachment = true;
        invoiceData.attachmentPath = gsPath;
    }

    await updateInvoice(id, invoiceData);

    revalidatePath('/accounting/invoices');
    revalidatePath(`/accounting/invoices/${id}`);
    revalidatePath('/accounting/pnl');
    revalidatePath('/dashboard');
    return { success: true };

  } catch (e: any)
  {
    let errorMessage = e.message || 'An unknown error occurred.';
    if (String(e.message).includes('Firestore is not initialized')) {
      errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function deleteInvoiceAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // await requireAdmin();
    await deleteInvoice(id);
    revalidatePath('/accounting/invoices');
    revalidatePath('/accounting/pnl');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e: any) {
    let errorMessage = e.message || 'An unknown error occurred.';
    if (String(e.message).includes('Firestore is not initialized')) {
      errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function markInvoiceAsPaidAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateInvoice(id, { status: 'Paid' });
    revalidatePath('/accounting/invoices');
    revalidatePath(`/accounting/invoices/${id}`);
    revalidatePath('/accounting/pnl');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e: any) {
    let errorMessage = e.message || 'An unknown error occurred.';
    if (String(e.message).includes('Firestore is not initialized')) {
      errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
    }
    return { success: false, error: errorMessage };
  }
}
