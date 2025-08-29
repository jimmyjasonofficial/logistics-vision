
'use server';

import { getTrips } from '@/services/trip-service';
import type { Trip } from '@/services/trip-service';
import {
    createPayrollRun,
    updatePayrollRun,
    finalizePayrollRun,
    type PayrollRunData,
} from '@/services/payroll-service';
import { revalidatePath } from 'next/cache';

type GetTripsForPayrollInput = {
    driverId: string;
    startDate: string;
    endDate: string;
};

export async function getTripsForPayrollAction(
    input: GetTripsForPayrollInput
): Promise<{ trips: Trip[] } | { error: string }> {
    try {
        const tripsInDateRange = await getTrips({
            startDate: input.startDate,
            endDate: input.endDate,
        });
        
        const driverTrips = tripsInDateRange.filter(trip => 
            trip.driverId === input.driverId && trip.status === 'Delivered'
        );

        return { trips: driverTrips };
    } catch (e: any) {
        let errorMessage = e.message || 'An unknown error occurred.';
        if (String(e.message).includes('Firestore is not initialized')) {
            errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
        }
        return { error: errorMessage };
    }
}

export async function createPayrollRunAction(data: PayrollRunData): Promise<{ success: boolean; error?: string; payrollRunId?: string }> {
    try {
        const newRun = await createPayrollRun(data);
        revalidatePath('/hr/payroll');
        return { success: true, payrollRunId: newRun.id };
    } catch (e: any) {
        let errorMessage = e.message || 'Failed to create payroll run.';
        if (String(e.message).includes('Firestore is not initialized')) {
            errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
        }
        return { success: false, error: errorMessage };
    }
}

export async function updatePayrollRunAction(id: string, data: Partial<PayrollRunData>): Promise<{ success: boolean; error?: string }> {
    try {
        await updatePayrollRun(id, data);
        revalidatePath('/hr/payroll');
        revalidatePath(`/hr/payroll/${id}`);
        return { success: true };
    } catch (e: any) {
        let errorMessage = e.message || 'Failed to update payroll run.';
        if (String(e.message).includes('Firestore is not initialized')) {
            errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
        }
        return { success: false, error: errorMessage };
    }
}

export async function finalizePayrollRunAction(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await finalizePayrollRun(id);
        revalidatePath('/hr/payroll');
        revalidatePath(`/hr/payroll/${id}`);
        return { success: true };
    } catch (e: any) {
        let errorMessage = e.message || 'Failed to finalize payroll run.';
        if (String(e.message).includes('Firestore is not initialized')) {
            errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
        }
        return { success: false, error: errorMessage };
    }
}
