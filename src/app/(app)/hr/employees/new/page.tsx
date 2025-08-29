
'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createEmployeeAction } from '../actions';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const employeeFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  role: z.enum(['Driver', 'Senior Driver', 'Admin', 'Operations', 'Finance', 'Assistance', 'Dispatcher', 'Mechanic', 'Accountant', 'HR Manager', 'User']),
  license: z.string().optional(),
  licenseExpiry: z.string().optional(),
  status: z.enum(['Active', 'On Leave', 'Inactive']),
  baseSalary: z.coerce.number().min(0).optional(),
  leaveAllowance: z.coerce.number().min(0).optional(),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export default function NewEmployeePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'User',
      license: '',
      licenseExpiry: '',
      status: 'Active',
      baseSalary: 6000,
      leaveAllowance: 20,
    },
  });

  const watchRole = form.watch('role');

  async function onSubmit(data: EmployeeFormValues) {
    setLoading(true);
    const result = await createEmployeeAction(data);
    setLoading(false);

    if (result.success && result.employeeId) {
      toast({
        title: 'Employee Created',
        description: `Employee ${data.name} has been added successfully.`,
      });
      router.push(`/hr/employees/${result.employeeId}`);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error Creating Employee',
        description: result.error,
      });
    }
  }

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/hr/employees"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Employee</h1>
          <p className="text-muted-foreground">Fill in the details to add a new employee to your company.</p>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
                <CardTitle>Employee Information</CardTitle>
                <CardDescription>Enter the personal and professional details for the new employee.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} disabled={loading} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="e.g., john.d@example.com" {...field} disabled={loading} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="e.g., 555-123-4567" {...field} disabled={loading} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}><FormControl><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger></FormControl><SelectContent>
                    <SelectItem value="Driver">Driver</SelectItem>
                    <SelectItem value="Senior Driver">Senior Driver</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Assistance">Assistance</SelectItem>
                    <SelectItem value="Dispatcher">Dispatcher</SelectItem>
                    <SelectItem value="Mechanic">Mechanic</SelectItem>
                    <SelectItem value="Accountant">Accountant</SelectItem>
                    <SelectItem value="HR Manager">HR Manager</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                 </SelectContent></Select><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="On Leave">On Leave</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              </div>
              {watchRole && watchRole.toLowerCase().includes('driver') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="license" render={({ field }) => (<FormItem><FormLabel>License Number</FormLabel><FormControl><Input placeholder="e.g., D1234567" {...field} value={field.value ?? ''} disabled={loading} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="licenseExpiry" render={({ field }) => (<FormItem><FormLabel>License Expiry Date</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} disabled={loading} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="baseSalary" render={({ field }) => (<FormItem><FormLabel>Base Salary (Monthly)</FormLabel><FormControl><Input type="number" placeholder="e.g., 6000" {...field} value={field.value ?? ''} onChange={event => field.onChange(+event.target.value)} disabled={loading} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="leaveAllowance" render={({ field }) => (<FormItem><FormLabel>Leave Allowance (Days)</FormLabel><FormControl><Input type="number" placeholder="e.g., 20" {...field} value={field.value ?? ''} onChange={event => field.onChange(+event.target.value)} disabled={loading} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => router.push('/hr/employees')} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Employee
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
