
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, DollarSign, MoreHorizontal, Package, Truck, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { RevenueChart } from './revenue-chart';

// Data imports
import { getTrips } from '@/services/trip-service';
import { getInvoices } from '@/services/invoice-service';
import { getCustomers } from '@/services/customer-service';
import { isSameDay, subDays, isBefore } from 'date-fns';

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'In Transit':
      return 'default';
    case 'Delivered':
      return 'secondary';
    case 'Pending':
      return 'outline';
    case 'Cancelled':
      return 'destructive';
    default:
      return 'default';
  }
};


export default async function DashboardPage() {
  // Fetch data
  const customers = await getCustomers();
  const trips = await getTrips();
  const invoices = await getInvoices();
  
  // Calculate metrics
  const totalRevenue = invoices
    .filter(invoice => invoice.status === 'Paid')
    .reduce((sum, invoice) => sum + invoice.total, 0);

  const activeTrips = trips.filter(trip => trip.status === 'In Transit').length;
  
  const completedTrips = trips.filter(trip => trip.status === 'Delivered').length;

  const totalCustomers = customers.length;

  const recentTrips = trips.slice(0, 5);
  
  // --- Daily Movement Matrix Calculations ---
  const today = new Date();
  const yesterday = subDays(today, 1);

  const tripsDispatchedToday = trips.filter(trip => isSameDay(new Date(trip.pickupTime), today)).length;
  const tripsDispatchedYesterday = trips.filter(trip => isSameDay(new Date(trip.pickupTime), yesterday)).length;
  const dispatchChange = tripsDispatchedYesterday > 0 ? ((tripsDispatchedToday - tripsDispatchedYesterday) / tripsDispatchedYesterday) * 100 : tripsDispatchedToday > 0 ? 100 : 0;

  const tripsCompletedToday = trips.filter(trip => trip.status === 'Delivered' && isSameDay(new Date(trip.estimatedDelivery), today)).length;
  const tripsCompletedYesterday = trips.filter(trip => trip.status === 'Delivered' && isSameDay(new Date(trip.estimatedDelivery), yesterday)).length;
  const completionChange = tripsCompletedYesterday > 0 ? ((tripsCompletedToday - tripsCompletedYesterday) / tripsCompletedYesterday) * 100 : tripsCompletedToday > 0 ? 100 : 0;
  
  const sevenDaysAgo = subDays(today, 7);
  const recentCompletedTrips = trips.filter(trip => trip.status === 'Delivered' && isBefore(sevenDaysAgo, new Date(trip.estimatedDelivery)));
  const onTimeDeliveries = recentCompletedTrips.filter(trip => new Date(trip.estimatedDelivery) <= new Date(trip.pickupTime)).length;
  const onTimePercentage = recentCompletedTrips.length > 0 ? (onTimeDeliveries / recentCompletedTrips.length) * 100 : 100;
  
  const totalMilesToday = trips
    .filter(trip => trip.status === 'In Transit' && isSameDay(new Date(trip.pickupTime), today))
    .reduce((sum, trip) => sum + trip.distance, 0);

  const vehiclesActiveToday = new Set(trips
    .filter(trip => trip.status === 'In Transit' && isSameDay(new Date(trip.pickupTime), today))
    .map(trip => trip.vehicleId)
  ).size;


  return (
    <div className="space-y-4">
      {/* Key Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              All-time paid invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTrips}</div>
            <p className="text-xs text-muted-foreground">
              Currently on the road
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Trips</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTrips}</div>
             <p className="text-xs text-muted-foreground">
              All-time completed trips
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Total active and inactive customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Chart and Daily Matrix */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RevenueChart invoices={invoices} />
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Daily Movement Matrix</CardTitle>
            <CardDescription>
              A snapshot of today's key operational metrics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">Trips Dispatched</div>
                    <div className="text-xs text-muted-foreground">Change vs yesterday</div>
                  </TableCell>
                  <TableCell className="text-right">
                     <div className="font-medium">{tripsDispatchedToday}</div>
                     <div className={`text-xs ${dispatchChange >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center justify-end`}>
                        {dispatchChange >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />} 
                        {dispatchChange.toFixed(1)}%
                     </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">Trips Completed</div>
                    <div className="text-xs text-muted-foreground">Change vs yesterday</div>
                  </TableCell>
                  <TableCell className="text-right">
                     <div className="font-medium">{tripsCompletedToday}</div>
                      <div className={`text-xs ${completionChange >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center justify-end`}>
                        {completionChange >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                        {completionChange.toFixed(1)}%
                     </div>
                  </TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell>
                    <div className="font-medium">On-Time Deliveries</div>
                    <div className="text-xs text-muted-foreground">Rolling 7-day average</div>
                  </TableCell>
                  <TableCell className="text-right">
                     <div className="font-medium">{onTimePercentage.toFixed(1)}%</div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">Total Miles</div>
                    <div className="text-xs text-muted-foreground">All active vehicles today</div>
                  </TableCell>
                  <TableCell className="text-right">
                     <div className="font-medium">{totalMilesToday.toLocaleString()} mi</div>
                  </TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell>
                    <div className="font-medium">Vehicles Active</div>
                    <div className="text-xs text-muted-foreground">Currently on road</div>
                  </TableCell>
                  <TableCell className="text-right">
                     <div className="font-medium">{vehiclesActiveToday}</div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trips Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trips</CardTitle>
          <CardDescription>
            An overview of the most recent trip activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTrips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">
                       <Link href={`/trips/${trip.id}`} className="text-primary hover:underline">
                        {trip.id}
                      </Link>
                    </TableCell>
                    <TableCell>{trip.customer}</TableCell>
                    <TableCell>{trip.destination}</TableCell>
                    <TableCell>{trip.date}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(trip.status) as 'default' | 'secondary' | 'outline' | 'destructive'}>{trip.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/trips/${trip.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Track Shipment</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
