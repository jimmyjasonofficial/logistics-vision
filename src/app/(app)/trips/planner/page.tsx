'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Loader2, Wand2, Map, Route, Milestone } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { mockLocations } from '@/data/locations';
import { planRouteAction } from './actions';
import type { RoutePlannerOutput } from '@/ai/flows/route-planner-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  origin: z.string().min(1, 'Origin is required.'),
  destination: z.string().min(1, 'Destination is required.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function RoutePlannerPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoutePlannerOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(data: FormValues) {
    setLoading(true);
    setResult(null);
    setError(null);
    
    const actionResult = await planRouteAction(data);
    
    if ('error' in actionResult) {
      setError(actionResult.error);
    } else {
      setResult(actionResult);
    }

    setLoading(false);
  }

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/trips">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">AI Route Planner</h1>
          <p className="text-muted-foreground">Get an optimized route for your truck shipments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Plan a New Route</CardTitle>
            <CardDescription>Enter the origin and destination to get an AI-optimized plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Plan Route
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optimized Route Plan</CardTitle>
            <CardDescription>The suggested route and estimated stats will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Route className="h-10 w-10 animate-pulse text-primary" />
                  <p>Calculating best route...</p>
                </div>
              </div>
            )}
            {error && !loading && (
              <Alert variant="destructive">
                <AlertTitle>Planning Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {result && !loading && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Distance</p>
                    <p className="text-xl font-bold">{result.totalDistance.toLocaleString()} km</p>
                  </div>
                   <div className="p-2 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Est. Time</p>
                    <p className="text-xl font-bold">{result.estimatedTime}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><Map className="h-4 w-4" />Route Summary</h4>
                  <p className="text-sm text-muted-foreground">{result.summary}</p>
                </div>
                <Separator />
                <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><Milestone className="h-4 w-4"/>Waypoints</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        {result.waypoints.map((waypoint, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">{index + 1}</span>
                              <span>{waypoint}</span>
                            </li>
                        ))}
                    </ol>
                </div>
                 <Button asChild className="w-full mt-4">
                  <Link href={`/trips/new?origin=${encodeURIComponent(form.getValues('origin'))}&destination=${encodeURIComponent(form.getValues('destination'))}&distance=${result.totalDistance}`}>Create Trip from this Route</Link>
                </Button>
              </div>
            )}
            {!result && !error && !loading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <p>Your route plan will appear here.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
