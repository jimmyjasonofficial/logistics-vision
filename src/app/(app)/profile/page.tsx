
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { getUserById } from '@/services/user-service';

const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
});

const passwordFormSchema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function ProfilePage() {
  const { user, updateUserProfile, updateUserPassword } = useAuth();
  const { toast } = useToast();
  const { setTheme, theme } = useTheme();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [userRole, setUserRole] = useState('User');

  useEffect(() => {
    async function fetchUserRole() {
        if (user) {
            const appUser = await getUserById(user.uid);
            if (appUser) {
                setUserRole(appUser.role);
            }
        }
    }
    fetchUserRole();
  }, [user]);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: {
      displayName: user?.displayName ?? '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onProfileSubmit(data: ProfileFormValues) {
    setProfileLoading(true);
    try {
      await updateUserProfile({ displayName: data.displayName });
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update profile.',
      });
    } finally {
      setProfileLoading(false);
    }
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    setPasswordLoading(true);
    try {
      await updateUserPassword(data.newPassword);
      toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully.',
      });
      passwordForm.reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update password. You may need to sign in again.',
      });
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">User Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Update your personal information here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.email}`} alt={user?.displayName || ''} />
                    <AvatarFallback>{user?.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 flex-1">
                      <FormField
                        control={profileForm.control}
                        name="displayName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your Name" {...field} disabled={profileLoading} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                   </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={user?.email ?? ''} disabled />
                  <p className="text-sm text-muted-foreground">
                    Email address cannot be changed.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                   <Input id="role" value={userRole} disabled />
                </div>
                <Button type="submit" disabled={profileLoading}>
                  {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password & Security</CardTitle>
            <CardDescription>Change your password here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} disabled={passwordLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} disabled={passwordLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={passwordLoading}>
                  {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Change Password
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">Select the theme for the dashboard.</p>
                     <RadioGroup
                        onValueChange={setTheme}
                        defaultValue={theme}
                        className="grid max-w-md grid-cols-1 sm:grid-cols-3 gap-8 pt-2"
                        >
                        <div>
                            <Label className="[&:has([data-state=checked])>div]:border-primary">
                                <RadioGroupItem value="light" className="sr-only" />
                                <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                                    <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                                    <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                        <div className="h-2 w-4/5 rounded-lg bg-[#ecedef]" />
                                        <div className="h-2 w-full rounded-lg bg-[#ecedef]" />
                                    </div>
                                    <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                        <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                        <div className="h-2 w-full rounded-lg bg-[#ecedef]" />
                                    </div>
                                    </div>
                                </div>
                                <span className="block w-full p-2 text-center font-normal">
                                    Light
                                </span>
                            </Label>
                        </div>
                        <div>
                            <Label className="[&:has([data-state=checked])>div]:border-primary">
                                <RadioGroupItem value="dark" className="sr-only" />
                                <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:border-accent">
                                    <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                                    <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                        <div className="h-2 w-4/5 rounded-lg bg-slate-400" />
                                        <div className="h-2 w-full rounded-lg bg-slate-400" />
                                    </div>
                                    <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                        <div className="h-4 w-4 rounded-full bg-slate-400" />
                                        <div className="h-2 w-full rounded-lg bg-slate-400" />
                                    </div>
                                    </div>
                                </div>
                                <span className="block w-full p-2 text-center font-normal">
                                    Dark
                                </span>
                            </Label>
                        </div>
                        <div>
                            <Label className="[&:has([data-state=checked])>div]:border-primary">
                                <RadioGroupItem value="system" className="sr-only" />
                                <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                                    <div className="space-y-2 rounded-sm bg-gray-200 p-2 dark:bg-slate-950">
                                    <div className="space-y-2 rounded-md bg-white p-2 shadow-sm dark:bg-slate-800">
                                        <div className="h-2 w-4/5 rounded-lg bg-gray-200 dark:bg-slate-400" />
                                        <div className="h-2 w-full rounded-lg bg-gray-200 dark:bg-slate-400" />
                                    </div>
                                    <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm dark:bg-slate-800">
                                        <div className="h-4 w-4 rounded-full bg-gray-200 dark:bg-slate-400" />
                                        <div className="h-2 w-full rounded-lg bg-gray-200 dark:bg-slate-400" />
                                    </div>
                                    </div>
                                </div>
                                <span className="block w-full p-2 text-center font-normal">
                                    System
                                </span>
                            </Label>
                        </div>
                        </RadioGroup>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
