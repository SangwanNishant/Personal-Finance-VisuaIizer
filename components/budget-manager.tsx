"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { storage } from '@/lib/storage';
import { formatCurrency, getCurrentMonth, formatMonth } from '@/lib/finance-utils';
import { Save, Target } from 'lucide-react';

interface BudgetManagerProps {
  onUpdate: () => void;
}

export function BudgetManager({ onUpdate }: BudgetManagerProps) {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [budgets, setBudgets] = useState<Record<string, string>>({});

  const categories = storage.getCategories();
  const existingBudgets = storage.getBudgets();

  // Initialize budgets for selected month
  useEffect(() => {
    const monthBudgets = existingBudgets.filter(b => b.month === selectedMonth);
    const budgetMap: Record<string, string> = {};
    
    monthBudgets.forEach(budget => {
      budgetMap[budget.categoryId] = budget.amount.toString();
    });
    
    setBudgets(budgetMap);
  }, [selectedMonth, existingBudgets]);

  const handleBudgetChange = (categoryId: string, value: string) => {
    setBudgets(prev => ({
      ...prev,
      [categoryId]: value,
    }));
  };

  const handleSave = () => {
    Object.entries(budgets).forEach(([categoryId, amount]) => {
      const numericAmount = parseFloat(amount);
      if (!isNaN(numericAmount) && numericAmount > 0) {
        storage.setBudget(categoryId, numericAmount, selectedMonth);
      }
    });
    onUpdate();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Budget Manager</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="month">Select Month</Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
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

        <div className="space-y-3">
          <Label>Category Budgets</Label>
          {categories.map(category => (
            <div key={category.id} className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <div className="flex-1">
                <Label htmlFor={category.id} className="text-sm">
                  {category.name}
                </Label>
              </div>
              <div className="w-32">
                <Input
                  id={category.id}
                  type="number"
                  step="0.01"
                  min="0"
                  value={budgets[category.id] || ''}
                  onChange={(e) => handleBudgetChange(category.id, e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save Budgets
        </Button>
      </CardContent>
    </Card>
  );
}