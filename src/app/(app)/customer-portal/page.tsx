import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomerPortalPage() {
  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
            <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
            </Button>
        </Link>
        <div>
            <h1 className="text-3xl font-bold">Customer Portal</h1>
            <p className="text-muted-foreground">A portal for clients to view their loads and invoices.</p>
        </div>
      </div>
       <Card className="text-center">
            <CardHeader>
                <div className="mx-auto bg-muted rounded-full p-4 w-fit">
                    <UserCheck className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4">Portal Under Construction</CardTitle>
                <CardDescription>This page is a placeholder for the customer-facing portal.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="max-w-md mx-auto text-muted-foreground">
                    In a real application, this would be a separate, secure area for your customers to log in, track their shipments in real-time, view and pay invoices, and manage their account details.
                </p>
                <Button className="mt-6">View Documentation</Button>
            </CardContent>
        </Card>
    </div>
  );
}
