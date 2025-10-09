"use client";

import { Trip } from "@/services/trip-service";
import { useEffect, useMemo, useState } from "react";
import { getTrips } from "@/services/trip-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Form,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";

export default function TripSelectorModal({
  open,
  onClose,
  onAdd,
  customerId,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (trips: Trip[]) => void;
  customerId?: string;
}) {
  const [trips, setTrips] = useState<Trip[]>([]);
const HighlightText = ({
  text,
  highlight,
  to,
}: {
  text: string;
  highlight: string;
  to: string;
}) => {
  if (!highlight) return <span>{text}</span>;

  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <Link
            key={index}
            href={to}
            className="bg-primary text-white font-medium hover:underline"
          >
            {part}
          </Link>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};

  const [selectedTrips, setSelectedTrips] = useState<string[]>([]);

  const form = useForm({
    defaultValues: {
      customer: "",
      status: "",
      startDate: "",
      endDate: "",
    },
  });

  const { control, watch, reset } = form;
  const customerFilter = watch("customer");
  const statusFilter = watch("status");
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  useEffect(() => {
    async function fetchTrips() {
      try {
        const data = await getTrips();
        setTrips(data);
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    }

    if (open) {
      fetchTrips();
    }
  }, [open, customerId]);

  const toggleTrip = (id: string) => {
    setSelectedTrips((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    const selected = trips.filter((t) => selectedTrips.includes(t.id));
    onAdd(selected);
    onClose();
  };

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchCustomer =
        !customerFilter ||
        trip.customer?.toLowerCase().includes(customerFilter.toLowerCase());
      const matchStatus =
        !statusFilter ||
        statusFilter === "All" ||
        trip.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchStart =
        !startDate || new Date(trip.date) >= new Date(startDate);
      const matchEnd = !endDate || new Date(trip.date) <= new Date(endDate);
      return matchCustomer && matchStatus && matchStart && matchEnd;
    });
  }, [trips, customerFilter, statusFilter, startDate, endDate]);
  const handleReset = () => {
    reset({
      customer: "",
      status: "",
      startDate: "",
      endDate: "",
    });
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl overflow-hidden w-full h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Trips to Add</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField
              control={control}
              name="customer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filter by Customer</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter customer name..."
                      {...field}
                      value={field.value}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Planned">Planned</SelectItem>
                      <SelectItem value="In Transit">In Transit</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end mt-2">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset Filters
            </Button>
          </div>
        </Form>

        {/* Table */}
        <div className="flex-1 border rounded-md overflow-auto mt-4">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Trip ID</TableHead>
                <TableHead className="hidden sm:table-cell">Customer</TableHead>
                <TableHead className="hidden lg:table-cell">Route</TableHead>
                <TableHead className="hidden md:table-cell">Driver</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredTrips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedTrips.includes(trip.id)}
                      className="h-4 w-4 cursor-pointer accent-[#ff5900]"
                      onChange={() => toggleTrip(trip.id)}
                    />
                  </TableCell>

                  <TableCell className="font-medium">
                    <Link
                      href={`/trips/${trip.id}`}
                      className="text-primary hover:underline"
                    >
                      {trip.id}
                    </Link>
                  </TableCell>

                 <TableCell className="hidden sm:table-cell">
  <HighlightText
    text={trip.customer}
    highlight={form.watch("customer")}
    to={`/customers/${trip.customerId}`}
  />
</TableCell>


                  <TableCell className="hidden lg:table-cell">
                    {trip.origin} → {trip.destination}
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    <Link
                      href={`/fleet/drivers/${trip.driverId}`}
                      className="text-primary hover:underline"
                    >
                      {trip.driver}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}

              {filteredTrips.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    No trips available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={handleAdd} disabled={selectedTrips.length === 0}>
            Add Selected Trips
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
