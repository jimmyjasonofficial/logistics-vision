
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import type { Invoice } from '@/services/invoice-service';
import { DeleteInvoiceMenuItem } from './delete-invoice-menu-item';
import { MarkAsPaidMenuItem } from './mark-as-paid-menu-item';

type InvoiceTableProps = {
  invoices: Invoice[];
};

const getStatusVariant = (status: Invoice['status']) => {
  switch (status) {
    case 'Paid': return 'secondary';
    case 'Unpaid': return 'default';
    case 'Overdue': return 'destructive';
    case 'Draft': return 'outline';
    default: return 'default';
  }
};

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  if (invoices.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No invoices found for this category.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Issued</TableHead>
          <TableHead>Due</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead><span className="sr-only">Actions</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">
              <Link href={`/accounting/invoices/${invoice.id}`} className="text-primary hover:underline">{invoice.id}</Link>
            </TableCell>
            <TableCell><Link href={`/customers/${invoice.customerId}`} className="text-primary hover:underline">{invoice.customer}</Link></TableCell>
            <TableCell>{invoice.dateIssued}</TableCell>
            <TableCell>{invoice.dueDate}</TableCell>
            <TableCell className="text-right">N${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
            <TableCell><Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge></TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild><Link href={`/accounting/invoices/${invoice.id}`}>View Details</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href={`/accounting/invoices/edit/${invoice.id}`}>Edit</Link></DropdownMenuItem>
                  <MarkAsPaidMenuItem invoiceId={invoice.id} invoiceStatus={invoice.status} />
                  <DeleteInvoiceMenuItem invoiceId={invoice.id} />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
