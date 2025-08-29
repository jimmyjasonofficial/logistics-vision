'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Combobox } from '@/components/ui/combobox';

import type { Customer } from '@/services/customer-service';
import type { Employee } from '@/services/employee-service';
import type { Vehicle } from '@/services/vehicle-service';
import { createTripAction } from '../actions';
import { mockLocations } from '@/data/locations';

const tripFormSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  driverId: z.string().min(1, 'Driver is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  pickupTime: z.string().min(1, 'Pickup time is required'),
  estimatedDelivery: z.string().min(1, 'Estimated delivery is required'),
  status: z.enum(['Planned', 'In Transit', 'Delivered', 'Cancelled', 'Pending']),
  distance: z.coerce.number().min(0, 'Distance must be non-negative'),
  revenue: z.coerce.number().min(0, 'Revenue must be non-negative'),
  notes: z.string().optional()
});

type TripFormValues = z.infer<typeof tripFormSchema>;

const LOAD_RATE_PER_KM = 23.76;

type NewTripFormProps = {
  customers: Customer[];
  drivers: Employee[];
  vehicles: Vehicle[];
};

export function NewTripForm({ customers, drivers, vehicles }: NewTripFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      status: 'Planned',
      notes: '',
    },
  });

  const distance = form.watch('distance');

  useEffect(() => {
    const dist = Number(distance);
    if (!isNaN(dist) && dist >= 0) {
      const calculatedRevenue = dist * LOAD_RATE_PER_KM;
      form.setValue('revenue', parseFloat(calculatedRevenue.toFixed(2)), { shouldValidate: true });
    }
  }, [distance, form]);

  useEffect(() => {
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const distance = searchParams.get('distance');

    if (origin) form.setValue('origin', decodeURIComponent(origin));
    if (destination) form.setValue('destination', decodeURIComponent(destination));
    if (distance) form.setValue('distance', parseFloat(distance));
  }, [searchParams, form]);


  async function onSubmit(data: TripFormValues) {
    setLoading(true);

    const customer = customers.find(c => c.id === data.customerId);
    const driver = drivers.find(d => d.id === data.driverId);
    const vehicle = vehicles.find(v => v.id === data.vehicleId);

    const tripData = {
      ...data,
      customer: customer?.company || 'Unknown Customer',
      driver: driver?.name || 'Unknown Driver',
      truck: vehicle?.licensePlate || 'Unknown Vehicle',
      notes: data.notes ?? "", // fix type issue
    };

    const result = await createTripAction(tripData);
    setLoading(false);

    if (result.success && result.tripId) {
      toast({
        title: 'Trip Created',
        description: `Trip #${result.tripId} has been created successfully.`,
      });
      router.push(`/trips/${result.tripId}`);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error Creating Trip',
        description: result.error,
      });
    }
  }

  const customerOptions = customers.map(c => ({ value: c.id, label: c.company }));
  const driverOptions = drivers.map(d => ({ value: d.id, label: d.name }));
  const vehicleOptions = vehicles.map(v => ({ value: v.id, label: `${v.model} (${v.licensePlate})` }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
            <CardDescription>Enter the primary information for the new trip.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Customer</FormLabel>
                    <Combobox
                      options={customerOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select a customer..."
                      searchPlaceholder="Search customers..."
                      emptyPlaceholder="No customer found."
                      disabled={loading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="driverId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Driver</FormLabel>
                    <Combobox
                      options={driverOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select a driver..."
                      searchPlaceholder="Search drivers..."
                      emptyPlaceholder="No driver found."
                      disabled={loading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Vehicle</FormLabel>
                    <Combobox
                      options={vehicleOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select a vehicle..."
                      searchPlaceholder="Search vehicles..."
                      emptyPlaceholder="No vehicle found."
                      disabled={loading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Origin</FormLabel>
                    <Combobox
                      options={mockLocations}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select origin..."
                      searchPlaceholder="Search locations..."
                      emptyPlaceholder="No location found."
                      disabled={loading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Destination</FormLabel>
                    <Combobox
                      options={mockLocations}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select destination..."
                      searchPlaceholder="Search locations..."
                      emptyPlaceholder="No location found."
                      disabled={loading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="pickupTime" render={({ field }) => (
                <FormItem><FormLabel>Pickup Date & Time</FormLabel><FormControl><Input type="datetime-local" {...field} disabled={loading} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="estimatedDelivery" render={({ field }) => (
                <FormItem><FormLabel>Estimated Delivery</FormLabel><FormControl><Input type="datetime-local" {...field} disabled={loading} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField control={form.control} name="distance" render={({ field }) => (
                <FormItem><FormLabel>Distance (km)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} disabled={loading} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="revenue" render={({ field }) => (
                <FormItem><FormLabel>Revenue (N$)</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} disabled={loading} readOnly={true} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Planned">Planned</SelectItem><SelectItem value="In Transit">In Transit</SelectItem><SelectItem value="Delivered">Delivered</SelectItem><SelectItem value="Cancelled">Cancelled</SelectItem><SelectItem value="Pending">Pending</SelectItem></SelectContent></Select><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem><FormLabel>Notes (Optional)</FormLabel><FormControl><Textarea placeholder="Add any important notes or instructions for the trip." {...field} disabled={loading} /></FormControl><FormMessage /></FormItem>
            )} />
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={() => router.push('/trips')} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Trip
          </Button>
        </div>
      </form>
    </Form>
  );
}
