"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { storage } from '@/lib/storage';
import { formatCurrency, getCurrentMonth, formatMonth } from '@/lib/finance-utils';
import { Save, Target, Check, Calendar, DollarSign } from 'lucide-react';

interface BudgetManagerProps {
  onUpdate: () => void;
}

export function BudgetManager({ onUpdate }: BudgetManagerProps) {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [budgets, setBudgets] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const categories = storage.getCategories();

  // Initialize budgets for selected month
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existingBudgets = storage.getBudgets();
      const monthBudgets = existingBudgets.filter(b => b.month === selectedMonth);
      const budgetMap: Record<string, string> = {};
      
      monthBudgets.forEach(budget => {
        budgetMap[budget.categoryId] = budget.amount.toString();
      });
      
      setBudgets(budgetMap);
      setIsLoaded(true);
    }
  }, [selectedMonth]);

  const handleBudgetChange = (categoryId: string, value: string) => {
    // Allow empty string or valid numbers
    if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
      setBudgets(prev => ({
        ...prev,
        [categoryId]: value,
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      Object.entries(budgets).forEach(([categoryId, amount]) => {
        const numericAmount = parseFloat(amount);
        if (!isNaN(numericAmount) && numericAmount > 0) {
          storage.setBudget(categoryId, numericAmount, selectedMonth);
        } else if (amount === '' || numericAmount === 0) {
          // Remove budget if empty or zero
          const existingBudgets = storage.getBudgets();
          const filteredBudgets = existingBudgets.filter(
            b => !(b.categoryId === categoryId && b.month === selectedMonth)
          );
          storage.saveBudgets(filteredBudgets);
        }
      });
      
      onUpdate();
      setSaveSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error saving budgets:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate month options (current month + next 11 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    return {
      value: date.toISOString().substring(0, 7),
      label: formatMonth(date.toISOString().substring(0, 7)),
    };
  });

  const totalBudget = Object.values(budgets).reduce((sum, amount) => {
    const num = parseFloat(amount);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  if (!isLoaded) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
              <Target className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Budget Manager</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading budget data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
              <Target className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Budget Manager</span>
          </div>
          {totalBudget > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Budget</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalBudget)}</p>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="month" className="text-base font-medium flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Select Month</span>
          </Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="h-12 bg-white/50 border-gray-200 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(month => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span>Category Budgets</span>
          </Label>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {categories.map(category => (
              <div key={category.id} className="group">
                <div className="flex items-center space-x-4 p-4 bg-white/60 hover:bg-white/80 border border-gray-100 rounded-xl transition-all duration-200 hover:shadow-md">
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={category.id} className="text-sm font-medium text-gray-700 cursor-pointer">
                      {category.name}
                    </Label>
                  </div>
                  <div className="w-36">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id={category.id}
                        type="number"
                        step="0.01"
                        min="0"
                        value={budgets[category.id] || ''}
                        onChange={(e) => handleBudgetChange(category.id, e.target.value)}
                        placeholder="0.00"
                        className="pl-9 text-right bg-white/70 border-gray-200 rounded-lg h-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 space-y-4 border-t border-gray-100">
          <Button 
            onClick={handleSave} 
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl font-medium" 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                Saving Budgets...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-3" />
                Save Budget Plan
              </>
            )}
          </Button>
          
          {saveSuccess && (
            <div className="flex items-center justify-center text-emerald-600 text-sm bg-emerald-50 py-3 rounded-xl border border-emerald-200">
              <Check className="h-4 w-4 mr-2" />
              Budget plan saved successfully!
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
          <h4 className="font-medium text-blue-800 mb-2">💡 Budget Tips</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Set realistic budgets based on your spending history</p>
            <p>• Leave empty or set to 0 to remove a category budget</p>
            <p>• Review and adjust your budgets monthly</p>
            <p>• Use the insights tab to track your progress</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}