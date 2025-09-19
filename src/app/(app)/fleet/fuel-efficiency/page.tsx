
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getVehicles } from '@/services/vehicle-service';
import { getDrivers } from '@/services/employee-service';
import { getFuelLogs } from '@/services/fuel-service';
import { FuelEfficiencyClientPage } from './fuel-efficiency-client';

export default async function FuelEfficiencyPage() {
  const [vehicles, drivers, fuelLogs] = await Promise.all([
    getVehicles(),
    getDrivers(),
    getFuelLogs()
  ]);

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Fuel Efficiency</h1>
            <p className="text-muted-foreground">Analyze fuel consumption and efficiency across your fleet.</p>
          </div>
        </div>
      </div>
      <FuelEfficiencyClientPage vehicles={vehicles} drivers={drivers} fuelLogs={fuelLogs} />
    </div>
  );
}
