'use server';

import { deleteDriver } from '@/services/employee-service';
import { createVehicle, deleteVehicle, updateVehicle } from '@/services/vehicle-service';
import type { VehicleData } from '@/services/vehicle-service';
import { revalidatePath } from 'next/cache';

export async function deleteDriverAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // await requireAdmin();
    await deleteDriver(id);
    revalidatePath('/fleet/drivers');

    return { success: true };
  } catch (e: any) {
    let errorMessage = e.message || 'An unknown error occurred.';
    if (String(e.message).includes('Firestore is not initialized')) {
      errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
    }
    return { success: false, error: errorMessage };
  }
}