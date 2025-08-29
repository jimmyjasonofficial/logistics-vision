
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getCommissions } from '@/services/commission-service';
import { getTrips } from '@/services/trip-service';
import { getPayouts } from '@/services/payout-service';
import { PayoutsClientPage } from './payouts-client';
import type { CommissionWithAmount } from '@/app/(app)/brokerage/commissions/commission-table';


const COMMISSION_RATE = 0.05;

export default async function PayoutsPage() {
    const [payouts, pendingCommissions, trips] = await Promise.all([
        getPayouts(),
        getCommissions({ status: 'Pending' }),
        getTrips()
    ]);
    
    const tripsMap = new Map(trips.map(trip => [trip.id, trip]));

    const commissionsWithAmount: CommissionWithAmount[] = pendingCommissions.map(commission => {
        const trip = tripsMap.get(commission.tripId);
        const amount = trip ? trip.revenue * COMMISSION_RATE : 0;
        return { ...commission, amount };
    });

    return (
        <div className="flex-1 space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Payout Tracking</h1>
                    <p className="text-muted-foreground">Track and manage payouts.</p>
                </div>
            </div>
            <PayoutsClientPage payouts={payouts} pendingCommissions={commissionsWithAmount} />
        </div>
    );
}
