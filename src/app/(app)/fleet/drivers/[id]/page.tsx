
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Calendar, Hash, Mail, Phone, Truck, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { getEmployeeById } from '@/services/employee-service';

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Active': return 'secondary';
        case 'On Leave': return 'outline';
        case 'Inactive': return 'destructive';
        default: return 'default';
    }
};

export default async function DriverDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const employee = await getEmployeeById(id);

  if (!employee) {
      notFound();
  }

  return (
    <div className="flex-1 space-y-8">
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
             <Link href="/fleet/drivers">
                <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Driver Profile</h1>
              <p className="text-muted-foreground">View and manage driver details.</p>
            </div>
         </div>
        <Button asChild>
            <Link href={`/hr/employees/edit/${employee.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Driver
            </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row gap-6 space-y-0">
          <Avatar className="h-24 w-24">
            <AvatarImage src={employee.photoUrl} alt={employee.name} />
            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-4xl">{employee.name}</CardTitle>
            <CardDescription className="mt-2">All details for driver #{employee.id}.</CardDescription>
            <div className="mt-4">
                <Badge variant={getStatusVariant(employee.status) as 'default' | 'secondary' | 'outline' | 'destructive'}>{employee.status}</Badge>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-6">
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Hash className="h-4 w-4" /> License No.</p>
                <p className="pl-6">{employee.license || 'N/A'}</p>
            </div>
             <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> License Expiry</p>
                <p className="pl-6">{employee.licenseExpiry || 'N/A'}</p>
            </div>
             <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Truck className="h-4 w-4" /> Total Trips</p>
                <p className="pl-6">{employee.totalTrips}</p>
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4" /> Email Address</p>
                <p className="pl-6">{employee.email}</p>
            </div>
             <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4" /> Phone Number</p>
                <p className="pl-6">{employee.phone}</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
