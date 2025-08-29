
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

export type EmployeeWithLeave = {
  id: string;
  name: string;
  role: string;
  leaveAllowance: number;
  leaveTaken: number;
  leaveRemaining: number;
};

type EmployeeLeaveTableProps = {
  employees: EmployeeWithLeave[];
};

export function EmployeeLeaveTable({ employees }: EmployeeLeaveTableProps) {
  if (employees.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No employees found.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead className="hidden sm:table-cell">Role</TableHead>
          <TableHead className="w-[300px] hidden md:table-cell">Leave Used</TableHead>
          <TableHead className="text-right">Allowance</TableHead>
          <TableHead className="text-right">Used</TableHead>
          <TableHead className="text-right">Remaining</TableHead>
          <TableHead><span className="sr-only">Actions</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell className="font-medium">
                <Link href={`/hr/employees/${employee.id}`} className="text-primary hover:underline">
                    {employee.name}
                </Link>
            </TableCell>
            <TableCell className="hidden sm:table-cell">{employee.role}</TableCell>
            <TableCell className="hidden md:table-cell">
                <div className='flex items-center gap-4'>
                    <Progress value={(employee.leaveTaken / employee.leaveAllowance) * 100} className="h-2" />
                </div>
            </TableCell>
            <TableCell className="text-right">{employee.leaveAllowance}</TableCell>
            <TableCell className="text-right">{employee.leaveTaken}</TableCell>
            <TableCell className="text-right font-bold">{employee.leaveRemaining}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/hr/employees/${employee.id}`}>View Profile</Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem>Adjust Leave</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
