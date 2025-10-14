"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Trash2,
  UserPlus,
  DollarSign,
  Calculator,
  FileCheck2,
  Loader2,
  Search,
} from "lucide-react";
import { useRouter, useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getEmployees, type Employee } from "@/services/employee-service";
import { getPayrollRunById, type PayrollRun } from "@/services/payroll-service";
import { updatePayrollRunAction, finalizePayrollRunAction, getTripsForPayrollAction } from "../actions";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const employeePayrollSchema = z.object({
  employeeId: z.string(),
  name: z.string(),
  basePay: z.coerce.number().min(0, "Cannot be negative"),
  overtime: z.coerce.number().min(0).optional().default(0),
  bonus: z.coerce.number().min(0).optional().default(0),
  taxes: z.coerce.number().min(0, "Cannot be negative"),
  deductions: z.coerce.number().min(0).optional().default(0),
});

const payrollRunSchema = z.object({
  payPeriodStart: z.string().min(1, "Start date is required"),
  payPeriodEnd: z.string().min(1, "End date is required"),
  paymentDate: z.string().min(1, "Payment date is required"),
  employees: z.array(employeePayrollSchema),
});

type PayrollRunFormValues = z.infer<typeof payrollRunSchema>;

const getStatusVariant = (status: string) => {
  switch (status) {
    case "Paid":
      return "secondary";
    case "Draft":
      return "outline";
    default:
      return "default";
  }
};

