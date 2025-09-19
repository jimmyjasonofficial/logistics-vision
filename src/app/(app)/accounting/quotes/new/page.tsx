"use client";

export const dynamic = 'force-dynamic';
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trash2, GripVertical, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";
import { getTripByIdAction } from "@/app/(app)/trips/actions";
import { createQuoteAction } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { getCustomers, type Customer } from "@/services/customer-service";
import { Combobox } from "@/components/ui/combobox";

const lineItemSchema = z.object({
  item: z.string().optional(),
  description: z.string().min(1, "Description is required."),
  quantity: z.coerce.number().min(0, "Qty must be non-negative.").default(1),
  unitPrice: z.coerce.number().min(0, "Price must be non-negative."),
  discount: z.coerce.number().min(0).max(100).optional().default(0),
  account: z.string().optional(),
  taxRate: z.string().optional(),
});

const quoteFormSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  reference: z.string().optional(),
  dateIssued: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  lineItems: z
    .array(lineItemSchema)
    .min(1, "At least one line item is required."),
  taxType: z.enum(["exclusive", "inclusive", "no_tax"]).default("exclusive"),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

const TAX_RATE_PERCENTAGE = 15;

export default function NewQuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
  });

  useEffect(() => {
    async function initializeForm() {
      setInitialLoading(true);

      const customersData = await getCustomers();
      setCustomers(customersData);
      const fromTripId = searchParams.get("fromTrip");
      const today = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(today.getDate() + 30);

      const defaultValues = {
        customerId: "",
        reference: "",
        dateIssued: today.toISOString().split("T")[0],
        expiryDate: expiryDate.toISOString().split("T")[0],
        lineItems: [
          {
            item: "",
            description: "",
            quantity: 1,
            unitPrice: 0,
            discount: 0,
            account: "200 - Sales",
            taxRate: "Tax on Sales (15%)",
          },
        ],
        taxType: "exclusive" as const,
      };

      let values = defaultValues;

      if (fromTripId) {
        const trip = await getTripByIdAction(fromTripId);
        if (trip) {
          const preTaxUnitPrice =
            trip.revenue / (1 + TAX_RATE_PERCENTAGE / 100);
          values = {
            customerId: trip.customerId,
            reference: `From Trip #${trip.id}`,
            dateIssued: today.toISOString().split("T")[0],
            expiryDate: expiryDate.toISOString().split("T")[0],
            lineItems: [
              {
                item: "FRGHT-TRIP",
                description: `Freight services from ${trip.origin} to ${trip.destination}`,
                quantity: 1,
                unitPrice: parseFloat(preTaxUnitPrice.toFixed(2)),
                discount: 0,
                account: "200 - Sales",
                taxRate: "Tax on Sales (15%)",
              },
            ],
            taxType: "exclusive",
          };
        }
      }
      form.reset(values);
      setInitialLoading(false);
    }

    initializeForm();
  }, [searchParams, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  const watchedLineItems = useWatch({
    control: form.control,
    name: "lineItems",
    defaultValue: form.getValues("lineItems"),
  });

  const [subtotal, setSubtotal] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!watchedLineItems) return;
    let newSubtotal = 0;
    let newTotalTax = 0;

    watchedLineItems?.forEach((item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const discount = Number(item.discount) || 0;

      const lineTotal = quantity * unitPrice;
      const discountAmount = lineTotal * (discount / 100);
      const discountedTotal = lineTotal - discountAmount;
      const taxAmount =
        item.taxRate === "Tax on Sales (15%)"
          ? discountedTotal * (TAX_RATE_PERCENTAGE / 100)
          : 0;

      newSubtotal += discountedTotal;
      newTotalTax += taxAmount;
    });

    setSubtotal(newSubtotal);
    setTotalTax(newTotalTax);
    setTotal(newSubtotal + newTotalTax);
  }, [watchedLineItems]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  async function onSubmit(data: QuoteFormValues) {
    setLoading(true);

    const customer = customers.find((c) => c.id === data.customerId);

    const formData = new FormData();
    formData.append("customerId", data.customerId);
    formData.append("customer", customer?.name || "Unknown Customer");
    if (data.reference) formData.append("reference", data.reference);
    formData.append("dateIssued", data.dateIssued);
    formData.append("expiryDate", data.expiryDate);
    formData.append("taxType", data.taxType);
    formData.append("status", "Draft");

    data.lineItems?.forEach((item, index) => {
      Object.entries(item).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(`lineItems[${index}].${key}`, String(value));
        }
      });
    });

    formData.append("subtotal", String(subtotal));
    formData.append("totalTax", String(totalTax));
    formData.append("total", String(total));

    if (selectedFile) {
      formData.append("attachment", selectedFile);
    }

    const result = await createQuoteAction(formData);
    setLoading(false);

    if (result.success && result.quoteId) {
      toast({
        title: "Quote Created",
        description: "The new quote has been saved as a draft.",
      });
      router.push(`/accounting/quotes/${result.quoteId}`);
    } else {
      toast({
        variant: "destructive",
        title: "Error Creating Quote",
        description: result.error,
      });
    }
  }

  if (initialLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  const customerOptions = customers.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/accounting/quotes">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">New Quote</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/accounting/quotes")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-3 lg:col-span-1">
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
                  name="dateIssued"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Optional reference"
                          {...field}
                          value={field.value ?? ""}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <FormField
                  control={form.control}
                  name="taxType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amounts are</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="exclusive">
                            Tax Exclusive
                          </SelectItem>
                          <SelectItem value="inclusive">
                            Tax Inclusive
                          </SelectItem>
                          <SelectItem value="no_tax">No Tax</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="border rounded-md">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8 p-0 px-2"></TableHead>
                    <TableHead className="min-w-[150px]">Item</TableHead>
                    <TableHead className="min-w-[200px]">Description</TableHead>
                    <TableHead className="min-w-[80px] text-right">
                      Qty.
                    </TableHead>
                    <TableHead className="min-w-[120px] text-right">
                      Price
                    </TableHead>
                    <TableHead className="min-w-[80px] text-right">
                      Disc. %
                    </TableHead>
                    <TableHead className="min-w-[200px]">Account</TableHead>
                    <TableHead className="min-w-[150px]">Tax rate</TableHead>
                    <TableHead className="w-[120px] text-right">
                      Tax amount
                    </TableHead>
                    <TableHead className="w-[150px] text-right">
                      Amount
                    </TableHead>
                    <TableHead className="w-10 p-1"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const quantity =
                      form.watch(`lineItems.${index}.quantity`) || 0;
                    const unitPrice =
                      form.watch(`lineItems.${index}.unitPrice`) || 0;
                    const discount =
                      form.watch(`lineItems.${index}.discount`) || 0;
                    const lineItem = form.watch(`lineItems.${index}`);

                    const lineTotal = quantity * unitPrice;
                    const discountAmount = lineTotal * (discount / 100);
                    const discountedTotal = lineTotal - discountAmount;
                    const taxAmount =
                      lineItem.taxRate === "Tax on Sales (15%)"
                        ? discountedTotal * (TAX_RATE_PERCENTAGE / 100)
                        : 0;
                    const finalAmount = discountedTotal + taxAmount;

                    return (
                      <TableRow key={field.id} className="align-top">
                        <TableCell className="p-2 align-middle cursor-grab">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lineItems.${index}.item`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Item code"
                                    {...field}
                                    value={field.value ?? ""}
                                    className="mt-1"
                                    disabled={loading}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lineItems.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea
                                    placeholder="Item description"
                                    {...field}
                                    className="mt-1 min-h-0 p-2"
                                    disabled={loading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lineItems.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="1"
                                    {...field}
                                    className="text-right mt-1"
                                    disabled={loading}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lineItems.${index}.unitPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                    className="text-right mt-1"
                                    disabled={loading}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lineItems.${index}.discount`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    {...field}
                                    className="text-right mt-1"
                                    disabled={loading}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lineItems.${index}.account`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="e.g. 200 - Sales"
                                    {...field}
                                    value={field.value ?? ""}
                                    className="mt-1"
                                    disabled={loading}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lineItems.${index}.taxRate`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  disabled={loading}
                                >
                                  <FormControl>
                                    <SelectTrigger className="mt-1">
                                      <SelectValue placeholder="Select tax rate" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Tax on Sales (15%)">
                                      Tax on Sales (15%)
                                    </SelectItem>
                                    <SelectItem value="Exempt">
                                      Exempt
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-right pt-4 pr-4">
                          {taxAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right pt-4 pr-4 font-medium">
                          {finalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="p-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    item: "",
                    description: "",
                    quantity: 1,
                    unitPrice: 0,
                    discount: 0,
                    account: "200 - Sales",
                    taxRate: "Tax on Sales (15%)",
                  })
                }
                disabled={loading}
              >
                Add row
              </Button>
            </div>
            <div className="w-full max-w-sm space-y-2 self-end">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  $
                  {subtotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total tax</span>
                <span className="font-medium">
                  $
                  {totalTax.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>TOTAL</span>
                <span>
                  $
                  {total.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <FormItem>
                <FormLabel>Attachment</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    name="attachment"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                </FormControl>
                <FormDescription>
                  Attach a relevant document (e.g., scope of work).
                </FormDescription>
              </FormItem>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
