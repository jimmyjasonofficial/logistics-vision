import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

import { getDrivers } from '@/services/employee-service';
import { NewVehicleForm } from './new-vehicle-form';

export default async function NewVehiclePage() {
  const drivers = await getDrivers();

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/fleet/vehicles"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Vehicle</h1>
          <p className="text-muted-foreground">Fill in the details to add a new vehicle to the fleet.</p>
        </div>
      </div>
      <NewVehicleForm drivers={drivers} />
    </div>
  );
}
