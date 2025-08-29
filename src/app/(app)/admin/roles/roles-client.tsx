'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateUserRoleAction } from './actions';
import { Loader2 } from 'lucide-react';
import type { AppUser } from '@/services/user-service';

type RolesClientPageProps = {
  users: AppUser[];
};

export function RolesClientPage({ users }: RolesClientPageProps) {
    const { toast } = useToast();
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

    const handleRoleChange = async (uid: string, newRole: string) => {
        setLoadingStates(prev => ({ ...prev, [uid]: true }));

        const result = await updateUserRoleAction(uid, newRole);

        if (result.success) {
            toast({
                title: 'Role Updated',
                description: `The user's role has been successfully updated to ${newRole}.`,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Error Updating Role',
                description: result.error,
            });
        }
        setLoadingStates(prev => ({ ...prev, [uid]: false }));
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Admin Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.uid}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={user.photoURL || `https://i.pravatar.cc/150?u=${user.email}`} alt={user.displayName || 'User'} />
                                    <AvatarFallback>{user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{user.displayName || 'No Name'}</span>
                            </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                {loadingStates[user.uid] && <Loader2 className="h-4 w-4 animate-spin" />}
                                <Select 
                                    defaultValue={user.role} 
                                    onValueChange={(newRole) => handleRoleChange(user.uid, newRole)}
                                    disabled={loadingStates[user.uid]}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                        <SelectItem value="Dispatcher">Dispatcher</SelectItem>
                                        <SelectItem value="Accountant">Accountant</SelectItem>
                                        <SelectItem value="Driver">Driver</SelectItem>
                                        <SelectItem value="User">User</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </TableCell>
                        <TableCell>
                            {user.isAdmin ? (
                                <Badge>Admin</Badge>
                            ) : (
                                <Badge variant="outline">User</Badge>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
