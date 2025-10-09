// app/hr/employees/[id]/page.tsx
import { notFound } from "next/navigation";
import { getEmployeeById } from "@/services/employee-service";
import { getTrips } from "@/services/trip-service";
import EmployeeDetailsClient from "./EmployeeDetailsClient";

export default async function EmployeeDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const employee = await getEmployeeById(id);
  if (!employee) return notFound();

  const allTrips = await getTrips();
  const driverTrips = allTrips.filter((t) => t.driverId === employee.id);

  return <EmployeeDetailsClient employee={employee} driverTrips={driverTrips} />;
}
