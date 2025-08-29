
'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Download, File as FileIcon } from 'lucide-react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getExpenseById, type ExpenseWithUrl } from '@/services/expense-service';
import { updateExpenseAction } from '../../actions';

const expenseFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['Fuel', 'Repairs', 'Maintenance', 'Tyres', 'Tolls', 'Admin', 'Food & Lodging', 'Salaries', 'Other']),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  paidBy: z.enum(['Cash', 'Card', 'EFT', 'Petty Cash']),
  tripId: z.string().optional(),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const expenseId = params.id as string;
  const { toast } = useToast();
  
  const [expense, setExpense] = useState<ExpenseWithUrl | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
  });
  
  useEffect(() => {
    async function fetchExpense() {
        if (!expenseId) return;
        setInitialLoading(true);
        const fetchedExpense = await getExpenseById(expenseId);
        if (fetchedExpense) {
            setExpense(fetchedExpense);
            form.reset({
                ...fetchedExpense,
                tripId: fetchedExpense.tripId || '',
                notes: fetchedExpense.notes || '',
            });
        }
        setInitialLoading(false);
    }
    fetchExpense();
  }, [expenseId, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  async function onSubmit(data: ExpenseFormValues) {
    if (!expense) return;
    setLoading(true);
    
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (selectedFile) {
      formData.append('attachment', selectedFile);
    }

    const result = await updateExpenseAction(expenseId, formData);
    setLoading(false);

    if (result.success) {
      toast({
        title: 'Expense Updated',
        description: `Expense ${data.description} has been updated.`,
      });
      router.push(`/accounting/expenses/${expenseId}`);
      router.refresh();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error updating expense',
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

  if (!expense) {
      return notFound();
  }

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/accounting/expenses/${expenseId}`}><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Expense #{expenseId}</h1>
          <p className="text-muted-foreground">Update the details for this expense.</p>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader><CardTitle>Expense Details</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} disabled={loading} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} disabled={loading} /></FormControl><FormMessage /></FormItem>)} />
              </div>
               <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description / Vendor</FormLabel><FormControl><Input placeholder="e.g., Pilot Travel Center #123" {...field} disabled={loading} /></FormControl><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Fuel">Fuel</SelectItem><SelectItem value="Repairs">Repairs</SelectItem><SelectItem value="Maintenance">Maintenance</SelectItem><SelectItem value="Tyres">Tyres</SelectItem><SelectItem value="Tolls">Tolls</SelectItem><SelectItem value="Admin">Admin</SelectItem><SelectItem value="Food & Lodging">Food & Lodging</SelectItem><SelectItem value="Salaries">Salaries</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="paidBy" render={({ field }) => (
                  <FormItem><FormLabel>Paid By</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}><FormControl><SelectTrigger><SelectValue placeholder="Select payment method" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Cash">Cash</SelectItem><SelectItem value="Card">Card</SelectItem><SelectItem value="EFT">EFT</SelectItem><SelectItem value="Petty Cash">Petty Cash</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="tripId" render={({ field }) => (<FormItem><FormLabel>Linked Trip (Optional)</FormLabel><FormControl><Input placeholder="e.g., TRIP-001" {...field} value={field.value ?? ''} disabled={loading} /></FormControl><FormMessage /></FormItem>)} />
               <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Add any notes about this expense..." {...field} value={field.value ?? ''} disabled={loading} /></FormControl><FormMessage /></FormItem>)} />
               <FormItem>
                  <FormLabel>Receipt Attachment</FormLabel>
                  {expense.attachmentUrl ? (
                      <div className="flex items-center gap-4 p-2 border rounded-md bg-muted/50">
                          <FileIcon className="h-5 w-5" />
                          <span className="flex-1 text-sm truncate">Current receipt attached</span>
                          <Button asChild variant="secondary" size="sm">
                              <Link href={expense.attachmentUrl} target="_blank"><Download className="mr-2 h-4 w-4" /> Download</Link>
                          </Button>
                      </div>
                  ) : (
                      <p className="text-sm text-muted-foreground">No receipt was uploaded.</p>
                  )}
                  <FormControl>
                      <Input type="file" name="attachment" onChange={handleFileChange} disabled={loading} />
                  </FormControl>
                  <FormDescription>
                    {expense.attachmentUrl ? 'Uploading a new file will replace the existing one.' : 'Attach a photo or scan of the receipt.'}
                  </FormDescription>
              </FormItem>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => router.push(`/accounting/expenses/${expenseId}`)} disabled={loading}>Cancel</Button>
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
