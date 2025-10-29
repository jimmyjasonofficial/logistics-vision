"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TripTable } from "./trip-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createInvoiceAction } from "../accounting/invoices/actions";
import { useRouter } from "next/navigation";
import type { Trip } from "@/services/trip-service";

export function TripsClientPage({ trips }: { trips: Trip[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedTrips, setSelectedTrips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    allTrips,
    plannedTrips,
    inTransitTrips,
    deliveredTrips,
    pendingTrips,
    cancelledTrips,
  } = useMemo(() => {
    return {
      allTrips: trips,
      plannedTrips: trips.filter((trip) => trip.status === "Planned"),
      inTransitTrips: trips.filter((trip) => trip.status === "In Transit"),
      deliveredTrips: trips.filter((trip) => trip.status === "Delivered"),
      pendingTrips: trips.filter((trip) => trip.status === "Pending"),
      cancelledTrips: trips.filter((trip) => trip.status === "Cancelled"),
    };
  }, [trips]);

  async function handleGenerateInvoice() {
    const selected = trips.filter((t) => selectedTrips.includes(t.id));

    const groupedByCustomer = selected.reduce((groups, trip) => {
      if (!groups[trip.customerId]) groups[trip.customerId] = [];
      groups[trip.customerId].push(trip);
      return groups;
    }, {} as Record<string, Trip[]>);

    for (const [customerId, customerTrips] of Object.entries(
      groupedByCustomer
    )) {
      const first = customerTrips[0];
      const lineItems = customerTrips.map((t) => ({
        item: `${t.origin} → ${t.destination}`,
        description: `Trip ${t.id}`,
        quantity: 1,
        unitPrice: t.revenue,
        amount: t.revenue,
        taxRate: "Exempt",
      }));

      const subtotal = lineItems.reduce((sum, i) => sum + i.amount, 0);
      const totalTax = 0;
      const total = subtotal + totalTax;

      const formData = new FormData();
      formData.append("customerId", first.customerId);
      formData.append("customer", first.customer);
      formData.append("dateIssued", new Date().toISOString().split("T")[0]);
      formData.append(
        "dueDate",
        new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
      );
      formData.append("taxType", "no_tax");
      formData.append("status", "Draft");
      formData.append("subtotal", String(subtotal));
      formData.append("totalTax", String(totalTax));
      formData.append("total", String(total));

      lineItems.forEach((item, index) => {
        Object.entries(item).forEach(([key, value]) => {
          formData.append(`lineItems[${index}].${key}`, String(value));
        });
      });

      const result = await createInvoiceAction(formData);

      if (result.success) {
        toast({
          title: "Invoice Created",
          description: `Invoice for ${first.customer} generated successfully.`,
        });
        router.push("/accounting/invoices?status=Draft");
      } else {
        toast({
          variant: "destructive",
          title: "Error Creating Invoice",
          description: result.error,
        });
      }
    }

    setSelectedTrips([]);
    router.refresh();
  }

  return (
    <Tabs defaultValue="all">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="planned">Planned</TabsTrigger>
        <TabsTrigger value="in-transit">In Transit</TabsTrigger>
        <TabsTrigger value="delivered">Delivered</TabsTrigger>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Trips</CardTitle>
              <CardDescription>
                A complete list of all trips in the system.
              </CardDescription>
            </div>
            <Button
              disabled={selectedTrips.length === 0 || loading}
              onClick={handleGenerateInvoice}
              className="ml-auto"
            >
              {loading ? "Generating..." : "Generate Invoice"}
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <TripTable
              trips={allTrips}
              selectedTrips={selectedTrips}
              setSelectedTrips={setSelectedTrips}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="planned">
        <Card>
          <CardHeader>
            <CardTitle>Planned</CardTitle>
            <CardDescription>
              Trips that are scheduled and ready for dispatch.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TripTable
              trips={plannedTrips}
              selectedTrips={selectedTrips}
              setSelectedTrips={setSelectedTrips}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="in-transit">
        <Card>
          <CardHeader>
            <CardTitle>In Transit</CardTitle>
            <CardDescription>
              Trips that are currently on the road.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TripTable
              trips={inTransitTrips}
              selectedTrips={selectedTrips}
              setSelectedTrips={setSelectedTrips}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="delivered">
        <Card>
          <CardHeader>
            <CardTitle>Delivered</CardTitle>
            <CardDescription>
              Trips that have been successfully delivered.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TripTable
              trips={deliveredTrips}
              selectedTrips={selectedTrips}
              setSelectedTrips={setSelectedTrips}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pending">
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
            <CardDescription>
              Trips that are awaiting confirmation or details.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TripTable
              trips={pendingTrips}
              selectedTrips={selectedTrips}
              setSelectedTrips={setSelectedTrips}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cancelled">
        <Card>
          <CardHeader>
            <CardTitle>Cancelled</CardTitle>
            <CardDescription>Trips that have been cancelled.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TripTable
              trips={cancelledTrips}
              selectedTrips={selectedTrips}
              setSelectedTrips={setSelectedTrips}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
