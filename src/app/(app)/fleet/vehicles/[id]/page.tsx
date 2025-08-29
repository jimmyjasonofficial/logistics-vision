
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import { getVehicleById } from '@/services/vehicle-service';

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Operational': return 'secondary';
    case 'In Repair': return 'destructive';
    case 'Awaiting Inspection': return 'outline';
    default: return 'default';
  }
};


export default async function VehicleDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-8">
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
             <Link href="/fleet/vehicles">
                <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Vehicle #{vehicle.id}</h1>
              <p className="text-muted-foreground">View and manage vehicle details.</p>
            </div>
         </div>
        <Button asChild>
            <Link href={`/fleet/vehicles/edit/${vehicle.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Vehicle
            </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
          <CardDescription>All details for vehicle #{vehicle.id}.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Model</p>
                <p>{vehicle.model}</p>
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Year</p>
                <p>{vehicle.year}</p>
            </div>
             <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Assigned Driver</p>
                <p>{vehicle.driverId && vehicle.driverName ? <Link href={`/fleet/drivers/${vehicle.driverId}`} className="text-primary hover:underline">{vehicle.driverName}</Link> : 'Unassigned'}</p>
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div><Badge variant={getStatusVariant(vehicle.status) as 'default' | 'secondary' | 'outline' | 'destructive'}>{vehicle.status}</Badge></div>
            </div>
             <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Next Maintenance</p>
                <p>{vehicle.maintenanceDue}</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
