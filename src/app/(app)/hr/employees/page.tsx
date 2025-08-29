
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, UserPlus, BookUser } from 'lucide-react';
import { getEmployees } from '@/services/employee-service';
import { EmployeeList } from './employee-list';

export default async function EmployeesPage() {
    const employees = await getEmployees();

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
                <h1 className="text-3xl font-bold">Employees</h1>
                <p className="text-muted-foreground">Manage all employee records for your company.</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Button asChild variant="outline">
                <Link href="/hr/employees/leave-balances">
                    <BookUser className="mr-2 h-4 w-4" />
                    Leave Balances
                </Link>
            </Button>
            <Button asChild>
                <Link href="/hr/employees/new">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Employee
                </Link>
            </Button>
        </div>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>A list of all employees in the system.</CardDescription>
        </CardHeader>
        <CardContent>
            <EmployeeList employees={employees} />
        </CardContent>
      </Card>
    </div>
  );
}
