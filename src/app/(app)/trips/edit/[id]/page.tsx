export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

import { getTripById } from '@/services/trip-service';
import { getCustomers } from '@/services/customer-service';
import { getDrivers } from '@/services/employee-service';
import { getVehicles } from '@/services/vehicle-service';
import { EditTripForm } from './edit-trip-form';

export default async function EditTripPage({ params }: { params: { id: string } }) {
  const tripId = params.id as string;

  const [tripData, customersData, driversData, vehiclesData] = await Promise.all([
    getTripById(tripId),
    getCustomers(),
    getDrivers(),
    getVehicles(),
  ]);

  if (!tripData) {
    return notFound();
  }

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/trips/${tripId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Trip #{tripId}</h1>
          <p className="text-muted-foreground">Update the details for this trip.</p>
        </div>
      </div>
      <EditTripForm 
        trip={tripData}
        customers={customersData}
        drivers={driversData}
        vehicles={vehiclesData}
      />
    </div>
  );
}
