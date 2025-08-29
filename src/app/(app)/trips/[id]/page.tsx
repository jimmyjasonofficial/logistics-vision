
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Map, DollarSign, FileText, Truck, User, FilePlus } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getTripById } from '@/services/trip-service';
import { getExpenses } from '@/services/expense-service';
import { CompleteTripButton } from '../complete-trip-button';
import { cn } from '@/lib/utils';
import { ShareTrackingButton } from '../share-tracking-button';
import Image from 'next/image';

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'In Transit': return 'default';
    case 'Delivered': return 'secondary';
    case 'Planned': return 'outline';
    case 'Pending': return 'outline';
    case 'Cancelled': return 'destructive';
    default: return 'default';
  }
};

export default async function TripDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [trip, allExpenses] = await Promise.all([
    getTripById(id),
    getExpenses()
  ]);

  if (!trip) {
      notFound();
  }

  const tripExpenses = allExpenses.filter(exp => exp.tripId === trip.id);
  const totalExpenses = tripExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = trip.revenue - totalExpenses;

  return (
    <div className="flex-1 space-y-8">
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
             <Link href="/trips">
                <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-4">
                Trip #{trip.id}
                <Badge variant={getStatusVariant(trip.status) as any} className="text-base">{trip.status}</Badge>
              </h1>
              <p className="text-muted-foreground">View and manage trip details.</p>
            </div>
         </div>
         <div className="flex items-center gap-2">
            <Button variant="outline">Print/Export</Button>
            <ShareTrackingButton tripId={trip.id} />
            <Button asChild variant="outline">
                <Link href={`/accounting/quotes/new?fromTrip=${trip.id}`}>
                    <FilePlus className="mr-2 h-4 w-4" />
                    Convert to Quote
                </Link>
            </Button>
            <CompleteTripButton tripId={trip.id} tripStatus={trip.status} />
            <Button asChild>
                <Link href={`/trips/edit/${trip.id}`}>Edit Trip</Link>
            </Button>
         </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
             <Card>
                <CardHeader>
                <CardTitle>Trip Information</CardTitle>
                <CardDescription>Key details about the trip route and assignment.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Customer</p>
                        <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> <Link href={`/customers/${trip.customerId}`} className="text-primary hover:underline">{trip.customer}</Link></p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Driver</p>
                        <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> <Link href={`/fleet/drivers/${trip.driverId}`} className="text-primary hover:underline">{trip.driver}</Link></p>
                    </div>
                     <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Vehicle ID</p>
                        <p className="flex items-center gap-2"><Truck className="h-4 w-4 text-muted-foreground" /> <Link href={`/fleet/vehicles/${trip.vehicleId}`} className="text-primary hover:underline">{trip.vehicleId}</Link></p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Distance</p>
                        <p>{trip.distance} km</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Origin</p>
                        <p>{trip.origin}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Destination</p>
                        <p>{trip.destination}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Pickup Time</p>
                        <p>{new Date(trip.pickupTime).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Estimated Delivery</p>
                        <p>{new Date(trip.estimatedDelivery).toLocaleString()}</p>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{trip.notes || 'No notes for this trip.'}</p>
                </CardContent>
            </Card>
        </div>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5"/>Trip Financials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center font-medium">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="text-green-500">N${trip.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center font-medium">
                        <span className="text-muted-foreground">Total Expenses</span>
                        <span className="text-red-500">-N${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <Separator/>
                    <div className="flex justify-between items-center font-bold text-lg">
                        <span className="">Net Profit</span>
                        <span className={cn(netProfit >= 0 ? 'text-green-500' : 'text-red-500')}>
                            N${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <Separator/>
                    <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Logged Expenses</h3>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/accounting/expenses/new?tripId=${trip.id}`}>Add Expense</Link>
                            </Button>
                        </div>
                        {tripExpenses.length > 0 ? (
                            <div className="border rounded-md">
                                {tripExpenses.map((expense, index) => (
                                    <Link href={`/accounting/expenses/${expense.id}`} key={expense.id}>
                                         <div className={cn(
                                            "flex justify-between items-center p-2 text-sm hover:bg-muted/50",
                                            index < tripExpenses.length - 1 && "border-b"
                                         )}>
                                            <div>
                                                <p className="font-medium">{expense.description}</p>
                                                <p className="text-xs text-muted-foreground">{expense.date} &bull; {expense.category}</p>
                                            </div>
                                            <span className="font-mono">-N${expense.amount.toFixed(2)}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-sm text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                                <p>No expenses have been logged for this trip.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                     <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/>Trip Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                        <p>No documents uploaded.</p>
                    </div>
                    <Button variant="outline" className="w-full">Upload Document</Button>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                     <CardTitle className="flex items-center gap-2"><Map className="h-5 w-5"/>Live Map</CardTitle>
                </CardHeader>
                 <CardContent className="p-0">
                    <div className="aspect-video bg-muted rounded-b-lg relative">
                        <Image 
                            src="https://placehold.co/800x600.png"
                            data-ai-hint="map satellite"
                            alt="Map view of the trip route"
                            fill
                            className="object-cover rounded-b-lg"
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-4">
                            <div className="text-white">
                                <p className="font-bold text-lg">{trip.origin} &rarr; {trip.destination}</p>
                                <p className="text-sm">Status: <Badge variant="secondary">{trip.status}</Badge></p>
                            </div>
                        </div>
                    </div>
                 </CardContent>
            </Card>

        </div>
      </div>
    </div>
  );
}
