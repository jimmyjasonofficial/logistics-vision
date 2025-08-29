
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ReconciliationClientPage } from './reconciliation-client';
import type { Transaction } from './reconciliation-client';
import { getInvoices } from '@/services/invoice-service';
import { getExpenses } from '@/services/expense-service';

// In a real app, this would be fetched from your database/service layer.
const getSystemTransactions = async (): Promise<Transaction[]> => {
  const allInvoices = await getInvoices();
  const allExpenses = await getExpenses();

  const invoiceTransactions = allInvoices
    .filter(inv => inv.status === 'Paid')
    .map(inv => ({
      id: `INV-${inv.id}`,
      date: inv.dateIssued,
      description: `Invoice Payment: ${inv.id}`,
      amount: inv.total,
      type: 'credit' as const
    }));
  
  const expenseTransactions = allExpenses.map(exp => ({
    id: `EXP-${exp.id}`,
    date: exp.date,
    description: `Expense: ${exp.description}`,
    amount: exp.amount,
    type: 'debit' as const,
  }));
  
  return [...invoiceTransactions, ...expenseTransactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};


export default async function ReconciliationPage() {
  const initialSystemTransactions = await getSystemTransactions();

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
                <h1 className="text-3xl font-bold">Bank Reconciliation</h1>
                <p className="text-muted-foreground">Match your bank statement with your system records.</p>
            </div>
        </div>
      </div>
      <ReconciliationClientPage initialSystemTransactions={initialSystemTransactions} />
    </div>
  );
}
