'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TripTable } from './trip-table';
import type { Trip } from '@/services/trip-service';

export function TripsClientPage({ trips }: { trips: Trip[] }) {
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
      plannedTrips: trips.filter((trip) => trip.status === 'Planned'),
      inTransitTrips: trips.filter((trip) => trip.status === 'In Transit'),
      deliveredTrips: trips.filter((trip) => trip.status === 'Delivered'),
      pendingTrips: trips.filter((trip) => trip.status === 'Pending'),
      cancelledTrips: trips.filter((trip) => trip.status === 'Cancelled'),
    };
  }, [trips]);

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
          <CardHeader>
            <CardTitle>All Trips</CardTitle>
            <CardDescription>
              A complete list of all trips in the system.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TripTable trips={allTrips} />
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
            <TripTable trips={plannedTrips} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="in-transit">
        <Card>
          <CardHeader>
            <CardTitle>In Transit</CardTitle>
            <CardDescription>Trips that are currently on the road.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TripTable trips={inTransitTrips} />
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
            <TripTable trips={deliveredTrips} />
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
            <TripTable trips={pendingTrips} />
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
            <TripTable trips={cancelledTrips} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
