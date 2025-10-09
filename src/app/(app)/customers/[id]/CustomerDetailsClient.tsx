"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  Mail,
  MapPin,
  Phone,
  Truck,
  User,
} from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const getTripStatusVariant = (status: string) => {
  switch (status) {
    case "In Transit":
      return "default";
    case "Delivered":
      return "secondary";
    case "Planned":
    case "Pending":
      return "outline";
    case "Cancelled":
      return "destructive";
    default:
      return "default";
  }
};

const getInvoiceStatusVariant = (status: string) => {
  switch (status) {
    case "Paid":
      return "secondary";
    case "Unpaid":
      return "default";
    case "Overdue":
      return "destructive";
    case "Draft":
      return "outline";
    default:
      return "default";
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case "Active":
      return "secondary";
    case "On Leave":
      return "outline";
    case "Inactive":
      return "destructive";
    default:
      return "default";
  }
};

export default function CustomerDetailsClient({
  customer,
  driverTrips,
  customerInvoices,
  lifetimeValue,
  outstandingBalance,
  totalTrips,
}: {
  customer: any;
  driverTrips: any[];
  customerInvoices: any[];
  lifetimeValue: number;
  outstandingBalance: number;
  totalTrips: number;
}) {
  const form = useForm({
    defaultValues: { startDate: "", endDate: "" },
  });
  const { control, watch, reset } = form;
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const filteredTrips = useMemo(() => {
    return driverTrips.filter((trip) => {
      const tripDate = new Date(trip.date);
      const matchStart = !startDate || tripDate >= new Date(startDate);
      const matchEnd = !endDate || tripDate <= new Date(endDate);
      return matchStart && matchEnd;
    });
  }, [driverTrips, startDate, endDate]);

  const handleReset = () => reset({ startDate: "", endDate: "" });

  return (
    <div className="flex-1 space-y-8">
      {/* Header */}
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
              <Badge variant={getStatusVariant(customer.status) as any}>
                {customer.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">Customer since 2023</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/customers/edit/${customer.id}`}>Edit Customer</Link>
        </Button>
      </div>

      {/* Main content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">Primary Contact</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">{customer.email}</p>
                  <p className="text-sm text-muted-foreground">Email</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">{customer.phone}</p>
                  <p className="text-sm text-muted-foreground">Phone</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">{customer.address}</p>
                  <p className="text-sm text-muted-foreground">Billing Address</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Lifetime Value</span>
                <span className="font-bold text-lg">${lifetimeValue.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Outstanding</span>
                <span className="font-bold text-lg">${outstandingBalance.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Trips</span>
                <span className="font-bold text-lg">{totalTrips}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="trips">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Activity Feed</h2>
              <TabsList>
                <TabsTrigger value="trips">
                  <Truck className="mr-2 h-4 w-4" /> Trips
                </TabsTrigger>
                <TabsTrigger value="invoices">
                  <FileText className="mr-2 h-4 w-4" /> Invoices
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Trips Tab */}
            <TabsContent value="trips">
              <Card>
                       <CardHeader>
                    <CardTitle>Recent Trips</CardTitle>
                    <Form {...form}>
                      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                        <div className="flex flex-wrap gap-4 flex-grow">
                          <FormField
                            control={control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem className="w-48">
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    {...field}
                                    value={field.value}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem className="w-48">
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    {...field}
                                    value={field.value}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleReset}
                          className="self-end"
                        >
                          Reset Filters
                        </Button>
                      </div>
                    </Form>
                  </CardHeader>

                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Trip ID</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTrips.map((trip) => (
                        <TableRow key={trip.id}>
                          <TableCell>
                            <Link
                              href={`/trips/${trip.id}`}
                              className="text-primary hover:underline"
                            >
                              {trip.id}
                            </Link>
                          </TableCell>
                          <TableCell>{trip.origin} → {trip.destination}</TableCell>
                          <TableCell>
                            <Badge variant={getTripStatusVariant(trip.status) as any}>
                              {trip.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            ${trip.revenue.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <Link
                              href={`/accounting/invoices/${invoice.id}`}
                              className="text-primary hover:underline"
                            >
                              {invoice.id}
                            </Link>
                          </TableCell>
                          <TableCell>{invoice.dueDate}</TableCell>
                          <TableCell>
                            <Badge variant={getInvoiceStatusVariant(invoice.status) as any}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            ${invoice.total.toLocaleString()}
                          </TableCell>
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
