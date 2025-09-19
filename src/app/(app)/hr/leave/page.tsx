'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarCheck, CalendarClock, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeaveTable } from './leave-table';
import { useMemo, useState, useEffect } from 'react';
import { isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getEmployees, type Employee } from '@/services/employee-service';
import { getLeaveRequestsAction, createLeaveRequestAction, updateLeaveRequestStatusAction } from './actions';
import type { LeaveRequest } from '@/services/leave-service';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LeavePage() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const [leaveRequests, employeeData] = await Promise.all([
                getLeaveRequestsAction(),
                getEmployees()
            ]);
            setRequests(leaveRequests);
            setEmployees(employeeData);
            setLoading(false);
        }
        fetchData();
    }, []);

    const {
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        approvedThisMonth,
    } = useMemo(() => {
        const today = new Date();
        const startOfThisMonth = startOfMonth(today);
        const endOfThisMonth = endOfMonth(today);

        const pending = requests.filter(r => r.status === 'Pending');
        const approved = requests.filter(r => r.status === 'Approved');
        const rejected = requests.filter(r => r.status === 'Rejected');
        
        const approvedThisMonthCount = approved.filter(r => 
            isWithinInterval(new Date(r.startDate), { start: startOfThisMonth, end: endOfThisMonth })
        ).length;

        return {
            pendingRequests: pending,
            approvedRequests: approved,
            rejectedRequests: rejected,
            approvedThisMonth: approvedThisMonthCount,
        }
    }, [requests]);

    async function handleStatusChange(requestId: string, status: 'Approved' | 'Rejected') {
        setActionLoading(true);
        const result = await updateLeaveRequestStatusAction(requestId, status);
        if (result.success) {
            toast({
                title: `Request ${status}`,
                description: `The leave request has been successfully ${status.toLowerCase()}.`,
            });
            router.refresh(); // Re-fetches data for server components & re-runs loader
            setRequests(prev => prev.map(req => req.id === requestId ? {...req, status: status} : req));
        } else {
            toast({
                variant: 'destructive',
                title: 'Error updating status',
                description: result.error,
            });
        }
        setActionLoading(false);
    }

    async function handleAddRequest(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setActionLoading(true);

        const formData = new FormData(e.currentTarget);
        const employeeId = formData.get('employee') as string;
        const employee = employees.find(emp => emp.id === employeeId);
        
        if (!employee) {
             toast({ variant: 'destructive', title: 'Invalid employee selected.' });
             setActionLoading(false);
             return;
        }

        const result = await createLeaveRequestAction({
            employee: employee.name,
            employeeId: employeeId,
            startDate: formData.get('start-date') as string,
            endDate: formData.get('end-date') as string,
            reason: formData.get('reason') as string,
            status: 'Pending',
        });
        
        if (result.success) {
            toast({
                title: 'Request Submitted',
                description: 'The new leave request has been created.',
            });
            const updatedRequests = await getLeaveRequestsAction();
            setRequests(updatedRequests);
            router.refresh();
            setIsDialogOpen(false);
        } else {
             toast({
                variant: 'destructive',
                title: 'Error creating request',
                description: result.error,
            });
        }
        setActionLoading(false);
    }

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
                <h1 className="text-3xl font-bold">Leave Management</h1>
                <p className="text-muted-foreground">Manage employee leave requests and balances.</p>
            </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Leave Request
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleAddRequest}>
                    <DialogHeader>
                        <DialogTitle>Submit New Leave Request</DialogTitle>
                        <DialogDescription>
                            Fill out the form below to request time off for an employee.
                        </DialogDescription>
                    </DialogHeader>
                     <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="employee" className="text-right">Employee</Label>
                            <Select name="employee" required disabled={actionLoading}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select an employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(emp => (
                                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="start-date" className="text-right">Start Date</Label>
                            <Input id="start-date" name="start-date" type="date" className="col-span-3" required disabled={actionLoading}/>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="end-date" className="text-right">End Date</Label>
                            <Input id="end-date" name="end-date" type="date" className="col-span-3" required disabled={actionLoading}/>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="reason" className="text-right">Reason</Label>
                             <Textarea id="reason" name="reason" placeholder="e.g., Vacation, Sick Leave" className="col-span-3" required disabled={actionLoading}/>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={actionLoading}>Cancel</Button>
                        <Button type="submit" disabled={actionLoading}>
                           {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                           Submit Request
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </div>

       <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">Requests needing review and approval.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedThisMonth}</div>
            <p className="text-xs text-muted-foreground">Total leave requests approved this month.</p>
          </CardContent>
        </Card>
      </div>
        {loading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        ) : (
            <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                    <Card>
                        <CardHeader><CardTitle>All Leave Requests</CardTitle><CardDescription>A complete list of all leave requests.</CardDescription></CardHeader>
                        <CardContent className="p-0">
                            <LeaveTable 
                                requests={requests}
                                actionLoading={actionLoading}
                                onApprove={(req) => handleStatusChange(req.id, 'Approved')}
                                onReject={(req) => handleStatusChange(req.id, 'Rejected')}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="pending">
                    <Card>
                        <CardHeader><CardTitle>Pending Requests</CardTitle><CardDescription>Leave requests awaiting approval.</CardDescription></CardHeader>
                        <CardContent className="p-0">
                            <LeaveTable 
                                requests={pendingRequests}
                                actionLoading={actionLoading}
                                onApprove={(req) => handleStatusChange(req.id, 'Approved')}
                                onReject={(req) => handleStatusChange(req.id, 'Rejected')}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="approved">
                    <Card>
                        <CardHeader><CardTitle>Approved Requests</CardTitle><CardDescription>All approved leave requests.</CardDescription></CardHeader>
                        <CardContent className="p-0"><LeaveTable requests={approvedRequests} actionLoading={actionLoading} /></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="rejected">
                    <Card>
                        <CardHeader><CardTitle>Rejected Requests</CardTitle><CardDescription>Leave requests that have been rejected.</CardDescription></CardHeader>
                        <CardContent className="p-0"><LeaveTable requests={rejectedRequests} actionLoading={actionLoading} /></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        )}
    </div>
  );
}
