
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote } from 'lucide-react';
import { useMemo } from 'react';
import { startOfMonth, subMonths } from 'date-fns';
import { PayrollChart } from './payroll-chart';
import { PayrollTable } from './payroll-table';
import type { PayrollRun } from '@/services/payroll-service';

type PayrollRunSummary = {
    id: string;
    payPeriodStart: string;
    payPeriodEnd: string;
    paymentDate: string;
    status: 'Paid' | 'Draft' | 'Approved';
    employeesCount: number;
    totalAmount: number;
};

export function PayrollClientPage({ initialPayrollRuns }: { initialPayrollRuns: PayrollRun[] }) {
    const payrollRunSummaries: PayrollRunSummary[] = useMemo(() => {
        return initialPayrollRuns.map(run => {
            const totalAmount = run.employees.reduce((acc, emp) => acc + (emp.basePay || 0) + (emp.overtime || 0) + (emp.bonus || 0), 0);
            return {
                id: run.id,
                payPeriodStart: run.payPeriodStart,
                payPeriodEnd: run.payPeriodEnd,
                paymentDate: run.paymentDate,
                status: run.status,
                employeesCount: run.employees.length,
                totalAmount,
            };
        });
    }, [initialPayrollRuns]);
    
    const { totalPaidLastMonth, nextPayrollTotal } = useMemo(() => {
        const today = new Date();
        const lastMonthStart = startOfMonth(subMonths(today, 1));
        const lastMonthEnd = startOfMonth(today);

        const paidLastMonthTotal = payrollRunSummaries
            .filter(p => {
                const paymentDate = new Date(p.paymentDate);
                return p.status === 'Paid' && paymentDate >= lastMonthStart && paymentDate < lastMonthEnd;
            })
            .reduce((acc, curr) => acc + curr.totalAmount, 0);

        const nextRunTotal = payrollRunSummaries
            .filter(p => p.status === 'Draft' || p.status === 'Approved')
            .reduce((acc, curr) => acc + curr.totalAmount, 0);

        return {
            totalPaidLastMonth: paidLastMonthTotal,
            nextPayrollTotal: nextRunTotal,
        };
    }, [payrollRunSummaries]);

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Payroll Total</CardTitle>
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${nextPayrollTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground">Total gross pay for upcoming runs.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Paid (Last Month)</CardTitle>
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalPaidLastMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground">Total payroll expense for the previous month.</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payroll Trends</CardTitle>
                    <CardDescription>Monthly gross pay for all paid runs.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PayrollChart data={payrollRunSummaries.filter(p => p.status === 'Paid')} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payroll History</CardTitle>
                    <CardDescription>An overview of all past and draft payroll runs.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PayrollTable payrollRuns={payrollRunSummaries} />
                </CardContent>
            </Card>
        </>
    );
}
