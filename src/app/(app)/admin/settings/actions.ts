
'use server';

import { getSettings, updateSettings, type AppSettings } from '@/services/settings-service';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth-utils';

export async function getSettingsAction(): Promise<AppSettings> {
    // Reading settings might be needed in various places, so we don't lock it down.
    return getSettings();
}

export async function updateSettingsAction(
  settingsData: Partial<Omit<AppSettings, 'id'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Writing settings should be an admin-only operation.
    // await requireAdmin();
    await updateSettings(settingsData);
    
    // Revalidate paths that depend on these settings to ensure they get fresh data.
    revalidatePath('/admin/settings', 'page');
    revalidatePath('/accounting/invoices', 'page');
    revalidatePath('/accounting/quotes', 'page');
    
    return { success: true };
  } catch (e: any) {
    let errorMessage = e.message || 'An unknown error occurred.';
    if (String(e.message).includes('Firestore is not initialized')) {
      errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
    }
    return { success: false, error: errorMessage };
  }
}
