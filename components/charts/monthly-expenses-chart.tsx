"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthlyData } from '@/types/finance';
import { formatCurrency, formatMonth } from '@/lib/finance-utils';

interface MonthlyExpensesChartProps {
  data: MonthlyData[];
}

export function MonthlyExpensesChart({ data }: MonthlyExpensesChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    monthName: formatMonth(item.month),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="monthName" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Expenses']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Bar 
              dataKey="expenses" 
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}