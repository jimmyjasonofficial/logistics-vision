
'use client';

import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';

type PayrollRunSummary = {
    id: string;
    payPeriodStart: string;
    payPeriodEnd: string;
    paymentDate: string;
    status: 'Paid' | 'Draft' | 'Approved';
    employeesCount: number;
    totalAmount: number;
};

type PayrollTableProps = {
  payrollRuns: PayrollRunSummary[];
};

const getStatusVariant = (status: string) => {
    switch(status) {
        case 'Paid': return 'secondary';
        case 'Approved': return 'default';
        case 'Draft': return 'outline';
        default: return 'default';
    }
};

export function PayrollTable({ payrollRuns }: PayrollTableProps) {
  if (payrollRuns.length === 0) {
    return <div className="text-center p-8 text-muted-foreground">No payroll runs found.</div>
  }
  return (
    <Table>
      <TableHeader>
          <TableRow>
              <TableHead>Pay Period</TableHead>
              <TableHead>Pay Date</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead className="text-right">Total Gross Pay</TableHead>
              <TableHead>Status</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
          </TableRow>
      </TableHeader>
      <TableBody>
          {payrollRuns.map((payroll) => (
              <TableRow key={payroll.id}>
                  <TableCell className="font-medium">
                      <Link href={`/hr/payroll/${payroll.id}`} className="text-primary hover:underline">
                          {format(new Date(payroll.payPeriodStart), 'd MMM yyyy')} - {format(new Date(payroll.payPeriodEnd), 'd MMM yyyy')}
                      </Link>
                  </TableCell>
                  <TableCell>{format(new Date(payroll.paymentDate), 'd MMM yyyy')}</TableCell>
                  <TableCell>{payroll.employeesCount}</TableCell>
                  <TableCell className="text-right font-mono font-bold">${payroll.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell><Badge variant={getStatusVariant(payroll.status) as any}>{payroll.status}</Badge></TableCell>
                   <TableCell>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild><Link href={`/hr/payroll/${payroll.id}`}>View/Edit</Link></DropdownMenuItem>
                              <DropdownMenuItem disabled={payroll.status !== 'Draft'}>Finalize</DropdownMenuItem>
                              <DropdownMenuItem>View Payslips</DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                  </TableCell>
              </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
