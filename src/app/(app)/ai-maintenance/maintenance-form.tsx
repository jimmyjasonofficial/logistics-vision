'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getRecommendationAction } from './actions';
import type { MaintenanceOutput, MaintenanceInput } from '@/ai/flows/maintenance-recommendation';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  model: z.string().min(2, {
    message: 'Vehicle model must be at least 2 characters.',
  }),
  year: z.coerce.number().min(1950, { message: 'Please enter a valid year.' }).max(new Date().getFullYear() + 1, { message: 'Year cannot be in the future.' }),
  mileage: z.coerce.number().min(0, { message: 'Mileage cannot be negative.' }),
  issues: z.string().optional(),
});

type MaintenanceFormProps = {
    onResult: (data: MaintenanceOutput | { error: string } | null) => void;
    setLoading: (loading: boolean) => void;
    loading: boolean;
};

export function MaintenanceForm({ onResult, setLoading, loading }: MaintenanceFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: '',
      year: undefined,
      mileage: undefined,
      issues: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    onResult(null); // Clear previous results
    const result = await getRecommendationAction(values as MaintenanceInput);
    onResult(result);
    setLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Model</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Freightliner Cascadia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 2022" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mileage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Mileage</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 150000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="issues"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observed Issues (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Grinding noise from the front right wheel when braking, engine seems to be losing power on inclines."
                  {...field}
                />
              </FormControl>
               <FormDescription>
                Describe any problems or unusual behavior you've noticed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
        </Button>
      </form>
    </Form>
  );
}
