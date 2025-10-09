
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, FileText, Printer, Download } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getInvoiceById } from '@/services/invoice-service';
import { MarkAsPaidButton } from '../mark-as-paid-button';
import InvoiceActions from './InvoiceActions';

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Paid': return 'secondary';
    case 'Unpaid': return 'default';
    case 'Overdue': return 'destructive';
    case 'Draft': return 'outline';
    default: return 'default';
  }
};

export default async function InvoiceDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/accounting/invoices"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-4">Invoice #{invoice.id}</h1>
            <p className="text-muted-foreground">Details for invoice to {invoice.customer}.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <InvoiceActions />
            <MarkAsPaidButton invoiceId={invoice.id} invoiceStatus={invoice.status} />
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
            <div>
                <CardTitle>Invoice to: {invoice.customer}</CardTitle>
                {invoice.tripId && <CardDescription>Trip ID: <Link href={`/trips/${invoice.tripId}`} className="text-primary hover:underline">{invoice.tripId}</Link></CardDescription>}
            </div>
            <div className="text-right">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={getStatusVariant(invoice.status) as any}>{invoice.status}</Badge>
            </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 grid md:grid-cols-3 gap-6">
            <div><p className="text-sm font-medium text-muted-foreground">Date Issued</p><p>{invoice.dateIssued}</p></div>
            <div><p className="text-sm font-medium text-muted-foreground">Due Date</p><p>{invoice.dueDate}</p></div>
            <div className="text-right md:text-left"><p className="text-sm font-medium text-muted-foreground">Invoice Total</p><p className="text-2xl font-bold">${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p></div>
        </CardContent>
        <Separator />
        <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Line Items</h3>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">Item</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoice.lineItems.map((item, index) => {
                            const amount = item.quantity * item.unitPrice;
                            return (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{item.item}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-medium">${amount.toFixed(2)}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
             <div className="flex justify-end mt-6">
                <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${invoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Tax</span>
                        <span>${invoice.totalTax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${invoice.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </CardContent>
        <Separator />
         <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Attachments</h3>
             {invoice.attachmentUrl ? (
                <Button variant="secondary" asChild>
                    <Link href={invoice.attachmentUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" /> Download Attachment
                    </Link>
                </Button>
            ) : (
                <div className="text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                    <FileText className="h-6 w-6 mx-auto mb-2" />
                    <p>No documents uploaded.</p>
                </div>
            )}
         </CardContent>
      </Card>
    </div>
  );
}
