import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, Star, Users } from 'lucide-react';

export default function BillingPage() {
  const billingHistory = [
    { invoice: 'INV-2024-001', date: 'August 1, 2024', amount: '$99.00', status: 'Paid' },
    { invoice: 'INV-2024-002', date: 'July 1, 2024', amount: '$99.00', status: 'Paid' },
    { invoice: 'INV-2024-003', date: 'June 1, 2024', amount: '$99.00', status: 'Paid' },
  ];

  return (
    <div className="flex-1 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing &amp; Subscription</h1>
        <p className="text-muted-foreground">Manage your plan, payment methods, and view your billing history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>You are currently on the Pro Plan.</CardDescription>
              </div>
              <Button>Change Plan</Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span>Unlimited Trips</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Up to 10 Team Members</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>An overview of your past payments.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingHistory.map((item) => (
                    <TableRow key={item.invoice}>
                      <TableCell className="font-medium">{item.invoice}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell><Badge variant="secondary">{item.status}</Badge></TableCell>
                      <TableCell className="text-right">{item.amount}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Your primary payment card.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Visa ending in 1234</p>
                  <p className="text-sm text-muted-foreground">Expires 12/2026</p>
                </div>
              </div>
              <Button className="w-full">Update Payment Method</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
