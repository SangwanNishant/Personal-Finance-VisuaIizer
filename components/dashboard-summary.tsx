"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/finance';
import { formatCurrency, getCurrentMonth, calculateCategorySpending } from '@/lib/finance-utils';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Target, AlertTriangle } from 'lucide-react';

interface DashboardSummaryProps {
  transactions: Transaction[];
}

export function DashboardSummary({ transactions }: DashboardSummaryProps) {
  const currentMonth = getCurrentMonth();
  const thisMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  
  const totalIncome = thisMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netIncome = totalIncome - totalExpenses;
  const categorySpending = calculateCategorySpending(thisMonthTransactions);
  const topCategory = categorySpending.reduce((max, cat) => 
    cat.amount > max.amount ? cat : max, { amount: 0, category: 'None' }
  );

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Income</CardTitle>
          <DollarSign className={`h-4 w-4 ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netIncome)}
          </div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          <Target className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(topCategory.amount)}</div>
          <p className="text-xs text-muted-foreground">{topCategory.category}</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((transaction, index) => (
                <div key={transaction.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-3">
                    <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                      {transaction.type}
                    </Badge>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}