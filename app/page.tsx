"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransactionForm } from '@/components/transaction-form';
import { TransactionList } from '@/components/transaction-list';
import { MonthlyExpensesChart } from '@/components/charts/monthly-expenses-chart';
import { CategoryPieChart } from '@/components/charts/category-pie-chart';
import { BudgetComparisonChart } from '@/components/charts/budget-comparison-chart';
import { BudgetManager } from '@/components/budget-manager';
import { DashboardSummary } from '@/components/dashboard-summary';
import { SpendingInsights } from '@/components/spending-insights';
import { Transaction } from '@/types/finance';
import { storage } from '@/lib/storage';
import {
  calculateMonthlyData,
  calculateCategorySpending,
  calculateBudgetComparison,
  getCurrentMonth
} from '@/lib/finance-utils';
import { Plus, BarChart3, Target, Home, List, TrendingUp, Wallet } from 'lucide-react';

export default function HomePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadTransactions();
      setIsLoaded(true);
    }
  }, []);

  const loadTransactions = () => {
    const loaded = storage.getTransactions();
    setTransactions(loaded);
  };

  const handleTransactionSubmit = (transaction: Transaction) => {
    setTransactions(prev => {
      if (editingTransaction) {
        return prev.map(t => t.id === transaction.id ? transaction : t);
      } else {
        return [...prev, transaction];
      }
    });
    setShowTransactionForm(false);
    setEditingTransaction(undefined);
  };

  const handleTransactionEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleTransactionDelete = (id: string) => {
    const success = storage.deleteTransaction(id);
    if (success) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleFormCancel = () => {
    setShowTransactionForm(false);
    setEditingTransaction(undefined);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
            <Wallet className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Finance Tracker</h2>
          <p className="text-gray-600">Preparing your financial dashboard...</p>
        </div>
      </div>
    );
  }

  const monthlyData = calculateMonthlyData(transactions);
  const categorySpending = calculateCategorySpending(transactions);
  const budgetComparison = calculateBudgetComparison(getCurrentMonth());

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-10">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Personal Finance Tracker
              </h1>
              <p className="text-lg text-gray-600 mt-1">Take control of your finances with smart tracking and insights</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
            <TabsList className="grid w-full grid-cols-5 bg-transparent gap-2">
              <TabsTrigger value="dashboard" className="tab-btn">
                <Home className="h-4 w-4" />
                <span className="font-medium">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="transactions" className="tab-btn">
                <List className="h-4 w-4" />
                <span className="font-medium">Transactions</span>
              </TabsTrigger>
              <TabsTrigger value="charts" className="tab-btn">
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="budgets" className="tab-btn">
                <Target className="h-4 w-4" />
                <span className="font-medium">Budgets</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="tab-btn">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Insights</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-800">Financial Overview</h2>
              <Button onClick={() => setShowTransactionForm(true)} className="add-btn">
                <Plus className="h-5 w-5 mr-2" />
                <span className="font-medium">Add Transaction</span>
              </Button>
            </div>
            <DashboardSummary transactions={transactions} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <MonthlyExpensesChart data={monthlyData} />
              {categorySpending.length > 0 && (
                <CategoryPieChart data={categorySpending} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-800">Transaction Management</h2>
              <Button onClick={() => setShowTransactionForm(true)} className="add-btn">
                <Plus className="h-5 w-5 mr-2" />
                <span className="font-medium">Add Transaction</span>
              </Button>
            </div>
            <TransactionList
              transactions={transactions}
              onEdit={handleTransactionEdit}
              onDelete={handleTransactionDelete}
              onRefresh={loadTransactions}
            />
          </TabsContent>

          <TabsContent value="charts" className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Financial Analytics</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <MonthlyExpensesChart data={monthlyData} />
              {categorySpending.length > 0 && (
                <CategoryPieChart data={categorySpending} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Budget Planning</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <BudgetManager onUpdate={loadTransactions} />
              {budgetComparison.length > 0 && (
                <BudgetComparisonChart data={budgetComparison} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Spending Insights</h2>
            <SpendingInsights transactions={transactions} />
          </TabsContent>
        </Tabs>

        {showTransactionForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-lg">
              <TransactionForm
                transaction={editingTransaction}
                onSubmit={handleTransactionSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
