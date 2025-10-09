"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Hash,
  Calendar,
  Truck,
  Edit,
  ArrowLeft,
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
      return "outline";
    case "Pending":
      return "outline";
    case "Cancelled":
      return "destructive";
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
export default function EmployeeDetailsClient({
  employee,
  driverTrips,
}: {
  employee: any;
  driverTrips: any[];
}) {
  const form = useForm({
    defaultValues: {
      startDate: "",
      endDate: "",
    },
  });

  const { control, watch, reset } = form;
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const filteredTrips = useMemo(() => {
    return driverTrips.filter((trip) => {
      const matchStart =
        !startDate || new Date(trip.date) >= new Date(startDate);
      const matchEnd = !endDate || new Date(trip.date) <= new Date(endDate);
      return matchStart && matchEnd;
    });
  }, [driverTrips, startDate, endDate]);

  const handleReset = () => reset({ startDate: "", endDate: "" });

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/hr/employees">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Employee Profile</h1>
            <p className="text-muted-foreground">
              View and manage employee details.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/hr/employees/edit/${employee.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Employee
          </Link>
        </Button>
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col gap-8">
          <Card>
            <CardHeader className="flex flex-col items-center text-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={employee?.photoUrl} alt={employee.name} />
                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div>
                <CardTitle className="text-3xl">{employee.name}</CardTitle>
                <CardDescription className="mt-1">
                  All details for employee #{employee.id}.
                </CardDescription>
              </div>

              <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
                <Badge
                  variant={
                    getStatusVariant(employee.status) as
                      | "default"
                      | "secondary"
                      | "outline"
                      | "destructive"
                  }
                >
                  {employee.status}
                </Badge>
                <Badge variant="outline">{employee.role}</Badge>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="flex flex-col gap-6 pt-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email Address
                </p>
                <p className="pl-6">{employee.email}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone Number
                </p>
                <p className="pl-6">{employee.phone}</p>
              </div>

              {employee.role.toLowerCase().includes("driver") && (
                <>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Hash className="h-4 w-4" /> License No.
                    </p>
                    <p className="pl-6">{employee.license || "N/A"}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> License Expiry
                    </p>
                    <p className="pl-6">{employee.licenseExpiry || "N/A"}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Truck className="h-4 w-4" /> Total Trips
                    </p>
                    <p className="pl-6">{driverTrips?.length}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {(employee?.role === "Driver" ||
          employee?.role === "Senior Driver") && (
          <div className="lg:col-span-2">
            <Tabs defaultValue="trips">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Activity Feed</h2>
                <TabsList>
                  <TabsTrigger value="trips">
                    <Truck className="mr-2 h-4 w-4" />
                    Trips
                  </TabsTrigger>
                </TabsList>
              </div>
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
                        {filteredTrips?.map((trip) => (
                          <TableRow key={trip?.id}>
                            <TableCell>
                              <Link
                                href={`/trips/${trip?.id}`}
                                className="text-primary hover:underline"
                              >
                                {trip?.id}
                              </Link>
                            </TableCell>
                            <TableCell>
                              {trip?.origin} &rarr; {trip?.destination}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  getTripStatusVariant(trip?.status) as any
                                }
                              >
                                {trip?.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              ${trip?.revenue.toLocaleString()}
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
        )}
      </div>
    </div>
  );
}
