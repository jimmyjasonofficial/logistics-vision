"use server";

import {
  createEmployee,
  updateEmployee,
  getDrivers,
  type Employee,
} from "@/services/employee-service";
import type { EmployeeData } from "@/services/employee-service";
import { revalidatePath } from "next/cache";

export async function createEmployeeAction(data: any) {
  try {
    const newEmployee = await createEmployee(data);
    revalidatePath("/hr/employees");
    return { success: true, employeeId: newEmployee.id };
  } catch (e: any) {
    let errorMessage = e.message || "Failed to create employee.";
    if (String(e.message).includes("Firestore is not initialized")) {
      errorMessage =
        "A connection to the database could not be established. Please contact support if the issue persists.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function updateEmployeeAction(id: string, data: any) {
  try {
    await updateEmployee(id, data);
    revalidatePath("/hr/employees");
    revalidatePath(`/hr/employees/${id}`);
    return { success: true };
  } catch (e: any) {
    let errorMessage = e.message || "Failed to update employee.";
    if (String(e.message).includes("Firestore is not initialized")) {
      errorMessage =
        "A connection to the database could not be established. Please contact support if the issue persists.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function getDriversAction(): Promise<Employee[]> {
  return getDrivers();
}

