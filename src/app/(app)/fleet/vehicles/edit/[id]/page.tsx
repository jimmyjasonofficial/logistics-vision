
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getVehicleById } from '@/services/vehicle-service';
import { getDrivers } from '@/services/employee-service';
import { EditVehicleForm } from './edit-vehicle-form';

export default async function EditVehiclePage({ params }: { params: { id: string } }) {
  const vehicleId = params.id as string;
  
  const [vehicle, drivers] = await Promise.all([
    getVehicleById(vehicleId),
    getDrivers()
  ]);

  if (!vehicle) {
    return notFound();
  }

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/fleet/vehicles/${vehicleId}`}><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Vehicle #{vehicleId}</h1>
          <p className="text-muted-foreground">Update the details for this vehicle.</p>
        </div>
      </div>
      <EditVehicleForm vehicle={vehicle} drivers={drivers} />
    </div>
  );
}
