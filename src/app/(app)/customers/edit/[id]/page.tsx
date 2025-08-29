
'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { updateCustomerAction } from '../../actions';
import { getCustomerById } from '@/services/customer-service';
import type { Customer } from '@/services/customer-service';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const customerFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().min(1, 'Company is required'),
  status: z.enum(['Active', 'Inactive']),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
  });

  useEffect(() => {
    async function fetchCustomer() {
      if (!customerId) return;
      setInitialLoading(true);
      const fetchedCustomer = await getCustomerById(customerId);
      if (fetchedCustomer) {
        setCustomer(fetchedCustomer);
        form.reset({
            ...fetchedCustomer,
            address: fetchedCustomer.address || ''
        });
      }
      setInitialLoading(false);
    }
    fetchCustomer();
  }, [customerId, form]);

  async function onSubmit(data: CustomerFormValues) {
    setLoading(true);
    const result = await updateCustomerAction(customerId, data);
    setLoading(false);

    if (result.success) {
        toast({
            title: 'Customer Updated',
            description: `Customer ${data.company} has been updated successfully.`,
        });
        router.push(`/customers/${customerId}`);
    } else {
        toast({
            variant: 'destructive',
            title: 'Error Updating Customer',
            description: result.error,
        });
    }
  }

  if (initialLoading) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    )
  }

  if (!customer) {
      return notFound();
  }

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/customers/${customerId}`}><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Customer #{customerId}</h1>
          <p className="text-muted-foreground">Update the details for this customer.</p>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader><CardTitle>Customer Details</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} disabled={loading} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="e.g., john.d@example.com" {...field} disabled={loading} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="company" render={({ field }) => (<FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="e.g., Global Logistics Inc." {...field} disabled={loading} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="e.g., 555-123-4567" {...field} disabled={loading} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl><Textarea placeholder="e.g., 123 Main St, Anytown, USA" {...field} disabled={loading} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}><FormControl><SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
            </CardContent>
          </Card>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => router.push(`/customers/${customerId}`)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
