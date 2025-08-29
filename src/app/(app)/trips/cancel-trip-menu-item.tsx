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
import { cancelTripAction } from './actions';
import { Loader2 } from 'lucide-react';

export function CancelTripMenuItem({ tripId }: { tripId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleCancel() {
    setLoading(true);
    const result = await cancelTripAction(tripId);
    setLoading(false);

    if (result.success) {
      toast({
        title: 'Trip Cancelled',
        description: `The trip has been successfully cancelled.`,
      });
      setOpen(false);
      router.refresh(); // Refresh the list
    } else {
      toast({
        variant: 'destructive',
        title: 'Error Cancelling Trip',
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
          Cancel Trip
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will mark the trip as cancelled. This can affect financial reports and driver assignments. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Go Back</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Confirm Cancellation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
