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
import { updateVehicleAction } from '../../actions';
import type { Vehicle } from '@/services/vehicle-service';
import type { Employee } from '@/services/employee-service';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Combobox } from '@/components/ui/combobox';

const vehicleFormSchema = z.object({
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().min(1980, 'Enter a valid year').max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  licensePlate: z.string().min(1, 'License plate is required'),
  vin: z.string().min(1, 'VIN is required'),
  status: z.enum(['Operational', 'In Repair', 'Awaiting Inspection']),
  maintenanceDue: z.string().min(1, 'Next maintenance date is required'),
  driverId: z.string().optional(),
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

type EditVehicleFormProps = {
    vehicle: Vehicle;
    drivers: Employee[];
};

export function EditVehicleForm({ vehicle, drivers }: EditVehicleFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
        ...vehicle,
        driverId: vehicle.driverId || '',
    },
  });

  async function onSubmit(data: VehicleFormValues) {
    setLoading(true);
    
    const selectedDriver = drivers.find(d => d.id === data.driverId);
    
    const vehicleData = {
      ...data,
      driverName: selectedDriver?.name,
    };

    const result = await updateVehicleAction(vehicle.id, vehicleData as any);
    setLoading(false);

    if (result.success) {
        toast({
            title: 'Vehicle Updated',
            description: `Vehicle ${data.model} has been updated successfully.`,
        });
        router.push(`/fleet/vehicles/${vehicle.id}`);
        router.refresh();
    } else {
        toast({
            variant: 'destructive',
            title: 'Error Updating Vehicle',
            description: result.error,
        });
    }
  }

  const driverOptions = [
    { value: '', label: 'Unassigned' },
    ...drivers.map((d) => ({ value: d.id, label: d.name })),
  ];

  return (
     <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
                <CardDescription>Update the specifications and status for this vehicle.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="model" render={({ field }) => (<FormItem><FormLabel>Model</FormLabel><FormControl><Input placeholder="e.g., Freightliner Cascadia" {...field} disabled={loading} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="year" render={({ field }) => (<FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" placeholder="e.g., 2022" {...field} disabled={loading} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField control={form.control} name="licensePlate" render={({ field }) => (<FormItem><FormLabel>License Plate</FormLabel><FormControl><Input placeholder="e.g., TRUCK-101" {...field} disabled={loading} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="vin" render={({ field }) => (<FormItem><FormLabel>VIN</FormLabel><FormControl><Input placeholder="Enter 17-digit VIN" {...field} disabled={loading} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Operational">Operational</SelectItem><SelectItem value="In Repair">In Repair</SelectItem><SelectItem value="Awaiting Inspection">Awaiting Inspection</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="maintenanceDue" render={({ field }) => (<FormItem><FormLabel>Next Maintenance Date</FormLabel><FormControl><Input type="date" {...field} disabled={loading} /></FormControl><FormMessage /></FormItem>)} />
              </div>
               <FormField
                  control={form.control}
                  name="driverId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Assigned Driver</FormLabel>
                       <Combobox
                        options={driverOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select a driver to assign"
                        searchPlaceholder="Search drivers..."
                        emptyPlaceholder="No drivers found."
                        disabled={loading || drivers.length === 0}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
          </Card>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => router.push(`/fleet/vehicles/${vehicle.id}`)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
          </div>
        </form>
      </Form>
  );
}
