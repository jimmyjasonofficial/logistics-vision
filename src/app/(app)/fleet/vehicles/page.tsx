
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { getVehicles } from '@/services/vehicle-service';
import { VehicleList } from './vehicle-list';

export default async function VehiclesPage() {
  const vehicles = await getVehicles();

  return (
    <div className="flex-1 space-y-8">
       <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link href="/dashboard">
                <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <div>
                <h1 className="text-3xl font-bold">Vehicles</h1>
                <p className="text-muted-foreground">Manage your vehicle fleet here.</p>
            </div>
        </div>
         <Button asChild>
            <Link href="/fleet/vehicles/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Vehicle
            </Link>
        </Button>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Vehicle Fleet</CardTitle>
          <CardDescription>An overview of all vehicles in the system, loaded from Firestore.</CardDescription>
        </CardHeader>
        <CardContent>
          <VehicleList vehicles={vehicles} />
        </CardContent>
      </Card>
    </div>
  );
}
