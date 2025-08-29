import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import type { Quote } from '@/services/quote-service';
import { DeleteQuoteMenuItem } from './delete-quote-menu-item';
import { SendQuoteMenuItem } from './send-quote-menu-item';
import { AcceptQuoteMenuItem } from './accept-quote-menu-item';

type QuoteTableProps = {
  quotes: Quote[];
};

const getStatusVariant = (status: Quote['status']) => {
  switch (status) {
    case 'Accepted': return 'secondary';
    case 'Sent': return 'default';
    case 'Draft': return 'outline';
    case 'Expired': return 'destructive';
    default: return 'default';
  }
};

export function QuoteTable({ quotes }: QuoteTableProps) {
  if (quotes.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No quotes found for this category.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Quote #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Issued</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead><span className="sr-only">Actions</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quotes.map((quote) => (
          <TableRow key={quote.id}>
            <TableCell className="font-medium">
              <Link href={`/accounting/quotes/${quote.id}`} className="text-primary hover:underline">{quote.id}</Link>
            </TableCell>
            <TableCell><Link href={`/customers/${quote.customerId}`} className="text-primary hover:underline">{quote.customer}</Link></TableCell>
            <TableCell>{quote.dateIssued}</TableCell>
            <TableCell>{quote.expiryDate}</TableCell>
            <TableCell className="text-right">${quote.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
            <TableCell><Badge variant={getStatusVariant(quote.status)}>{quote.status}</Badge></TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild><Link href={`/accounting/quotes/${quote.id}`}>View Details</Link></DropdownMenuItem>
                  {quote.status === 'Draft' && <DropdownMenuItem asChild><Link href={`/accounting/quotes/edit/${quote.id}`}>Edit</Link></DropdownMenuItem>}
                  <SendQuoteMenuItem quoteId={quote.id} quoteStatus={quote.status} />
                  <AcceptQuoteMenuItem quoteId={quote.id} quoteStatus={quote.status} />
                  <DropdownMenuItem asChild disabled={quote.status !== 'Accepted'}>
                    <Link href={`/accounting/invoices/new?fromQuote=${quote.id}`}>Convert to Invoice</Link>
                  </DropdownMenuItem>
                  <DeleteQuoteMenuItem quoteId={quote.id} />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
