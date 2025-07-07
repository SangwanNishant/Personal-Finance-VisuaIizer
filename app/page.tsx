"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { MonthlyExpensesChart } from "@/components/charts/monthly-expenses-chart";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { BudgetComparisonChart } from "@/components/charts/budget-comparison-chart";
import { BudgetManager } from "@/components/budget-manager";
import { DashboardSummary } from "@/components/dashboard-summary";
import { SpendingInsights } from "@/components/spending-insights";
import { Transaction } from "@/types/finance";
import { storage } from "@/lib/storage";
import {
  calculateMonthlyData,
  calculateCategorySpending,
  calculateBudgetComparison,
  getCurrentMonth,
} from "@/lib/finance-utils";
import {
  Plus,
  BarChart3,
  PieChart,
  Target,
  Home as HomeIcon,
  List,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    const loaded = storage.getTransactions();
    setTransactions(loaded);
  };

  const handleTransactionSubmit = (transaction: Transaction) => {
    setTransactions((prev) => {
      if (editingTransaction) {
        return prev.map((t) => (t.id === transaction.id ? transaction : t));
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
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleFormCancel = () => {
    setShowTransactionForm(false);
    setEditingTransaction(undefined);
  };

  const monthlyData = calculateMonthlyData(transactions);
  const categorySpending = calculateCategorySpending(transactions);
  const budgetComparison = calculateBudgetComparison(getCurrentMonth());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Personal Finance Tracker</h1>
          <p className="text-gray-600">
            Take control of your finances with smart tracking and insights
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <HomeIcon className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Charts</span>
            </TabsTrigger>
            <TabsTrigger value="budgets" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Budgets</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Insights</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Financial Overview</h2>
              <Button onClick={() => setShowTransactionForm(true)} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Transaction</span>
              </Button>
            </div>

            <DashboardSummary transactions={transactions} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyExpensesChart data={monthlyData} />
              {categorySpending.length > 0 && <CategoryPieChart data={categorySpending} />}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Transaction Management</h2>
              <Button onClick={() => setShowTransactionForm(true)} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Transaction</span>
              </Button>
            </div>

            <TransactionList
              transactions={transactions}
              onEdit={handleTransactionEdit}
              onDelete={handleTransactionDelete}
              onRefresh={loadTransactions}
            />
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <h2 className="text-2xl font-semibold">Financial Charts</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <MonthlyExpensesChart data={monthlyData} />
              {categorySpending.length > 0 && <CategoryPieChart data={categorySpending} />}
            </div>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6">
            <h2 className="text-2xl font-semibold">Budget Planning</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <BudgetManager onUpdate={loadTransactions} />
              {budgetComparison.length > 0 && <BudgetComparisonChart data={budgetComparison} />}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <h2 className="text-2xl font-semibold">Spending Insights</h2>
            <SpendingInsights transactions={transactions} />
          </TabsContent>
        </Tabs>

        {showTransactionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <TransactionForm
              transaction={editingTransaction}
              onSubmit={handleTransactionSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        )}
      </div>
    </div>
  );
}
