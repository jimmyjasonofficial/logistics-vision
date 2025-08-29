
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CommissionsClientPage } from './commissions-client';

import { getCommissions } from '@/services/commission-service';
import { getTrips } from '@/services/trip-service';
import type { CommissionWithAmount } from './commission-table';

const COMMISSION_RATE = 0.05;

export default async function CommissionsPage() {

    const [commissions, trips] = await Promise.all([
        getCommissions(),
        getTrips()
    ]);

    const commissionsWithAmount: CommissionWithAmount[] = commissions.map(commission => {
        const trip = trips.find(t => t.id === commission.tripId);
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
            <h1 className="text-3xl font-bold">Referral Commissions</h1>
            <p className="text-muted-foreground">Manage and track referral commissions.</p>
        </div>
      </div>
      <CommissionsClientPage commissions={commissionsWithAmount} />
    </div>
  );
}
