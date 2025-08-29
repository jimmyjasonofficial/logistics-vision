
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileCog, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import type { Payout } from '@/services/payout-service';
import type { CommissionWithAmount } from '@/app/(app)/brokerage/commissions/commission-table';
import { processPayoutAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type PayoutsClientPageProps = {
    payouts: Payout[];
    pendingCommissions: CommissionWithAmount[];
};

const getStatusVariant = (status: string) => {
    return status === 'Completed' ? 'secondary' : 'outline';
};

export function PayoutsClientPage({ payouts, pendingCommissions }: PayoutsClientPageProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const totalScheduled = payouts
        .filter(p => p.status === 'Scheduled')
        .reduce((acc, curr) => acc + curr.totalAmount, 0);

    const totalPaid = payouts
        .filter(p => p.status === 'Completed')
        .reduce((acc, curr) => acc + curr.totalAmount, 0);

    const totalForNextPayout = pendingCommissions.reduce((acc, c) => acc + c.amount, 0);
    
    async function handleProcessPayout() {
        setLoading(true);
        const result = await processPayoutAction({
            commissionIds: pendingCommissions.map(c => c.id),
            pendingCommissions: pendingCommissions,
        });
        setLoading(false);

        if (result.success) {
            toast({
                title: 'Payout Processed',
                description: `Payout #${result.payoutId} has been created and marked as paid.`,
            });
            setIsDialogOpen(false);
            router.refresh();
        } else {
             toast({
                variant: 'destructive',
                title: 'Error Processing Payout',
                description: result.error,
            });
        }
    }
    
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div></div> {/* Placeholder for alignment */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button disabled={pendingCommissions.length === 0}>
                            <FileCog className="mr-2 h-4 w-4" />
                            Process New Payout
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Process Payout</DialogTitle>
                            <DialogDescription>
                                Review the commissions included in this payout run. This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div>
                            <p className="font-semibold">Included Commissions:</p>
                            <div className="mt-2 space-y-1 text-sm text-muted-foreground max-h-60 overflow-y-auto">
                                {pendingCommissions.map(c => (
                                    <div key={c.id} className="flex justify-between">
                                        <span>{c.broker} (Trip #{c.tripId})</span>
                                        <span>${c.amount.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-2 border-t flex justify-between font-bold">
                                <span>Total Payout</span>
                                <span>${totalForNextPayout.toFixed(2)}</span>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={loading}>Cancel</Button>
                            <Button onClick={handleProcessPayout} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <CheckCircle className="mr-2 h-4 w-4" />Confirm Payout
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending for Next Payout</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalForNextPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground">Total amount from pending commissions.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground">All-time completed payouts.</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payout History</CardTitle>
                    <CardDescription>An overview of all scheduled and completed broker payouts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Payout ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Commissions</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payouts.map((payout) => (
                                <TableRow key={payout.id}>
                                    <TableCell className="font-medium">{payout.id}</TableCell>
                                    <TableCell>{payout.payoutDate}</TableCell>
                                    <TableCell>{payout.commissionsCount}</TableCell>
                                    <TableCell className="text-right font-mono">${payout.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell><Badge variant={getStatusVariant(payout.status) as 'secondary' | 'outline'}>{payout.status}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
