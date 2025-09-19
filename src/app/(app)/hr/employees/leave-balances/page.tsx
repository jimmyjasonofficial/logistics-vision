
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { getEmployees } from '@/services/employee-service';
import { getLeaveRequests } from '@/services/leave-service';
import { EmployeeLeaveTable, type EmployeeWithLeave } from '../employee-leave-table';
import { differenceInDays, parseISO } from 'date-fns';

function calculateLeaveDays(startDate: string, endDate: string): number {
    if (!startDate || !endDate) return 0;
    // Add 1 because the difference is exclusive of the end date
    return differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
}

export default async function LeaveBalancesPage() {
    const [employees, leaveRequests] = await Promise.all([
        getEmployees(),
        getLeaveRequests({ status: 'Approved' }),
    ]);

    const employeesWithLeave: EmployeeWithLeave[] = employees.map(employee => {
        const approvedLeave = leaveRequests.filter(req => req.employeeId === employee.id);
        const leaveTaken = approvedLeave.reduce((total, req) => total + calculateLeaveDays(req.startDate, req.endDate), 0);
        const leaveAllowance = employee.leaveAllowance || 0;
        const leaveRemaining = leaveAllowance - leaveTaken;
        
        return {
            id: employee.id,
            name: employee.name,
            role: employee.role,
            leaveAllowance,
            leaveTaken,
            leaveRemaining,
        };
    });

    return (
        <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/hr/employees">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Leave Balances</h1>
                        <p className="text-muted-foreground">An overview of employee leave allowances and usage.</p>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Employee Leave Overview</CardTitle>
                    <CardDescription>A summary of leave for all employees.</CardDescription>
                </CardHeader>
                <CardContent>
                    <EmployeeLeaveTable employees={employeesWithLeave} />
                </CardContent>
            </Card>
        </div>
    );
}
