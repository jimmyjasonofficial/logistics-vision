
'use server';

import { createPayout } from '@/services/payout-service';
import { updateCommissionsStatus } from '@/services/commission-service';
import { getTrips } from '@/services/trip-service';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';

const COMMISSION_RATE = 0.05;

type ProcessPayoutInput = {
    commissionIds: string[];
    pendingCommissions: { id: string, tripId: string }[];
}

export async function processPayoutAction(
    input: ProcessPayoutInput
): Promise<{ success: boolean; error?: string; payoutId?: string }> {

    if (!input.commissionIds || input.commissionIds.length === 0) {
        return { success: false, error: 'No commissions selected for payout.' };
    }
    
    try {
        const trips = await getTrips();
        const tripsMap = new Map(trips.map(trip => [trip.id, trip]));

        let totalPayoutAmount = 0;
        
        for (const commissionId of input.commissionIds) {
            const commission = input.pendingCommissions.find(c => c.id === commissionId);
            if (!commission) continue;

            const trip = tripsMap.get(commission.tripId);
            if (trip) {
                totalPayoutAmount += trip.revenue * COMMISSION_RATE;
            }
        }
        
        if (totalPayoutAmount <= 0) {
            return { success: false, error: 'Payout amount must be greater than zero.' };
        }
        
        const payoutDate = format(new Date(), 'yyyy-MM-dd');

        const newPayout = await createPayout({
            payoutDate,
            status: 'Completed',
            totalAmount: totalPayoutAmount,
            commissionsCount: input.commissionIds.length,
        });
        
        await updateCommissionsStatus(input.commissionIds, newPayout.id, payoutDate);
        
        revalidatePath('/brokerage/payouts');
        revalidatePath('/brokerage/commissions');

        return { success: true, payoutId: newPayout.id };

    } catch (e: any) {
        let errorMessage = e.message || 'An unknown error occurred.';
        if (String(e.message).includes('Firestore is not initialized')) {
            errorMessage = "A connection to the database could not be established. Please contact support if the issue persists.";
        }
        return { success: false, error: errorMessage };
    }
}
