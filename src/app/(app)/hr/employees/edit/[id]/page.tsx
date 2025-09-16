"use client";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, ImageIcon, Loader2 } from "lucide-react";
import { useRouter, useParams, notFound } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateEmployeeAction } from "../../actions";
import type { Employee } from "@/services/employee-service";
import { getEmployeeById } from "@/services/employee-service";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  deleteFile,
  getDownloadUrl,
  uploadFile,
} from "@/services/storage-service";

const employeeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  license: z.string().optional(),
  licenseExpiry: z.string().optional(),
  license_file: z
    .union([z.instanceof(File), z.string().url().min(1), z.string().min(1)])
    .optional()
    .refine((val) => {
      if (val instanceof File) {
        return ["image/png", "image/jpeg", "application/pdf"].includes(
          val.type
        );
      }
      return true;
    }, "Only PNG, JPG or PDF files are allowed")
    .refine((val) => {
      if (val instanceof File) {
        return val.size <= 5 * 1024 * 1024;
      }
      return true;
    }, "File size must be less than 5MB"),
  profile_image: z
    .union([z.instanceof(File), z.string().url().min(1), z.string().min(1)])
    .optional()
    .refine((val) => {
      if (val instanceof File) {
        return ["image/png", "image/jpeg"].includes(val.type);
      }
      return true;
    }, "Only PNG or JPG files are allowed")
    .refine((val) => {
      if (val instanceof File) {
        return val.size <= 3 * 1024 * 1024;
      }
      return true;
    }, "File size must be less than 3MB"),

  role: z.enum([
    "Driver",
    "Admin",
    "Operations",
    "Finance",
    "Assistance",
    "User",
    "Mechanic",
    "HR Manager",
    "Accountant",
    "Dispatcher",
    "Senior Driver",
  ]),
  status: z.enum(["Active", "On Leave", "Inactive"]),
  baseSalary: z.coerce.number().min(0).optional(),
  leaveAllowance: z.coerce.number().min(0).optional(),
});
type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export default function EditEmployeePage() {
  const [formLoading, setFormLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
  });

  const watchRole = form.watch("role");

  useEffect(() => {
    async function fetchEmployee() {
      if (!employeeId) return;
      setInitialLoading(true);
      const fetchedEmployee = await getEmployeeById(employeeId);
      if (fetchedEmployee) {
        setEmployee(fetchedEmployee);
        form.reset({
          ...fetchedEmployee,
          role: fetchedEmployee.role as any,
          license: fetchedEmployee.license || "",
          profile_image: fetchedEmployee.profile_image || "",
          licenseExpiry: fetchedEmployee.licenseExpiry || "",
          baseSalary: fetchedEmployee.baseSalary || 0,
          license_file: fetchedEmployee.license_file,
          leaveAllowance: fetchedEmployee.leaveAllowance || 0,
        });
        setPreview(fetchedEmployee.profile_image || "");
      }
      setInitialLoading(false);
    }
    fetchEmployee();
  }, [employeeId, form]);

  async function onSubmit(data: EmployeeFormValues) {
    console.log(data, "data");
    setLoading(true);
    if (data.license_file instanceof File) {
      if (employee?.license_file) {
        console.log(employee?.license_file, "employee?.license_file");
        await deleteFile(employee.license_file);
      }

      const ext = data.license_file.name.split(".").pop();
      const uniquePath = `employees/${Date.now()}_${data.license_file.name}`;

      const { gsPath } = await uploadFile(data.license_file, uniquePath);

      const downloadUrl = await getDownloadUrl(gsPath);
      if (!downloadUrl) throw new Error("File uploaded but URL not found");

      data.license_file = downloadUrl;
    }
     if (data.profile_image instanceof File) {
    if (employee?.profile_image) {
      await deleteFile(employee.profile_image);
    }
    const uniquePath = `employees/profile/${Date.now()}_${data.profile_image.name}`;
    const { gsPath } = await uploadFile(data.profile_image, uniquePath);
    const downloadUrl = await getDownloadUrl(gsPath);
    if (!downloadUrl) throw new Error("Profile photo uploaded but URL not found");
    data.profile_image = downloadUrl;
  }
    const result = await updateEmployeeAction(employeeId, data);
    setLoading(false);
    if (result.success) {
      toast({
        title: "Employee Updated",
        description: `Employee ${data.name} has been updated successfully.`,
      });
      router.push(`/hr/employees/${employeeId}`);
    } else {
      toast({
        variant: "destructive",
        title: "Error Updating Employee",
        description: result.error,
      });
    }
  }

  if (initialLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!employee) {
    return notFound();
  }

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/hr/employees/${employeeId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Employee #{employeeId}</h1>
          <p className="text-muted-foreground">
            Update the details for this employee.
          </p>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
              <CardDescription>
                Update the personal and professional details for this employee.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="profile_image"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-center">
                      <label className="relative cursor-pointer">
                        {preview ? (
                          <img
                            src={preview}
                            alt="Profile preview"
                            className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                            <ImageIcon className="w-10 h-10 text-gray-400" />
                          </div>
                        )}

                        <input
                          type="file"
                          accept="image/png, image/jpeg"
                          className="hidden"
                          disabled={loading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              field.onChange(file);
                              setPreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Click the image to upload (PNG/JPG, max 3MB)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., John Doe"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="e.g., john.d@example.com"
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 555-123-4567"
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
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Driver">Driver</SelectItem>
                          <SelectItem value="Senior Driver">
                            Senior Driver
                          </SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Operations">Operations</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Assistance">Assistance</SelectItem>
                          <SelectItem value="Dispatcher">Dispatcher</SelectItem>
                          <SelectItem value="Mechanic">Mechanic</SelectItem>
                          <SelectItem value="Accountant">Accountant</SelectItem>
                          <SelectItem value="HR Manager">HR Manager</SelectItem>
                          <SelectItem value="User">User</SelectItem>
                        </SelectContent>
                      </Select>
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
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="On Leave">On Leave</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {watchRole && watchRole.toLowerCase().includes("driver") && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="license"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., D1234567"
                            {...field}
                            value={field.value ?? ""}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="licenseExpiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Expiry Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ?? ""}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="license_file"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upload License</FormLabel>
                        <div className="flex items-center gap-4">
                          <Input
                            type="file"
                            accept="image/png, image/jpeg, application/pdf"
                            className="max-w-xs"
                            disabled={formLoading}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              field.onChange(file ?? undefined);
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload a PNG, JPG or PDF. Max size: 5MB.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="baseSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Salary (Monthly)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 6000"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(+event.target.value)
                          }
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="leaveAllowance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leave Allowance (Days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 20"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(+event.target.value)
                          }
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/hr/employees/${employeeId}`)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
