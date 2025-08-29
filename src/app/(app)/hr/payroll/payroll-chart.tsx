
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { format } from 'date-fns';

type PayrollRunSummary = {
    payPeriodEnd: string;
    totalAmount: number;
};

type PayrollChartProps = {
    data: PayrollRunSummary[];
};

export function PayrollChart({ data }: PayrollChartProps) {
  const chartData = data
    .map(item => ({
      name: format(new Date(item.payPeriodEnd), 'MMM yy'),
      total: item.totalAmount,
    }))
    .reverse(); // Reverse to show oldest first

  if (data.length === 0) {
    return (
        <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">
            No paid payroll data to display in chart.
        </div>
    );
  }

  return (
    <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
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
                <Tooltip
                    cursor={{fill: 'hsl(var(--muted-foreground)/0.2)'}}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                        return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-1 gap-2">
                                <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">{payload[0].payload.name}</span>
                                <span className="font-bold text-muted-foreground">${(payload[0].value as number).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                            </div>
                        )
                        }
                        return null
                    }}
                />
                <Bar
                    dataKey="total"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
}
