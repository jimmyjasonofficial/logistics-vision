
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, DollarSign, FileText, Mail, MapPin, Phone, Truck, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getCustomerById } from '@/services/customer-service';
import { notFound } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getInvoices } from '@/services/invoice-service';
import { getTrips } from '@/services/trip-service';

const getStatusVariant = (status: string) => {
  return status === 'Active' ? 'secondary' : 'outline';
};

const getTripStatusVariant = (status: string) => {
  switch (status) {
    case 'In Transit': return 'default';
    case 'Delivered': return 'secondary';
    case 'Planned': return 'outline';
    case 'Pending': return 'outline';
    case 'Cancelled': return 'destructive';
    default: return 'default';
  }
};
const getInvoiceStatusVariant = (status: string) => {
  switch (status) {
    case 'Paid': return 'secondary';
    case 'Unpaid': return 'default';
    case 'Overdue': return 'destructive';
    case 'Draft': return 'outline';
    default: return 'default';
  }
};

export default async function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }
  
  const allInvoices = await getInvoices();
  const allTrips = await getTrips();

  const customerTrips = allTrips.filter(trip => trip.customer === customer.name);
  const customerInvoices = allInvoices.filter(invoice => invoice.customer === customer.company);
  const lifetimeValue = customerInvoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  
  const outstandingBalance = customerInvoices
    .filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue')
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalTrips = customerTrips.length;

  return (
    <div className="flex-1 space-y-8">
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
             <Link href="/customers">
                <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold">{customer.company}</h1>
                <Badge variant={getStatusVariant(customer.status) as 'secondary' | 'outline'}>{customer.status}</Badge>
              </div>
              <p className="text-muted-foreground">Customer since 2023</p>
            </div>
         </div>
        <Button asChild>
          <Link href={`/customers/edit/${customer.id}`}>Edit Customer</Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col gap-8">
          <Card>
            <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-1" />
                    <div><p className="font-medium">{customer.name}</p><p className="text-sm text-muted-foreground">Primary Contact</p></div>
                </div>
                 <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                    <div><p className="font-medium">{customer.email}</p><p className="text-sm text-muted-foreground">Email</p></div>
                </div>
                 <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                    <div><p className="font-medium">{customer.phone}</p><p className="text-sm text-muted-foreground">Phone</p></div>
                </div>
                 <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                    <div><p className="font-medium">{customer.address}</p><p className="text-sm text-muted-foreground">Billing Address</p></div>
                </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle>Customer Stats</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Lifetime Value</span><span className="font-bold text-lg">${lifetimeValue.toLocaleString()}</span></div>
                <Separator />
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Outstanding</span><span className="font-bold text-lg">${outstandingBalance.toLocaleString()}</span></div>
                <Separator />
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Total Trips</span><span className="font-bold text-lg">{totalTrips}</span></div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
           <Tabs defaultValue="trips">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Activity Feed</h2>
                    <TabsList>
                        <TabsTrigger value="trips"><Truck className="mr-2 h-4 w-4" />Trips</TabsTrigger>
                        <TabsTrigger value="invoices"><FileText className="mr-2 h-4 w-4" />Invoices</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="trips">
                  <Card>
                    <CardHeader><CardTitle>Recent Trips</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Trip ID</TableHead><TableHead>Route</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Revenue</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {customerTrips.map(trip => (
                                    <TableRow key={trip.id}>
                                        <TableCell><Link href={`/trips/${trip.id}`} className="text-primary hover:underline">{trip.id}</Link></TableCell>
                                        <TableCell>{trip.origin} &rarr; {trip.destination}</TableCell>
                                        <TableCell><Badge variant={getTripStatusVariant(trip.status) as any}>{trip.status}</Badge></TableCell>
                                        <TableCell className="text-right">${trip.revenue.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="invoices">
                    <Card>
                    <CardHeader><CardTitle>Recent Invoices</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                            <TableBody>
                                 {customerInvoices.map(invoice => (
                                    <TableRow key={invoice.id}>
                                        <TableCell><Link href={`/accounting/invoices/${invoice.id}`} className="text-primary hover:underline">{invoice.id}</Link></TableCell>
                                        <TableCell>{invoice.dueDate}</TableCell>
                                        <TableCell><Badge variant={getInvoiceStatusVariant(invoice.status) as any}>{invoice.status}</Badge></TableCell>
                                        <TableCell className="text-right">${invoice.total.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  );
}
