
'use server';

import { createVehicle, deleteVehicle, updateVehicle } from '@/services/vehicle-service';
import type { VehicleData } from '@/services/vehicle-service';
import { revalidatePath } from 'next/cache';

export async function createVehicleAction(data: VehicleData): Promise<{ success: boolean, error?: string, vehicleId?: string }> {
    try {
        const newVehicle = await createVehicle(data);
        revalidatePath('/fleet/vehicles');
        return { success: true, vehicleId: newVehicle.id };
    } catch(e: any) {
        let errorMessage = e.message || "An unknown error occurred.";
        if (String(e.message).includes('Firestore is not initialized')) {
             errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
        }
        return { success: false, error: errorMessage };
    }
}

export async function updateVehicleAction(id: string, data: VehicleData): Promise<{ success: boolean, error?: string }> {
    try {
        await updateVehicle(id, data);
        revalidatePath('/fleet/vehicles');
        revalidatePath(`/fleet/vehicles/${id}`);
        return { success: true };
    } catch(e: any) {
        let errorMessage = e.message || "An unknown error occurred.";
        if (String(e.message).includes('Firestore is not initialized')) {
             errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
        }
        return { success: false, error: errorMessage };
    }
}
export async function deleteVehicleAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // await requireAdmin();
    await deleteVehicle(id);
    revalidatePath('/trips');
    revalidatePath(`/trips/${id}`);
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