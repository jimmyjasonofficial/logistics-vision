
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvoiceTable } from './invoice-table';
import { getInvoices } from '@/services/invoice-service';

export default async function InvoicesPage() {
  const invoices = await getInvoices();  
  const allInvoices = invoices;
  const paidInvoices = invoices.filter((invoice) => invoice.status === 'Paid');
  const unpaidInvoices = invoices.filter((invoice) => invoice.status === 'Unpaid');
  const overdueInvoices = invoices.filter((invoice) => invoice.status === 'Overdue');
  const draftInvoices = invoices.filter((invoice) => invoice.status === 'Draft');

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link href="/dashboard">
                <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <div>
                <h1 className="text-3xl font-bold">Invoices</h1>
                <p className="text-muted-foreground">Manage your customer invoices here.</p>
            </div>
        </div>
        <Button asChild>
            <Link href="/accounting/invoices/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Invoice
            </Link>
        </Button>
      </div>
        <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
                <Card>
                    <CardHeader><CardTitle>All Invoices</CardTitle><CardDescription>A list of all invoices from Firestore.</CardDescription></CardHeader>
                    <CardContent className="p-0"><InvoiceTable invoices={allInvoices} /></CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="draft">
                <Card>
                    <CardHeader><CardTitle>Draft Invoices</CardTitle><CardDescription>Invoices that have not been sent yet.</CardDescription></CardHeader>
                    <CardContent className="p-0"><InvoiceTable invoices={draftInvoices} /></CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="unpaid">
                <Card>
                    <CardHeader><CardTitle>Unpaid Invoices</CardTitle><CardDescription>Invoices awaiting payment.</CardDescription></CardHeader>
                    <CardContent className="p-0"><InvoiceTable invoices={unpaidInvoices} /></CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="paid">
                <Card>
                    <CardHeader><CardTitle>Paid Invoices</CardTitle><CardDescription>Invoices that have been successfully paid.</CardDescription></CardHeader>
                    <CardContent className="p-0"><InvoiceTable invoices={paidInvoices} /></CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="overdue">
                <Card>
                    <CardHeader><CardTitle>Overdue Invoices</CardTitle><CardDescription>Invoices that are past their due date.</CardDescription></CardHeader>
                    <CardContent className="p-0"><InvoiceTable invoices={overdueInvoices} /></CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
