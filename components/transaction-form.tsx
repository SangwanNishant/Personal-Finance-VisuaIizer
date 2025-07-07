"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Transaction } from '@/types/finance';
import { storage } from '@/lib/storage';
import { Plus, X, DollarSign, Calendar, FileText, Tag } from 'lucide-react';

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (transaction: Transaction) => void;
  onCancel: () => void;
}

export function TransactionForm({ transaction, onSubmit, onCancel }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    amount: transaction?.amount?.toString() || '',
    description: transaction?.description || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
    category: transaction?.category || '',
    type: transaction?.type || 'expense' as 'income' | 'expense',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = storage.getCategories();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    }

    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let result: Transaction;
      
      if (transaction) {
        result = storage.updateTransaction(transaction.id, {
          amount: Number(formData.amount),
          description: formData.description.trim(),
          date: formData.date,
          category: formData.category,
          type: formData.type,
        })!;
      } else {
        result = storage.addTransaction({
          amount: Number(formData.amount),
          description: formData.description.trim(),
          date: formData.date,
          category: formData.category,
          type: formData.type,
        });
      }

      onSubmit(result);
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {transaction ? 'Edit Transaction' : 'Add New Transaction'}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel} className="hover:bg-gray-100 rounded-lg">
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-medium">Transaction Type</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as 'income' | 'expense' })}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" className="text-red-600" />
                <Label htmlFor="expense" className="font-medium text-red-700">Expense</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" className="text-emerald-600" />
                <Label htmlFor="income" className="font-medium text-emerald-700">Income</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label htmlFor="amount" className="text-base font-medium flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span>Amount</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className={`pl-10 h-12 bg-white/70 border-gray-200 rounded-xl ${errors.amount ? 'border-red-500 focus:ring-red-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
              />
            </div>
            {errors.amount && <p className="text-sm text-red-500 flex items-center space-x-1">
              <span>⚠️</span>
              <span>{errors.amount}</span>
            </p>}
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-base font-medium flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span>Description</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What was this transaction for?"
              rows={3}
              className={`bg-white/70 border-gray-200 rounded-xl resize-none ${errors.description ? 'border-red-500 focus:ring-red-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
            />
            {errors.description && <p className="text-sm text-red-500 flex items-center space-x-1">
              <span>⚠️</span>
              <span>{errors.description}</span>
            </p>}
          </div>

          <div className="space-y-3">
            <Label htmlFor="date" className="text-base font-medium flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Date</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`h-12 bg-white/70 border-gray-200 rounded-xl ${errors.date ? 'border-red-500 focus:ring-red-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
            />
            {errors.date && <p className="text-sm text-red-500 flex items-center space-x-1">
              <span>⚠️</span>
              <span>{errors.date}</span>
            </p>}
          </div>

          <div className="space-y-3">
            <Label htmlFor="category" className="text-base font-medium flex items-center space-x-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <span>Category</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className={`h-12 bg-white/70 border-gray-200 rounded-xl ${errors.category ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500 flex items-center space-x-1">
              <span>⚠️</span>
              <span>{errors.category}</span>
            </p>}
          </div>

          <div className="flex space-x-3 pt-6">
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  {transaction ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  {transaction ? 'Update Transaction' : 'Add Transaction'}
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="px-6 h-12 border-gray-200 hover:bg-gray-50 rounded-xl font-medium"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}