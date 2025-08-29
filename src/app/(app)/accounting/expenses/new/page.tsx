
'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Sparkles, UploadCloud } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRef, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { parseReceiptAction, createExpenseAction } from '../actions';
import { cn } from '@/lib/utils';

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

export default function NewExpensePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  
  const tripIdFromQuery = searchParams.get('tripId');

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      description: '',
      tripId: tripIdFromQuery || '',
      notes: '',
    },
  });

  useEffect(() => {
    if (tripIdFromQuery) {
      form.setValue('tripId', tripIdFromQuery);
    }
  }, [tripIdFromQuery, form]);

  async function onSubmit(data: ExpenseFormValues) {
    setIsSaving(true);
    
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (selectedFile) {
      formData.append('attachment', selectedFile);
    }

    const result = await createExpenseAction(formData);
    setIsSaving(false);

    if (result.success && result.expenseId) {
      toast({
        title: 'Expense Created',
        description: `Expense ${data.description} has been created successfully.`,
      });
      router.push(`/accounting/expenses/${result.expenseId}`);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error Creating Expense',
        description: result.error,
      });
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
    setIsParsing(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      const result = await parseReceiptAction({ receiptImageUri: base64data });

      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'AI Parsing Failed',
          description: result.error,
        });
      } else {
        form.setValue('description', result.vendor);
        form.setValue('amount', result.amount);
        form.setValue('date', result.date);
        form.setValue('category', result.category);
        toast({
          title: 'Receipt Parsed!',
          description: 'The form has been pre-filled with the data from your receipt.',
        });
      }
      setIsParsing(false);
    };
    reader.onerror = () => {
        setIsParsing(false);
        toast({ variant: 'destructive', title: 'Error reading file.'});
    };
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const isLoading = isParsing || isSaving;

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/accounting/expenses"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Expense</h1>
          <p className="text-muted-foreground">Fill in the details or upload a receipt to start.</p>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader><CardTitle>Expense Details</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} disabled={isLoading} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} disabled={isLoading} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                 <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description / Vendor</FormLabel><FormControl><Input placeholder="e.g., Pilot Travel Center #123" {...field} disabled={isLoading} /></FormControl><FormMessage /></FormItem>)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={isLoading}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Fuel">Fuel</SelectItem><SelectItem value="Repairs">Repairs</SelectItem><SelectItem value="Maintenance">Maintenance</SelectItem><SelectItem value="Tyres">Tyres</SelectItem><SelectItem value="Tolls">Tolls</SelectItem><SelectItem value="Admin">Admin</SelectItem><SelectItem value="Food & Lodging">Food & Lodging</SelectItem><SelectItem value="Salaries">Salaries</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="paidBy" render={({ field }) => (
                    <FormItem><FormLabel>Paid By</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}><FormControl><SelectTrigger><SelectValue placeholder="Select payment method" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Cash">Cash</SelectItem><SelectItem value="Card">Card</SelectItem><SelectItem value="EFT">EFT</SelectItem><SelectItem value="Petty Cash">Petty Cash</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="tripId" render={({ field }) => (<FormItem><FormLabel>Linked Trip (Optional)</FormLabel><FormControl><Input placeholder="e.g., TRIP-001" {...field} disabled={isLoading} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Add any notes about this expense..." {...field} disabled={isLoading} /></FormControl><FormMessage /></FormItem>)} />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="sticky top-20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Parse with AI</CardTitle>
                </CardHeader>
                <CardContent>
                    <input type="file" name="attachment" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" disabled={isParsing} />
                    <div 
                        onClick={handleUploadClick}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors",
                            isParsing && "cursor-not-allowed bg-muted/50"
                        )}
                    >
                        {isParsing ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-muted-foreground">Parsing your receipt...</p>
                            </div>
                        ) : (
                             <div className="flex flex-col items-center gap-2">
                                <UploadCloud className="h-8 w-8 text-muted-foreground" />
                                <p className="font-semibold">{selectedFile ? selectedFile.name : 'Upload a receipt'}</p>
                                <p className="text-sm text-muted-foreground">{selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'The AI will automatically fill the form.'}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3 flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => router.push('/accounting/expenses')} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Expense
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
