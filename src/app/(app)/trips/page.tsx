export const dynamic = 'force-dynamic';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { getTrips } from "@/services/trip-service";
import { TripsClientPage } from "./trips-client";

export default async function TripsPage() {
  const trips = await getTrips();

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Trip Management</h1>
            <p className="text-muted-foreground">
              Oversee and manage all ongoing and completed trips.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/trips/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Trip
            </Link>
          </Button>
        </div>
      </div>
      <TripsClientPage trips={trips} />
    </div>
  );
}
