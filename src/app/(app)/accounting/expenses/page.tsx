export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle, File as FileIcon, Truck as TruckIcon, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getExpenses } from '@/services/expense-service';
import { DeleteExpenseMenuItem } from './delete-expense-menu-item';

export default async function ExpensesPage() {
  const expenses = await getExpenses();

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link href="/dashboard">
                <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <div>
                <h1 className="text-3xl font-bold">Expenses</h1>
                <p className="text-muted-foreground">Track and manage all business expenses.</p>
            </div>
        </div>
        <Button asChild>
            <Link href="/accounting/expenses/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Expense
            </Link>
        </Button>
      </div>
       <Card>
        <CardHeader>
            <CardTitle>Expense List</CardTitle>
            <CardDescription>A list of all recent business expenses from Firestore.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Paid By</TableHead>
                        <TableHead>Trip</TableHead>
                        <TableHead className="text-center">Receipt</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expenses.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                                No expenses found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        expenses.map((expense) => (
                            <TableRow key={expense.id}>
                                <TableCell>{expense.date}</TableCell>
                                <TableCell><Badge variant="outline">{expense.category}</Badge></TableCell>
                                <TableCell>
                                    <Link href={`/accounting/expenses/${expense.id}`} className="font-medium text-primary hover:underline">{expense.description}</Link>
                                </TableCell>
                                <TableCell>{expense.paidBy}</TableCell>
                                <TableCell>
                                    {expense.tripId ? <Link href={`/trips/${expense.tripId}`} className="text-primary hover:underline flex items-center gap-2"><TruckIcon className="h-4 w-4" />{expense.tripId}</Link> : 'N/A'}
                                </TableCell>
                                <TableCell className="text-center">{expense.hasAttachment ? <FileIcon className="h-4 w-4 mx-auto" /> : ''}</TableCell>
                                <TableCell className="text-right font-mono">${expense.amount.toFixed(2)}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem asChild><Link href={`/accounting/expenses/${expense.id}`}>View Details</Link></DropdownMenuItem>
                                        <DropdownMenuItem asChild><Link href={`/accounting/expenses/edit/${expense.id}`}>Edit</Link></DropdownMenuItem>
                                        <DeleteExpenseMenuItem expenseId={expense.id} />
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