export default function EditPayrollRunPage() {
  const router = useRouter();
  const params = useParams();
  const payrollId = params.id as string;
  const { toast } = useToast();

  const [payrollRun, setPayrollRun] = useState<PayrollRun | null>(null);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const form = useForm<PayrollRunFormValues>({
    resolver: zodResolver(payrollRunSchema),
  });

  useEffect(() => {
    async function fetchData() {
      if (!payrollId) return;
      setInitialLoading(true);
      const [runData, employeeData] = await Promise.all([
        getPayrollRunById(payrollId),
        getEmployees(),
      ]);

      if (runData) {
        setPayrollRun(runData);
        setAllEmployees(employeeData);
        form.reset({
          payPeriodStart: runData.payPeriodStart,
          payPeriodEnd: runData.payPeriodEnd,
          paymentDate: runData.paymentDate,
          employees: runData.employees,
        });
      }
      setInitialLoading(false);
    }
    fetchData();
  }, [payrollId, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "employees",
  });

  const watchEmployees = useWatch({
    control: form.control,
    name: "employees",
  });
  const [totals, setTotals] = useState({
    gross: 0,
    taxes: 0,
    deductions: 0,
    net: 0,
  });
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [isFinalizeDialogOpen, setIsFinalizeDialogOpen] = useState(false);
  const [selectedInDialog, setSelectedInDialog] = useState<
    Record<string, boolean>
  >({});
  const [searchTerm, setSearchTerm] = useState("");

  // useEffect(() => {
  //   if (!watchEmployees) return;
  //   const newTotals = watchEmployees.reduce(
  //     (acc, emp) => {
  //       const gross =
  //         (emp.basePay || 0) + (emp.overtime || 0) + (emp.bonus || 0);
  //       const totalDeductions = (emp.taxes || 0) + (emp.deductions || 0);
  //       const net = gross - totalDeductions;

  //       acc.gross += gross;
  //       acc.taxes += emp.taxes || 0;
  //       acc.deductions += emp.deductions || 0;
  //       acc.net += net;

  //       return acc;
  //     },
  //     { gross: 0, taxes: 0, deductions: 0, net: 0 }
  //   );

  //   setTotals(newTotals);
  // }, [watchEmployees]);
  useEffect(() => {
    if (!watchEmployees) return;

    const newTotals = watchEmployees.reduce(
      (acc, emp) => {
        const gross =
          (emp?.basePay || 0) + (emp?.overtime || 0) + (emp?.bonus || 0);
        const totalDeductions = (emp?.taxes || 0) + (emp?.deductions || 0);
        const net = gross - totalDeductions;

        acc.gross += gross;
        acc.taxes += emp?.taxes || 0;
        acc.deductions += emp?.deductions || 0;
        acc.net += net;

        return acc;
      },
      { gross: 0, taxes: 0, deductions: 0, net: 0 }
    );

    setTotals(newTotals);
  }, [watchEmployees]);
  const availableEmployees = allEmployees.filter(
    (emp) => !fields.some((f) => f.employeeId === emp.id)
  );
  const filteredAvailableEmployees = availableEmployees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.role && emp.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

const OVERTIME_RATE_PER_KM = 0.45;

const handleAddFromDialog = async () => {
  setFormLoading(true); // optional loading indicator

  const employeesToAdd = allEmployees.filter(
    (emp) => selectedInDialog[emp.id]
  );

  for (const emp of employeesToAdd) {
    try {
      // ✅ Fetch trips for this employee (for the selected payroll period)
      const actionResult = await getTripsForPayrollAction({
        driverId: emp.id,
        startDate: form.getValues("payPeriodStart"),
        endDate: form.getValues("payPeriodEnd"),
      });

      let overtime = 0;

      // ✅ If trips found, calculate total KM and overtime pay
      if (!("error" in actionResult)) {
        const driverTrips = actionResult.trips || [];
        const totalKm = driverTrips.reduce(
          (sum, trip) => sum + (trip.distance || 0),
          0
        );
        overtime = totalKm * OVERTIME_RATE_PER_KM;
      }

      // ✅ Append employee with calculated overtime
      append({
        employeeId: emp.id,
        name: emp.name,
        basePay: emp.baseSalary || 2000,
        taxes: (emp.baseSalary || 2000) * 0.2,
        overtime,
        bonus: 0,
        deductions: 50,
      });
    } catch (error) {
      console.error("Overtime calculation failed for:", emp.name, error);
      append({
        employeeId: emp.id,
        name: emp.name,
        basePay: emp.baseSalary || 2000,
        taxes: (emp.baseSalary || 2000) * 0.2,
        overtime: 0,
        bonus: 0,
        deductions: 50,
      });
    }
  }

  setFormLoading(false);
  setIsAddEmployeeDialogOpen(false);
  setSelectedInDialog({});
  setSearchTerm("");
};


  const handleSelectInDialog = (employeeId: string, checked: boolean) => {
    setSelectedInDialog((prev) => ({ ...prev, [employeeId]: checked }));
  };

  async function onSubmit(data: PayrollRunFormValues) {
    setFormLoading(true);
    const result = await updatePayrollRunAction(payrollId, data);
    setFormLoading(false);

    if (result.success) {
      toast({
        title: "Payroll Run Updated",
        description: "Your changes have been saved.",
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  }

  async function handleFinalize() {
    setFormLoading(true);
    const result = await finalizePayrollRunAction(payrollId);
    setFormLoading(false);
    setIsFinalizeDialogOpen(false);

    if (result.success) {
      toast({
        title: "Payroll Run Finalized",
        description: "This payroll run has been marked as paid.",
      });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  }

  if (initialLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (!payrollRun) {
    return notFound();
  }

  const isReadOnly = payrollRun.status !== "Draft" || formLoading;

  return (
    <div className="flex-1 space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Link href="/hr/payroll">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold">
                    Payroll Run #{payrollId}
                  </h1>
                  <Badge variant={getStatusVariant(payrollRun.status)}>
                    {payrollRun.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Edit and calculate payroll for this period.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/hr/payroll")}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isReadOnly}>
                {formLoading && fields.length > 0 && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
              <AlertDialog
                open={isFinalizeDialogOpen}
                onOpenChange={setIsFinalizeDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isReadOnly}
                  >
                    <FileCheck2 className="mr-2 h-4 w-4" />
                    Finalize
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Finalize Payroll Run?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will mark the payroll run as 'Paid' and lock it from
                      further editing. This action cannot be undone. Are you
                      sure?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFinalize}>
                      Confirm & Finalize
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <Card>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <FormField
                control={form.control}
                name="payPeriodStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pay Period Start</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} readOnly={isReadOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payPeriodEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pay Period End</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} readOnly={isReadOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} readOnly={isReadOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Employee</TableHead>
                  <TableHead>Base Pay</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Taxes</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead className="w-10 p-1"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => {
                  // const employee = watchEmployees[index];
                  // const grossPay =
                  //   parseFloat(employee.basePay as any) ||
                  //   0 + parseFloat(employee.overtime as any) ||
                  //   0 + parseFloat(employee.bonus as any) ||
                  //   0;

                  // const netPay =
                  //   grossPay -
                  //   (employee.taxes || 0) -
                  //   (employee.deductions || 0);
                  const employee = watchEmployees[index];
                  const grossPay =
                    Number(employee?.basePay || 0) +
                    Number(employee?.overtime || 0) +
                    Number(employee?.bonus || 0);

                  const netPay =
                    grossPay -
                    Number(employee?.taxes || 0) -
                    Number(employee?.deductions || 0);

                  return (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium">
                        {field.name}
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`employees.${index}.basePay`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value) || 0)
                                  }
                                  className="w-28"
                                  readOnly={isReadOnly}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`employees.${index}.overtime`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value) || 0)
                                  }
                                  className="w-24"
                                  readOnly={isReadOnly}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`employees.${index}.bonus`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value) || 0)
                                  }
                                  className="w-24"
                                  readOnly={isReadOnly}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="font-mono">
                        ${grossPay?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`employees.${index}.taxes`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                               value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value) || 0)
                                  }
                                  className="w-24"
                                  readOnly={isReadOnly}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`employees.${index}.deductions`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                 value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value) || 0)
                                  }
                                  className="w-24"
                                  readOnly={isReadOnly}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="font-mono font-bold">
                        ${netPay?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {!isReadOnly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              {!isReadOnly && (
                <Dialog
                  open={isAddEmployeeDialogOpen}
                  onOpenChange={setIsAddEmployeeDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Employee
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Employees to Payroll</DialogTitle>
                      <DialogDescription>
                        Select employees to add to this payroll run.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <ScrollArea className="h-72">
                      <div className="p-4 space-y-4">
                        {filteredAvailableEmployees.length > 0 ? (
                          filteredAvailableEmployees.map((emp) => (
                            <div
                              key={emp.id}
                              className="flex items-center space-x-3"
                            >
                              <Checkbox
                                id={`emp-${emp.id}`}
                                onCheckedChange={(checked) =>
                                  handleSelectInDialog(emp.id, !!checked)
                                }
                                checked={!!selectedInDialog[emp.id]}
                              />
                              <label
                                htmlFor={`emp-${emp.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {emp.name} ({emp.role})
                              </label>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center pt-4">
                            {availableEmployees.length === 0
                              ? "All employees have been added."
                              : "No employees found."}
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddEmployeeDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleAddFromDialog}>
                        Add Selected
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <Card className="w-full max-w-md">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Gross Pay
                  </span>
                  <span>${totals.gross?.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes</span>
                  <span>-${totals.taxes?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Other Deductions
                  </span>
                  <span>-${totals.deductions?.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Net Pay
                  </span>
                  <span>${totals.net?.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
