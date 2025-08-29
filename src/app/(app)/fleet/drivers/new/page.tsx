
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Info } from 'lucide-react';

export default function NewDriverRedirectPage() {
  return (
    <div className="flex-1 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info /> Page Moved</CardTitle>
          <CardDescription>This page has been moved to the HR module for better organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            To add a new employee or driver, please use the unified employee management system in the HR section.
          </p>
          <Button asChild>
            <Link href="/hr/employees/new">Go to Add Employee Page</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
