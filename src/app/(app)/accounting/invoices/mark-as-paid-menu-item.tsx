
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@/components/ui/alert-dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { markInvoiceAsPaidAction } from './actions';
import { Loader2 } from 'lucide-react';
import type { Invoice } from '@/services/invoice-service';

export function MarkAsPaidMenuItem({ invoiceId, invoiceStatus }: { invoiceId: string; invoiceStatus: Invoice['status'] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  
  const isActionable = invoiceStatus === 'Unpaid' || invoiceStatus === 'Overdue';
  
  async function handleMarkAsPaid() {
    setLoading(true);
    const result = await markInvoiceAsPaidAction(invoiceId);
    setLoading(false);

    if (result.success) {
      toast({
        title: 'Invoice Updated',
        description: `The invoice has been marked as paid.`,
      });
      setOpen(false);
      router.refresh(); // Refresh the list
    } else {
      toast({
        variant: 'destructive',
        title: 'Error Updating Invoice',
        description: result.error,
      });
    }
  }
  
  if (!isActionable) {
    return null;
  }

  // We stop event propagation on select to prevent the dropdown from closing
  // when the dialog is opened.
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          Mark as Paid
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will mark the invoice as paid and update the financial records. This action can be reversed by editing the invoice.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleMarkAsPaid} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
