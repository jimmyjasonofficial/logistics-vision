export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { getDrivers } from '@/services/employee-service';
import { DriverList } from './driver-list';

export default async function DriversPage() {
  const drivers = await getDrivers();

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
                    <h1 className="text-3xl font-bold">Drivers</h1>
                    <p className="text-muted-foreground">Manage your driver records and performance here.</p>
                </div>
            </div>
             <Button asChild>
                <Link href="/hr/employees/new">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Employee
                </Link>
            </Button>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Driver Roster</CardTitle>
          <CardDescription>A list of all drivers in your fleet, loaded from Firestore.</CardDescription>
        </CardHeader>
        <CardContent>
          <DriverList drivers={drivers} />
        </CardContent>
      </Card>
    </div>
  );
}
