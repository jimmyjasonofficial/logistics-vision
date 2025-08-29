
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calculator, DollarSign, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { getDriversAction } from '../../employees/actions';
import type { Employee } from '@/services/employee-service';
import { getTripsForPayrollAction } from '../actions';
import { useToast } from '@/hooks/use-toast';

const OVERTIME_RATE_PER_KM = 0.45;

const formSchema = z.object({
  driverId: z.string().min(1, 'Please select a driver.'),
  startDate: z.string().min(1, 'Please select a start date.'),
  endDate: z.string().min(1, 'Please select an end date.'),
}).refine(data => data.endDate >= data.startDate, {
    message: 'End date cannot be before start date.',
    path: ['endDate'],
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    baseSalary: number;
    totalKm: number;
    overtimePay: number;
    totalPay: number;
};

export default function PayrollCalculatorPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CalculationResult | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        async function fetchData() {
            const employeeData = await getDriversAction();
            setEmployees(employeeData);
            setInitialLoading(false);
        }
        fetchData();
    }, []);

    async function onSubmit(data: FormValues) {
        setLoading(true);
        setResult(null);

        const driver = employees.find(d => d.id === data.driverId);
        if (!driver) {
            setLoading(false);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Selected driver not found.',
            });
            return;
        }

        const actionResult = await getTripsForPayrollAction(data);
        
        if ('error' in actionResult) {
            setLoading(false);
            toast({
                variant: 'destructive',
                title: 'Calculation Error',
                description: actionResult.error,
            });
            return;
        }

        const driverTrips = actionResult.trips;
        const totalKm = driverTrips.reduce((sum, trip) => sum + trip.distance, 0);
        const overtimePay = totalKm * OVERTIME_RATE_PER_KM;
        const baseSalary = driver.baseSalary || 6000;
        const totalPay = baseSalary + overtimePay;

        setResult({ baseSalary, totalKm, overtimePay, totalPay });
        setLoading(false);
    }


    return (
        <div className="flex-1 space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/hr/payroll">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Payroll Calculator</h1>
                    <p className="text-muted-foreground">Calculate driver pay based on base salary and distance-based overtime.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                 <Card>
                    <CardHeader>
                        <CardTitle>Calculation Parameters</CardTitle>
                        <CardDescription>Select a driver and pay period to calculate their gross pay.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="driverId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Driver</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={initialLoading}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a driver" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {initialLoading ? (
                                                        <div className="p-4 text-center text-sm text-muted-foreground">Loading drivers...</div>
                                                    ) : (
                                                        employees.map(driver => (
                                                            <SelectItem key={driver.id} value={driver.id}>{driver.name}</SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex gap-4">
                                     <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Pay Period Start</FormLabel>
                                                <FormControl><Input type="date" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Pay Period End</FormLabel>
                                                <FormControl><Input type="date" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button type="submit" disabled={loading || initialLoading} className="w-full">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Calculate Pay
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Calculation Result</CardTitle>
                        <CardDescription>The gross pay calculation for the selected driver and period.</CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-[220px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <Calculator className="h-10 w-10 animate-pulse" />
                                <p className="mt-2">Calculating...</p>
                            </div>
                        ) : result ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-muted-foreground">Base Salary</span>
                                    <span className="font-mono text-lg">N${result.baseSalary.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-muted-foreground">Overtime ({result.totalKm.toLocaleString()} km at N${OVERTIME_RATE_PER_KM}/km)</span>
                                    <span className="font-mono text-lg">+ N${result.overtimePay.toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-baseline font-bold text-xl">
                                    <span>Gross Pay</span>
                                    <span className="font-mono text-primary flex items-center gap-2"><DollarSign className="h-5 w-5"/>N${result.totalPay.toFixed(2)}</span>
                                </div>
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <p>Your calculation results will appear here.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
