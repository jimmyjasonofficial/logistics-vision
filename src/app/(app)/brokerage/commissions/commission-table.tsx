
'use client';

import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Commission } from '@/services/commission-service';

export type CommissionWithAmount = Commission & {
  amount: number;
};

type CommissionTableProps = {
  commissions: CommissionWithAmount[];
};

const getStatusVariant = (status: Commission['status']) => {
    return status === 'Paid' ? 'secondary' : 'outline';
};

export function CommissionTable({ commissions }: CommissionTableProps) {
  if (commissions.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No commissions found for this category.</div>;
  }
  
  return (
    <Table>
      <TableHeader>
          <TableRow>
              <TableHead>Broker</TableHead>
              <TableHead>Trip ID</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payout Date</TableHead>
          </TableRow>
      </TableHeader>
      <TableBody>
          {commissions.map((commission) => (
              <TableRow key={commission.id}>
                  <TableCell className="font-medium">{commission.broker}</TableCell>
                  <TableCell>
                      <Link href={`/trips/${commission.tripId}`} className="text-primary hover:underline">
                          {commission.tripId}
                      </Link>
                  </TableCell>
                  <TableCell className="text-right font-mono">N${commission.amount.toFixed(2)}</TableCell>
                  <TableCell><Badge variant={getStatusVariant(commission.status)}>{commission.status}</Badge></TableCell>
                  <TableCell>{commission.payoutDate}</TableCell>
              </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
