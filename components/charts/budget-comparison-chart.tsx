"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategorySpending } from '@/types/finance';
import { formatCurrency } from '@/lib/finance-utils';

interface BudgetComparisonChartProps {
  data: CategorySpending[];
}

export function BudgetComparisonChart({ data }: BudgetComparisonChartProps) {
  const chartData = data.map(item => ({
    category: item.category,
    spent: item.amount,
    budget: item.budget || 0,
    remaining: Math.max(0, (item.budget || 0) - item.amount),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs Actual Spending</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="category" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                formatCurrency(value), 
                name === 'spent' ? 'Spent' : name === 'budget' ? 'Budget' : 'Remaining'
              ]}
            />
            <Bar dataKey="budget" fill="#e5e7eb" name="budget" />
            <Bar dataKey="spent" fill="#3b82f6" name="spent" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}