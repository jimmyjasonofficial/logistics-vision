
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Settings, Users } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="flex-1 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your application settings and user roles.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/admin/settings">
            <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                        <Settings className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle>Settings</CardTitle>
                        <CardDescription>Configure general application settings.</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </Link>
        <Link href="/admin/roles">
             <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                     <div className="p-3 rounded-lg bg-primary/10 text-primary">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle>Roles & Permissions</CardTitle>
                        <CardDescription>Manage user roles and system access.</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </Link>
      </div>
    </div>
  );
}
