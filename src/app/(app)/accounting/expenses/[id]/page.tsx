
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Download, Edit, File } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getExpenseById } from '@/services/expense-service';
import { DeleteExpenseButton } from '../delete-expense-button';

export default async function ExpenseDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const expense = await getExpenseById(id);

  if (!expense) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/accounting/expenses"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="text-3xl font-bold">Expense #{expense.id}</h1>
            <p className="text-muted-foreground">Details for expense from {expense.description}.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" asChild><Link href={`/accounting/expenses/edit/${expense.id}`}><Edit className="mr-2 h-4 w-4" /> Edit</Link></Button>
            <DeleteExpenseButton expenseId={expense.id} />
        </div>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>{expense.description}</CardTitle>
            <CardDescription><Badge variant="outline">{expense.category}</Badge></CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 pt-6">
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p>{expense.date}</p>
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Paid By</p>
                <p>{expense.paidBy}</p>
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Linked Trip</p>
                <p>{expense.tripId ? <Link href={`/trips/${expense.tripId}`} className="text-primary hover:underline">{expense.tripId}</Link> : 'N/A'}</p>
            </div>
            <div className="space-y-1 text-right md:text-left">
                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold">${expense.amount.toLocaleString()}</p>
            </div>
        </CardContent>
         <Separator />
        <CardContent className="pt-6 grid gap-6">
             <div>
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <p className="text-muted-foreground">{expense.notes || 'No notes for this expense.'}</p>
             </div>
             <div>
                <h3 className="text-lg font-semibold mb-2">Receipt / Attachment</h3>
                {expense.attachmentUrl ? (
                    <Button variant="secondary" asChild>
                        <Link href={expense.attachmentUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" /> Download Receipt
                        </Link>
                    </Button>
                ) : (
                    <div className="text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                        <File className="h-6 w-6 mx-auto mb-2" />
                        <p>No attachment uploaded.</p>
                    </div>
                )}
             </div>
        </CardContent>
      </Card>
    </div>
  );
}
