'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line, Area, AreaChart } from 'recharts';
import { Plus, Edit, Trash2, DollarSign, TrendingUp, Calendar, Receipt, PieChart as PieChartIcon, BarChart3, Tag, Target, AlertTriangle, CheckCircle, Settings } from 'lucide-react';

export default function FinanceTracker() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    date: '',
    description: '',
    category: ''
  });
  const [budgetForm, setBudgetForm] = useState({
    category: '',
    amount: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([
      fetchTransactions(),
      fetchCategories(),
      fetchMonthlyData(),
      fetchCategoryData(),
      fetchBudgetData()
    ]);
    setLoading(false);
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      const data = await response.json();
      if (response.ok) {
        setTransactions(data.transactions || []);
      } else {
        setError(data.error || 'Failed to fetch transactions');
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const response = await fetch('/api/analytics/monthly');
      const data = await response.json();
      if (response.ok) {
        setMonthlyData(data.monthlyExpenses || []);
      }
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    }
  };

  const fetchCategoryData = async () => {
    try {
      const response = await fetch('/api/analytics/categories');
      const data = await response.json();
      if (response.ok) {
        setCategoryData(data.categoryExpenses || []);
      }
    } catch (error) {
      console.error('Error fetching category data:', error);
    }
  };

  const fetchBudgetData = async () => {
    try {
      const response = await fetch('/api/analytics/budget');
      const data = await response.json();
      if (response.ok) {
        setBudgetData(data);
      }
    } catch (error) {
      console.error('Error fetching budget data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.amount || !formData.date || !formData.description || !formData.category) {
      setError('All fields are required');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }

    try {
      const method = editingTransaction ? 'PUT' : 'POST';
      const url = editingTransaction 
        ? `/api/transactions/${editingTransaction.id}`
        : '/api/transactions';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          date: formData.date,
          description: formData.description.trim(),
          category: formData.category
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setFormData({ amount: '', date: '', description: '', category: '' });
        setEditingTransaction(null);
        setIsDialogOpen(false);
        await fetchData();
      } else {
        setError(data.error || 'Failed to save transaction');
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!budgetForm.category || !budgetForm.amount) {
      setError('Category and amount are required');
      return;
    }

    const amount = parseFloat(budgetForm.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }

    try {
      const currentDate = new Date();
      const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: budgetForm.category,
          amount,
          month: currentMonth
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setBudgetForm({ category: '', amount: '' });
        setIsBudgetDialogOpen(false);
        await fetchBudgetData();
      } else {
        setError(data.error || 'Failed to save budget');
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount.toString(),
      date: new Date(transaction.date).toISOString().split('T')[0],
      description: transaction.description,
      category: transaction.category || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete transaction');
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  const resetForm = () => {
    setFormData({ amount: '', date: '', description: '', category: '' });
    setEditingTransaction(null);
    setError('');
  };

  const resetBudgetForm = () => {
    setBudgetForm({ category: '', amount: '' });
    setError('');
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || { name: 'Unknown', icon: '📦', color: '#6b7280' };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'over': return 'text-red-600';
      case 'warning': return 'text-orange-600';
      default: return 'text-green-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'over': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
  const thisMonthExpenses = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1]?.expenses || 0 : 0;
  const topCategory = categoryData.length > 0 ? categoryData[0] : null;
  const budgetSummary = budgetData?.summary || { totalBudget: 0, totalSpent: 0, totalRemaining: 0, overallPercentage: 0 };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full h-16 w-16 mx-auto opacity-20 animate-pulse"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your finances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                Personal Finance Tracker
              </h1>
              <p className="text-gray-600">Track expenses, set budgets, and achieve your financial goals</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 shadow-sm">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">All time expenses</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Budget</CardTitle>
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                <Target className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">${budgetSummary.totalBudget.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">Current month budget</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Spent This Month</CardTitle>
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">${budgetSummary.totalSpent.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">{budgetSummary.overallPercentage}% of budget</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Remaining</CardTitle>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">${budgetSummary.totalRemaining.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">Available to spend</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Top Category</CardTitle>
              <div className="bg-gradient-to-r from-indigo-500 to-violet-500 p-2 rounded-lg">
                <Tag className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-900">
                {topCategory ? `${topCategory.icon} ${topCategory.name}` : 'No data'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {topCategory ? `$${topCategory.total} (${topCategory.percentage}%)` : 'Add transactions'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Budget Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2.5 rounded-xl shadow-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Monthly Trends</CardTitle>
                    <CardDescription className="text-sm text-gray-600">Spending over time</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 15, left: 15, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" strokeOpacity={0.4} />
                    <XAxis 
                      dataKey="month" 
                      stroke="#64748b"
                      fontSize={10}
                      fontWeight={500}
                      tickLine={false}
                      axisLine={false}
                      dy={5}
                    />
                    <YAxis 
                      stroke="#64748b"
                      fontSize={10}
                      fontWeight={500}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                      width={45}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Expenses']}
                      labelFormatter={(label) => `${label}`}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        fontSize: '12px',
                        fontWeight: 500,
                        padding: '10px 14px'
                      }}
                    />
                    <Bar 
                      dataKey="expenses" 
                      fill="url(#colorExpenses)" 
                      radius={[6, 6, 0, 0]}
                      strokeWidth={0}
                      maxBarSize={35}
                    />
                    <defs>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2.5 rounded-xl shadow-lg">
                  <PieChartIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Category Breakdown</CardTitle>
                  <CardDescription className="text-sm text-gray-600">Spending by category</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-56">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total"
                        label={({name, percentage}) => `${percentage}%`}
                        labelLine={false}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [`$${value}`, `${props.payload.icon} ${props.payload.name}`]}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: 'none',
                          borderRadius: '16px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                          fontSize: '12px',
                          fontWeight: 500,
                          padding: '10px 14px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <PieChartIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No category data</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-2">
                {categoryData.slice(0, 3).map((category, index) => (
                  <div key={category.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="text-gray-700">{category.icon} {category.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">${category.total}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 lg:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2.5 rounded-xl shadow-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Budget Overview</CardTitle>
                    <CardDescription className="text-sm text-gray-600">Track your spending goals</CardDescription>
                  </div>
                </div>
                <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetBudgetForm} size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      <Settings className="h-4 w-4 mr-1" />
                      Set Budget
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-gray-900">
                        Set Monthly Budget
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleBudgetSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="budget-category" className="text-sm font-medium text-gray-700">Category</Label>
                        <Select value={budgetForm.category} onValueChange={(value) => setBudgetForm(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <span className="flex items-center">
                                  {category.icon} {category.name}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budget-amount" className="text-sm font-medium text-gray-700">Budget Amount ($)</Label>
                        <Input
                          id="budget-amount"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={budgetForm.amount}
                          onChange={(e) => setBudgetForm(prev => ({ ...prev, amount: e.target.value }))}
                          className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        Set Budget
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4 h-56 overflow-y-auto">
                {budgetData?.budgetComparison?.length > 0 ? (
                  budgetData.budgetComparison.map((budget) => (
                    <div key={budget.id} className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{budget.icon}</span>
                          <span className="font-medium text-gray-900">{budget.name}</span>
                          <div className={`flex items-center space-x-1 ${getStatusColor(budget.status)}`}>
                            {getStatusIcon(budget.status)}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${budget.spent} / ${budget.budget}
                          </p>
                          <p className="text-xs text-gray-500">
                            {budget.percentage}% used
                          </p>
                        </div>
                      </div>
                      <Progress 
                        value={Math.min(budget.percentage, 100)} 
                        className="w-full h-2"
                        style={{
                          backgroundColor: '#f1f5f9'
                        }}
                      />
                      {budget.remaining < 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          Over budget by ${Math.abs(budget.remaining).toFixed(2)}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Target className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm font-medium">No budgets set</p>
                      <p className="text-xs">Set your first budget to track spending</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-2.5 rounded-xl shadow-lg">
                    <Receipt className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
                    <CardDescription className="text-sm text-gray-600">Latest transactions</CardDescription>
                  </div>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm} size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-gray-900">
                        {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount" className="text-sm font-medium text-gray-700">Amount ($)</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date" className="text-sm font-medium text-gray-700">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <span className="flex items-center">
                                  {category.icon} {category.name}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="What did you spend on?"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                          rows={3}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 h-80 overflow-y-auto">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 flex flex-col items-center justify-center h-full">
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-3 rounded-full w-12 h-12 mx-auto mb-3">
                      <Receipt className="h-6 w-6 text-gray-400 mx-auto mt-1.5" />
                    </div>
                    <p className="text-sm font-medium">No transactions yet</p>
                    <p className="text-xs text-gray-400">Add your first expense!</p>
                  </div>
                ) : (
                  transactions.slice(0, 6).map((transaction) => {
                    const categoryInfo = getCategoryInfo(transaction.category);
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-md">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900 text-sm truncate mr-2">{transaction.description}</p>
                            <Badge variant="outline" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-sm text-xs px-2 py-1">
                              ${transaction.amount.toFixed(2)}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(transaction.date).toLocaleDateString()}
                            </p>
                            <Badge 
                              variant="outline" 
                              className="text-xs px-2 py-0.5"
                              style={{ borderColor: categoryInfo.color, color: categoryInfo.color }}
                            >
                              {categoryInfo.icon} {categoryInfo.name}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(transaction)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all duration-200 h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 transition-all duration-200 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {transactions.length > 6 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    +{transactions.length - 6} more transactions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2.5 rounded-xl shadow-lg">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Spending Insights</CardTitle>
                  <CardDescription className="text-sm text-gray-600">Smart financial tips</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4 h-80 overflow-y-auto">
                {budgetData?.budgetComparison?.filter(budget => budget.status === 'over').length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <p className="font-medium text-red-800">Budget Alert</p>
                    </div>
                    <p className="text-sm text-red-700">
                      You've exceeded {budgetData.budgetComparison.filter(budget => budget.status === 'over').length} budget(s) this month.
                    </p>
                  </div>
                )}

                {budgetData?.budgetComparison?.filter(budget => budget.status === 'warning').length > 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <p className="font-medium text-orange-800">Warning</p>
                    </div>
                    <p className="text-sm text-orange-700">
                      You're close to exceeding {budgetData.budgetComparison.filter(budget => budget.status === 'warning').length} budget(s).
                    </p>
                  </div>
                )}

                {topCategory && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Tag className="h-4 w-4 text-blue-600" />
                      <p className="font-medium text-blue-800">Top Spending Category</p>
                    </div>
                    <p className="text-sm text-blue-700">
                      {topCategory.icon} {topCategory.name} accounts for {topCategory.percentage}% of your total spending.
                    </p>
                  </div>
                )}

                {budgetSummary.totalRemaining > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <p className="font-medium text-green-800">Good News!</p>
                    </div>
                    <p className="text-sm text-green-700">
                      You have ${budgetSummary.totalRemaining.toFixed(2)} remaining in your monthly budget.
                    </p>
                  </div>
                )}

                {transactions.length === 0 && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Receipt className="h-4 w-4 text-gray-600" />
                      <p className="font-medium text-gray-800">Getting Started</p>
                    </div>
                    <p className="text-sm text-gray-700">
                      Add your first transaction to start tracking your expenses and get personalized insights.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Transactions */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-slate-500 to-gray-500 p-2 rounded-lg">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">All Transactions</CardTitle>
                <CardDescription className="text-gray-600">Complete list of your expenses</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-8 rounded-full w-24 h-24 mx-auto mb-4">
                    <Receipt className="h-8 w-8 text-gray-400 mx-auto mt-4" />
                  </div>
                  <p className="text-lg font-medium">No transactions found</p>
                  <p className="text-sm">Start tracking your expenses by adding your first transaction</p>
                </div>
              ) : (
                transactions.map((transaction) => {
                  const categoryInfo = getCategoryInfo(transaction.category);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-md">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <Badge variant="outline" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-sm">
                            ${transaction.amount.toFixed(2)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                          <Badge 
                            variant="outline" 
                            className="text-xs px-2 py-1"
                            style={{ borderColor: categoryInfo.color, color: categoryInfo.color }}
                          >
                            {categoryInfo.icon} {categoryInfo.name}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all duration-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 transition-all duration-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}