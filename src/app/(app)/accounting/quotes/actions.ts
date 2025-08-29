
'use server';

import {
  createQuote,
  updateQuote,
  deleteQuote,
  getQuoteById,
  type QuoteData,
  type Quote,
  type QuoteWithUrl,
} from '@/services/quote-service';
import { uploadFile } from '@/services/storage-service';
import { revalidatePath } from 'next/cache';
import type { LineItem } from '@/services/invoice-service';

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


export async function createQuoteAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; quoteId?: string }> {
  try {
    const file = formData.get('attachment') as File | null;
    const lineItems = parseLineItems(formData);
    
    const quoteData: QuoteData = {
      customerId: formData.get('customerId') as string,
      customer: formData.get('customer') as string,
      reference: formData.get('reference') as string | undefined,
      dateIssued: formData.get('dateIssued') as string,
      expiryDate: formData.get('expiryDate') as string,
      status: formData.get('status') as QuoteData['status'],
      taxType: formData.get('taxType') as QuoteData['taxType'],
      lineItems,
      subtotal: parseFloat(formData.get('subtotal') as string),
      totalTax: parseFloat(formData.get('totalTax') as string),
      total: parseFloat(formData.get('total') as string),
    };

    const newQuote = await createQuote(quoteData);

    if (file && file.size > 0) {
        const { gsPath } = await uploadFile(file, `quotes/${newQuote.id}`);
        await updateQuote(newQuote.id, {
            hasAttachment: true,
            attachmentPath: gsPath,
        });
    }

    revalidatePath('/accounting/quotes');
    return { success: true, quoteId: newQuote.id };

  } catch (e: any) {
    let errorMessage = e.message || 'An unknown error occurred.';
    if (String(e.message).includes('Firestore is not initialized')) {
      errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function updateQuoteAction(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const file = formData.get('attachment') as File | null;
    const lineItems = parseLineItems(formData);

    const quoteData: Partial<QuoteData> = {
      customerId: formData.get('customerId') as string,
      customer: formData.get('customer') as string,
      reference: formData.get('reference') as string | undefined,
      dateIssued: formData.get('dateIssued') as string,
      expiryDate: formData.get('expiryDate') as string,
      status: formData.get('status') as QuoteData['status'],
      taxType: formData.get('taxType') as QuoteData['taxType'],
      lineItems,
      subtotal: parseFloat(formData.get('subtotal') as string),
      totalTax: parseFloat(formData.get('totalTax') as string),
      total: parseFloat(formData.get('total') as string),
    };

    if (file && file.size > 0) {
        const { gsPath } = await uploadFile(file, `quotes/${id}`);
        quoteData.hasAttachment = true;
        quoteData.attachmentPath = gsPath;
    }

    await updateQuote(id, quoteData);

    revalidatePath('/accounting/quotes');
    revalidatePath(`/accounting/quotes/${id}`);
    return { success: true };
  } catch (e: any) {
    let errorMessage = e.message || 'An unknown error occurred.';
    if (String(e.message).includes('Firestore is not initialized')) {
      errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function deleteQuoteAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteQuote(id);
    revalidatePath('/accounting/quotes');
    return { success: true };
  } catch (e: any) {
    let errorMessage = e.message || 'An unknown error occurred.';
    if (String(e.message).includes('Firestore is not initialized')) {
      errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function getQuoteByIdAction(id: string): Promise<QuoteWithUrl | null> {
    return getQuoteById(id);
}

export async function sendQuoteAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await updateQuote(id, { status: 'Sent' });
    revalidatePath('/accounting/quotes');
    revalidatePath(`/accounting/quotes/${id}`);
    return { success: true };
  } catch (e: any) {
    let errorMessage = e.message || 'An unknown error occurred.';
    if (String(e.message).includes('Firestore is not initialized')) {
      errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function acceptQuoteAction(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await updateQuote(id, { status: 'Accepted' });
        revalidatePath('/accounting/quotes');
        revalidatePath(`/accounting/quotes/${id}`);
        return { success: true };
    } catch (e: any) {
        let errorMessage = e.message || 'An unknown error occurred.';
        if (String(e.message).includes('Firestore is not initialized')) {
          errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
        }
        return { success: false, error: errorMessage };
    }
}
