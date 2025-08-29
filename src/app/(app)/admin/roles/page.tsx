import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RolesClientPage } from './roles-client';
import { getUsers } from '@/services/user-service';

export default async function RolesPage() {
    const users = await getUsers();

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link href="/admin">
                <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <div>
                <h1 className="text-3xl font-bold">Roles & Permissions</h1>
                <p className="text-muted-foreground">Manage user roles and their permissions across the system.</p>
            </div>
        </div>
      </div>
      
       <Card>
        <CardHeader>
            <CardTitle>System Users</CardTitle>
            <CardDescription>Assign roles to users to control their access levels.</CardDescription>
        </CardHeader>
        <CardContent>
            <RolesClientPage users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
