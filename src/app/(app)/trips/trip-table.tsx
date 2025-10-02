import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import type { Trip } from "@/services/trip-service";
import { CancelTripMenuItem } from "./cancel-trip-menu-item";
import { CompleteTripMenuItem } from "./complete-trip-menu-item";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { deleteTripAction } from "./actions";
import { DeleteMenuItem } from "@/components/ui/DeleteButton";

type TripTableProps = {
  trips: Trip[];
};

const getStatusVariant = (status: Trip["status"]) => {
  switch (status) {
    case "In Transit":
      return "default";
    case "Delivered":
      return "secondary";
    case "Pending":
      return "outline";
    case "Planned":
      return "outline";
    case "Cancelled":
      return "destructive";
    default:
      return "default";
  }
};

export function TripTable({ trips }: TripTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete(id: string ) {
    setLoading(true);
    const result = await deleteTripAction(id);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Trip Deleted",
        description: `The Trip has been successfully deleted.`,
      });
      setOpen(false);
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error Deleting Trip",
        description: result.error,
      });
    }
  }

  if (trips.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No trips found for this category.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Trip ID</TableHead>
          <TableHead className="hidden sm:table-cell">Customer</TableHead>
          <TableHead className="hidden lg:table-cell">Route</TableHead>
          <TableHead className="hidden md:table-cell">Driver</TableHead>
          <TableHead>Truck</TableHead>
          <TableHead className="hidden lg:table-cell text-right">
            Revenue
          </TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trips.map((trip) => {
          const isCancellable =
            trip.status !== "Delivered" && trip.status !== "Cancelled";
          return (
            <TableRow key={trip.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/trips/${trip.id}`}
                  className="text-primary hover:underline"
                >
                  {trip.id}
                </Link>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Link
                  href={`/customers/${trip.customerId}`}
                  className="text-primary hover:underline"
                >
                  {trip.customer}
                </Link>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {trip.origin} to {trip.destination}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Link
                  href={`/fleet/drivers/${trip.driverId}`}
                  className="text-primary hover:underline"
                >
                  {trip.driver}
                </Link>
              </TableCell>
              <TableCell>{trip.truck}</TableCell>
              <TableCell className="hidden lg:table-cell text-right">
                ${trip.revenue.toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    getStatusVariant(trip.status) as
                      | "default"
                      | "secondary"
                      | "outline"
                      | "destructive"
                  }
                >
                  {trip.status}
                </Badge>
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
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/trips/${trip.id}`}>View Details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/trips/edit/${trip.id}`}>Edit Trip</Link>
                    </DropdownMenuItem>
                    <CompleteTripMenuItem
                      tripId={trip.id}
                      tripStatus={trip.status}
                    />
                    {isCancellable ? (
                      <CancelTripMenuItem tripId={trip.id} />
                    ) : (
                      <DropdownMenuItem disabled>Cancel Trip</DropdownMenuItem>
                    )}
                    <DeleteMenuItem
                      name={"Trip"}
                      handleDelete={() => handleDelete(trip?.id)}
                      setOpen={setOpen}
                      loading={loading}
                      open={open}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
