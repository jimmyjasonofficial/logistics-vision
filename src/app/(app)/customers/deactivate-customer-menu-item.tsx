
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
import { deactivateCustomerAction } from './actions';
import { Loader2 } from 'lucide-react';

export function DeactivateCustomerMenuItem({ customerId, customerName }: { customerId: string; customerName: string; }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDeactivate() {
    setLoading(true);
    const result = await deactivateCustomerAction(customerId);
    setLoading(false);

    if (result.success) {
      toast({
        title: 'Customer Deactivated',
        description: `Customer ${customerName} has been successfully marked as inactive.`,
      });
      setOpen(false);
      router.refresh(); // Refresh the list
    } else {
      toast({
        variant: 'destructive',
        title: 'Error Deactivating Customer',
        description: result.error,
      });
    }
  }

  // We stop event propagation on select to prevent the dropdown from closing
  // when the dialog is opened.
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          Deactivate
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will mark the customer as inactive. They will not be available for new trips or invoices, but their historical data will be preserved.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeactivate} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
