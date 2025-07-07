"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/finance';
import { formatCurrency, getCurrentMonth, calculateCategorySpending } from '@/lib/finance-utils';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Target, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-0 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-emerald-700">Total Income</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{formatCurrency(totalIncome)}</div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
              <p className="text-xs text-emerald-600">This month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-0 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-red-700">Total Expenses</CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</div>
            <div className="flex items-center mt-2">
              <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              <p className="text-xs text-red-600">This month</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${netIncome >= 0 ? 'from-blue-50 to-indigo-50' : 'from-orange-50 to-red-50'} border-0 shadow-lg hover:shadow-xl transition-all duration-200`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className={`text-sm font-medium ${netIncome >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Net Income</CardTitle>
            <div className={`p-2 ${netIncome >= 0 ? 'bg-blue-100' : 'bg-orange-100'} rounded-lg`}>
              <DollarSign className={`h-4 w-4 ${netIncome >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              {formatCurrency(netIncome)}
            </div>
            <div className="flex items-center mt-2">
              {netIncome >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-blue-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-orange-500 mr-1" />
              )}
              <p className={`text-xs ${netIncome >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>This month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-0 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-purple-700">Top Category</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{formatCurrency(topCategory.amount)}</div>
            <p className="text-xs text-purple-600 mt-2">{topCategory.category}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Recent Transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No transactions yet</p>
              <p className="text-gray-400 text-sm mt-1">Add your first transaction to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction, index) => (
                <div key={transaction.id} className="group">
                  <div className="flex items-center justify-between p-4 bg-white/60 hover:bg-white/80 border border-gray-100 rounded-xl transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center space-x-4">
                      <Badge 
                        variant={transaction.type === 'income' ? 'default' : 'secondary'}
                        className={`${
                          transaction.type === 'income' 
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        } px-3 py-1 rounded-full font-medium`}
                      >
                        {transaction.type === 'income' ? 'Income' : 'Expense'}
                      </Badge>
                      <div>
                        <div className="font-medium text-gray-800">{transaction.description}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className={`text-right`}>
                      <div className={`text-lg font-bold ${
                        transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
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