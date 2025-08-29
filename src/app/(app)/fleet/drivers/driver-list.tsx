
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Employee } from '@/services/employee-service';

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Active': return 'secondary';
        case 'On Leave': return 'outline';
        case 'Inactive': return 'destructive';
        default: return 'default';
    }
};

export function DriverList({ drivers }: { drivers: Employee[] }) {

    if (drivers.length === 0) {
        return (
          <div className="text-center text-muted-foreground p-8">
            No drivers found in the database.
            <br />
            Try running `npm run setup:admin` to seed sample data.
          </div>
        );
    }

    return (
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Photo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>License Expiry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Trips</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => (
            <TableRow key={driver.id}>
               <TableCell>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={driver.photoUrl} alt={driver.name} />
                    <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                  </Avatar>
               </TableCell>
              <TableCell className="font-medium">
                <Link href={`/hr/employees/${driver.id}`} className="text-primary hover:underline">
                  {driver.name}
                </Link>
              </TableCell>
              <TableCell>{driver.licenseExpiry}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(driver.status) as 'default' | 'secondary' | 'outline' | 'destructive'}>{driver.status}</Badge>
              </TableCell>
              <TableCell>{driver.totalTrips || 0}</TableCell>
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
                      <Link href={`/hr/employees/${driver.id}`}>View Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/hr/employees/edit/${driver.id}`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Assign to Trip</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
}
