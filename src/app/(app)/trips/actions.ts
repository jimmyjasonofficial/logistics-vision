
'use server';

import {
  createTrip,
  updateTrip,
  getTripById,
  type TripData,
  type Trip,
} from '@/services/trip-service';
import { revalidatePath } from 'next/cache';

export async function createTripAction(
  data: TripData
): Promise<{ success: boolean; error?: string; tripId?: string }> {
  try {
    const newTrip = await createTrip(data);
    revalidatePath('/trips');
    revalidatePath('/dashboard');
    return { success: true, tripId: newTrip.id };
  } catch (e: any) {
    let errorMessage = e.message || 'An unknown error occurred.';
    if (String(e.message).includes('Firestore is not initialized')) {
      errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function updateTripAction(
  id: string,
  data: Partial<TripData>
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateTrip(id, data);
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

export async function cancelTripAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // We could add more complex business logic here, e.g., check if trip is in a cancelable state.
    await updateTrip(id, { status: 'Cancelled' });
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

export async function getTripByIdAction(id: string): Promise<Trip | null> {
    return getTripById(id);
}

export async function completeTripAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateTrip(id, { status: 'Delivered' });
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
