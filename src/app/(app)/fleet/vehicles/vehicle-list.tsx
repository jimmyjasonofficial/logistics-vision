
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import type { Vehicle } from '@/services/vehicle-service';

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Operational': return 'secondary';
    case 'In Repair': return 'destructive';
    case 'Awaiting Inspection': return 'outline';
    default: return 'default';
  }
};

export function VehicleList({ vehicles }: { vehicles: Vehicle[] }) {

    if (vehicles.length === 0) {
        return (
          <div className="text-center text-muted-foreground p-8">
            No vehicles found in the database.
            <br />
            Try running `npm run setup:admin` to seed sample data.
          </div>
        );
    }
    
    return (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle ID</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Maintenance</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/fleet/vehicles/${vehicle.id}`}
                      className="text-primary hover:underline"
                    >
                      {vehicle.id}
                    </Link>
                  </TableCell>
                  <TableCell>{vehicle.model} ({vehicle.year})</TableCell>
                  <TableCell>
                      {vehicle.driverId && vehicle.driverName ? (
                          <Link href={`/fleet/drivers/${vehicle.driverId}`} className="text-primary hover:underline">{vehicle.driverName}</Link>
                      ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                      )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(vehicle.status) as 'default' | 'secondary' | 'outline' | 'destructive'}>{vehicle.status}</Badge>
                  </TableCell>
                  <TableCell>{vehicle.maintenanceDue}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                         <DropdownMenuItem asChild>
                          <Link href={`/fleet/vehicles/${vehicle.id}`}>View Details</Link>
                        </DropdownMenuItem>
                         <DropdownMenuItem asChild>
                          <Link href={`/fleet/vehicles/edit/${vehicle.id}`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Schedule Maintenance</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
        </Table>
    );
}
