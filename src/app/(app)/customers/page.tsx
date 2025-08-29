
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { getCustomers } from '@/services/customer-service';
import { CustomerList } from './customer-list';

export default async function CustomersPage() {
  const customers = await getCustomers();

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
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-muted-foreground">Manage your customers here.</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/customers/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Customer
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            A list of all customers in your system, loaded from Firestore.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerList customers={customers} />
        </CardContent>
      </Card>
    </div>
  );
}
