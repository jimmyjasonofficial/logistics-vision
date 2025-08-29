
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import type { Invoice } from '@/services/invoice-service';

type RevenueChartProps = {
  invoices: Invoice[];
};

export function RevenueChart({ invoices }: RevenueChartProps) {
  
  const chartData = useMemo(() => {
    const monthlyRevenue: { [key: number]: number } = {};
    for (let i = 0; i < 12; i++) {
        monthlyRevenue[i] = 0;
    }

    invoices.forEach(invoice => {
        if (invoice.status === 'Paid') {
            const month = new Date(invoice.dateIssued).getMonth();
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + invoice.total;
        }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return Object.keys(monthlyRevenue).map(monthKey => {
      const monthIndex = parseInt(monthKey, 10);
      return {
        name: monthNames[monthIndex],
        total: monthlyRevenue[monthIndex]
      }
    });

  }, [invoices]);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue from paid invoices for the current year.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Bar
                dataKey="total"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
