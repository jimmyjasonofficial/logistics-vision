
'use client';

import { useState, useMemo, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ArrowLeft, Calendar as CalendarIcon, DollarSign, TrendingDown, TrendingUp, Wand2, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

import type { Invoice } from '@/services/invoice-service';
import type { Expense } from '@/services/expense-service';
import type { Trip } from '@/services/trip-service';

import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getFinancialAnalysisAction, getPnlDataAction } from './actions';

export default function PnLPage() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });

    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!date?.from || !date?.to) return;
            setLoadingData(true);
            const startDate = format(date.from, 'yyyy-MM-dd');
            const endDate = format(date.to, 'yyyy-MM-dd');

            const pnlData = await getPnlDataAction(startDate, endDate);

            if ('error' in pnlData) {
                console.error(pnlData.error);
            } else {
                setInvoices(pnlData.invoices);
                setExpenses(pnlData.expenses);
                setTrips(pnlData.trips);
            }
            
            setLoadingData(false);
        }
        fetchData();
    }, [date]);

    const financials = useMemo(() => {
        // Revenue from paid invoices
        const relevantInvoices = invoices.filter(inv => inv.status === 'Paid');
        const totalRevenue = relevantInvoices.reduce((sum, inv) => sum + inv.total, 0);

        // Expenses from logs
        const expenseBreakdownMap = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {} as Record<string, number>);

        // Calculated expenses from trips
        const relevantTrips = trips.filter(trip => trip.status === 'Delivered');

        const tireCosts = relevantTrips.reduce((sum, trip) => sum + trip.distance * 0.30, 0);
        const messCosts = relevantTrips.reduce((sum, trip) => sum + (trip.distance / 100) * 66.6, 0);

        if (tireCosts > 0) {
            expenseBreakdownMap['Tire Wear'] = (expenseBreakdownMap['Tire Wear'] || 0) + tireCosts;
        }
        if (messCosts > 0) {
            expenseBreakdownMap['Mess / Other Distance Costs'] = (expenseBreakdownMap['Mess / Other Distance Costs'] || 0) + messCosts;
        }

        const expenseBreakdown = Object.entries(expenseBreakdownMap)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a,b) => b.amount - a.amount);
            
        const totalExpenses = expenseBreakdown.reduce((sum, item) => sum + item.amount, 0);

        const netProfit = totalRevenue - totalExpenses;
        
        const chartData = [
            { name: 'Revenue', value: totalRevenue, fill: 'hsl(var(--primary))' },
            { name: 'Expenses', value: totalExpenses, fill: 'hsl(var(--destructive))' }
        ];

        return { totalRevenue, totalExpenses, netProfit, expenseBreakdown, chartData };

    }, [invoices, expenses, trips]);

    const handleAiQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiQuery) return;
        setIsAnalyzing(true);
        setAiResponse(null);
        setAiError(null);

        const result = await getFinancialAnalysisAction({ query: aiQuery });
        
        if ('error' in result) {
            setAiError(result.error);
        } else {
            setAiResponse(result.analysis);
        }

        setIsAnalyzing(false);
    }
    
    if (loadingData && !invoices.length && !expenses.length && !trips.length) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8">
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        );
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
                        <h1 className="text-3xl font-bold">Profit &amp; Loss</h1>
                        <p className="text-muted-foreground">Analyze your company's financial performance.</p>
                    </div>
                </div>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                        date.to ? (
                            <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
            </div>
            
            <div className="relative">
                {loadingData && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                )}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">N${financials.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                            <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">N${financials.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={cn("text-2xl font-bold", financials.netProfit >= 0 ? 'text-green-500' : 'text-destructive')}>
                            N${financials.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5 mt-8">
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Financial Breakdown</CardTitle>
                            <CardDescription>A detailed list of income and expenses for the selected period.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="font-bold bg-muted/20">
                                        <TableCell>Revenue</TableCell>
                                        <TableCell className="text-right text-green-500">+N${financials.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                                    </TableRow>
                                    <TableRow className="font-bold bg-muted/20">
                                        <TableCell>Expenses</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                    {financials.expenseBreakdown.length > 0 ? (
                                        financials.expenseBreakdown.map(exp => (
                                        <TableRow key={exp.category}>
                                            <TableCell className="pl-8">{exp.category}</TableCell>
                                            <TableCell className="text-right text-destructive">- N${exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center text-muted-foreground">No expenses in this period.</TableCell>
                                        </TableRow>
                                    )}
                                    <TableRow className="font-bold border-t-2 border-primary">
                                        <TableCell>Net Profit</TableCell>
                                        <TableCell className={cn("text-right", financials.netProfit >= 0 ? 'text-green-500' : 'text-destructive')}>
                                            N${financials.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Visual Overview</CardTitle>
                            <CardDescription>Revenue vs. Expenses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={financials.chartData} layout="vertical" margin={{ left: 10 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{fill: 'hsl(var(--muted-foreground)/0.2)'}}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">{payload[0].name}</span>
                                                    <span className="font-bold text-muted-foreground">N${(payload[0].value as number).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                </div>
                                            )
                                            }
                                            return null
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wand2 className="h-6 w-6 text-primary" />
                                AI Financial Analyst
                            </CardTitle>
                            <CardDescription>Ask questions about your financial data in plain English. Try "What were our total expenses last month?" or "Compare fuel costs to maintenance costs."</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAiQuery} className="flex items-center gap-4">
                                <Input 
                                    placeholder="Ask a financial question..."
                                    value={aiQuery}
                                    onChange={(e) => setAiQuery(e.target.value)}
                                    disabled={isAnalyzing}
                                />
                                <Button type="submit" disabled={isAnalyzing || !aiQuery}>
                                    {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Ask AI
                                </Button>
                            </form>
                            
                            <div className="mt-6 min-h-[6rem]">
                                {isAnalyzing && (
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <p className="mt-2">Analyzing your data...</p>
                                    </div>
                                )}
                                {aiError && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Analysis Failed</AlertTitle>
                                        <AlertDescription>{aiError}</AlertDescription>
                                    </Alert>
                                )}
                                {aiResponse && (
                                    <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted/50 rounded-lg whitespace-pre-wrap">
                                        <p>{aiResponse}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
