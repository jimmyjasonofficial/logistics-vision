export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

import { getCustomers } from '@/services/customer-service';
import { getDrivers } from '@/services/employee-service';
import { getVehicles } from '@/services/vehicle-service';
import { NewTripForm } from './new-trip-form';

export default async function AddTripPage() {
  const [customers, drivers, vehicles] = await Promise.all([
    getCustomers(),
    getDrivers(),
    getVehicles(),
  ]);

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/trips">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Trip</h1>
          <p className="text-muted-foreground">Fill in the details below to schedule a new trip.</p>
        </div>
      </div>
      <NewTripForm 
        customers={customers}
        drivers={drivers}
        vehicles={vehicles}
      />
    </div>
  );
}
