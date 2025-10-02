"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";

import type { Trip } from "@/services/trip-service";
import type { Customer } from "@/services/customer-service";
import type { Employee } from "@/services/employee-service";
import type { Vehicle } from "@/services/vehicle-service";
import { updateTripAction } from "../../actions";
import { mockLocations } from "@/data/locations";

const tripFormSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  driverId: z.string().min(1, "Driver is required"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  pickupTime: z.string().min(1, "Pickup time is required"),
  estimatedDelivery: z.string().min(1, "Estimated delivery is required"),
  status: z.enum([
    "Planned",
    "In Transit",
    "Delivered",
    "Cancelled",
    "Pending",
  ]),
  distance: z.coerce.number().min(0, "Distance must be non-negative"),
  revenue: z.coerce.number().min(0, "Revenue must be non-negative"),
  notes: z.string().optional(),
});

type TripFormValues = z.infer<typeof tripFormSchema>;

const LOAD_RATE_PER_KM = 23.76;

type EditTripFormProps = {
  trip: Trip;
  customers: Customer[];
  drivers: Employee[];
  vehicles: Vehicle[];
};

export function EditTripForm({
  trip,
  customers,
  drivers,
  vehicles,
}: EditTripFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      ...trip,
      pickupTime: new Date(trip.pickupTime).toISOString().slice(0, 16),
      estimatedDelivery: new Date(trip.estimatedDelivery)
        .toISOString()
        .slice(0, 16),
      notes: trip.notes || "",
    },
  });

const [isDistanceEdited, setIsDistanceEdited] = useState(false);
const distance = form.watch("distance");

useEffect(() => {
  const dist = Number(distance);
  if (isDistanceEdited && !Number.isNaN(dist) && dist >= 0) {
    const calculatedRevenue = dist * LOAD_RATE_PER_KM;
    form.setValue("revenue", parseFloat(calculatedRevenue.toFixed(2)), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }
}, [distance, isDistanceEdited, form]);

console.log(form.watch())
  async function onSubmit(data: TripFormValues) {
    setLoading(true);

    const customer = customers.find((c) => c.id === data.customerId);
    const driver = drivers.find((d) => d.id === data.driverId);
    const vehicle = vehicles.find((v) => v.id === data.vehicleId);

    const tripData = {
      ...data,
      customer: customer?.name || "Unknown Customer",
      driver: driver?.name || "Unknown Driver",
      truck: vehicle?.licensePlate || "Unknown Vehicle",
    };

    const result = await updateTripAction(trip.id, tripData);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Trip Updated",
        description: `Trip #${trip.id} has been updated successfully.`,
      });
      router.push(`/trips/${trip.id}`);
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error Updating Trip",
        description: result.error,
      });
    }
  }

  const customerOptions = customers.map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const driverOptions = drivers.map((d) => ({ value: d.id, label: d.name }));
  const vehicleOptions = vehicles.map((v) => ({
    value: v.id,
    label: `${v.model} (${v.licensePlate})`,
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
            <CardDescription>
              Update the primary information for the trip.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Customer</FormLabel>
                    <Combobox
                      options={customerOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select a customer..."
                      searchPlaceholder="Search customers..."
                      emptyPlaceholder="No customer found."
                      disabled={loading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="driverId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Driver</FormLabel>
                    <Combobox
                      options={driverOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select a driver..."
                      searchPlaceholder="Search drivers..."
                      emptyPlaceholder="No driver found."
                      disabled={loading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Vehicle</FormLabel>
                    <Combobox
                      options={vehicleOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select a vehicle..."
                      searchPlaceholder="Search vehicles..."
                      emptyPlaceholder="No vehicle found."
                      disabled={loading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origin</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter origin..."
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
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
                            /> */}
              {/* <FormField
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
                            /> */}
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter destination..."
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="pickupTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Date & Time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedDelivery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Delivery</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
  control={form.control}
  name="distance"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Distance (km)</FormLabel>
      <FormControl>
        <Input
          type="number"
          placeholder="0"
          value={field.value ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            setIsDistanceEdited(true);
            field.onChange(raw === "" ? "" : Number(raw));
          }}
          onBlur={field.onBlur}
          disabled={loading}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

              <FormField
                control={form.control}
                name="revenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revenue (N$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        disabled={loading}
                        // readOnly
                      />
                    </FormControl>
                    <FormMessage />
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
                      disabled={loading}
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
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any important notes or instructions for the trip."
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/trips/${trip.id}`)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Trip
          </Button>
        </div>
      </form>
    </Form>
  );
}
