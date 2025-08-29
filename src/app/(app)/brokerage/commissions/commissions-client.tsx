
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommissionTable, type CommissionWithAmount } from './commission-table';
import { useMemo } from 'react';
import { subMonths, isAfter } from 'date-fns';

type CommissionsClientPageProps = {
  commissions: CommissionWithAmount[];
};

export function CommissionsClientPage({ commissions }: CommissionsClientPageProps) {

  const { pendingCommissions, paidCommissions } = useMemo(() => {
    return {
      pendingCommissions: commissions.filter((c) => c.status === 'Pending'),
      paidCommissions: commissions.filter((c) => c.status === 'Paid'),
    };
  }, [commissions]);

  const { totalPending, totalPaidThisMonth } = useMemo(() => {
    const oneMonthAgo = subMonths(new Date(), 1);
    
    const pendingTotal = pendingCommissions.reduce((acc, curr) => acc + curr.amount, 0);

    const paidThisMonthTotal = paidCommissions
      .filter(c => isAfter(new Date(c.payoutDate), oneMonthAgo))
      .reduce((acc, curr) => acc + curr.amount, 0);
      
    return {
      totalPending: pendingTotal,
      totalPaidThisMonth: paidThisMonthTotal
    };
  }, [pendingCommissions, paidCommissions]);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Total amount awaiting payout.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid (Last 30 Days)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N${totalPaidThisMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Commissions paid out recently.</p>
          </CardContent>
        </Card>
      </div>

       <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <Card>
              <CardHeader><CardTitle>All Commissions</CardTitle><CardDescription>A complete list of all commissions.</CardDescription></CardHeader>
              <CardContent className="p-0"><CommissionTable commissions={commissions} /></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pending">
            <Card>
              <CardHeader><CardTitle>Pending Commissions</CardTitle><CardDescription>Commissions awaiting payout.</CardDescription></CardHeader>
              <CardContent className="p-0"><CommissionTable commissions={pendingCommissions} /></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="paid">
            <Card>
              <CardHeader><CardTitle>Paid Commissions</CardTitle><CardDescription>Commissions that have been paid out.</CardDescription></CardHeader>
              <CardContent className="p-0"><CommissionTable commissions={paidCommissions} /></CardContent>
            </Card>
          </TabsContent>
       </Tabs>
    </>
  );
}
