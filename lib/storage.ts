import { Transaction, Category, Budget } from '@/types/finance';

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', color: '#ef4444', icon: 'utensils' },
  { id: '2', name: 'Transportation', color: '#3b82f6', icon: 'car' },
  { id: '3', name: 'Shopping', color: '#8b5cf6', icon: 'shopping-bag' },
  { id: '4', name: 'Entertainment', color: '#ec4899', icon: 'film' },
  { id: '5', name: 'Bills & Utilities', color: '#eab308', icon: 'zap' },
  { id: '6', name: 'Healthcare', color: '#10b981', icon: 'heart' },
  { id: '7', name: 'Education', color: '#f59e0b', icon: 'graduation-cap' },
  { id: '8', name: 'Travel', color: '#06b6d4', icon: 'plane' },
  { id: '9', name: 'Salary', color: '#22c55e', icon: 'dollar-sign' },
  { id: '10', name: 'Other', color: '#6b7280', icon: 'more-horizontal' },
];

class StorageManager {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private getStorageKey(key: string): string {
    return `finance-tracker-${key}`;
  }

  // Transactions
  getTransactions(): Transaction[] {
    if (!this.isClient()) return [];
    
    try {
      const stored = localStorage.getItem(this.getStorageKey('transactions'));
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading transactions:', error);
      return [];
    }
  }

  saveTransactions(transactions: Transaction[]): void {
    if (!this.isClient()) return;
    
    try {
      localStorage.setItem(
        this.getStorageKey('transactions'),
        JSON.stringify(transactions)
      );
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }

  addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction {
    const transactions = this.getTransactions();
    const now = new Date().toISOString();
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    transactions.push(newTransaction);
    this.saveTransactions(transactions);
    return newTransaction;
  }

  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) return null;

    const updatedTransaction = {
      ...transactions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    transactions[index] = updatedTransaction;
    this.saveTransactions(transactions);
    return updatedTransaction;
  }

  deleteTransaction(id: string): boolean {
    const transactions = this.getTransactions();
    const filteredTransactions = transactions.filter(t => t.id !== id);
    if (filteredTransactions.length === transactions.length) return false;
    this.saveTransactions(filteredTransactions);
    return true;
  }

  // Categories
  getCategories(): Category[] {
    if (!this.isClient()) return DEFAULT_CATEGORIES;
    
    try {
      const stored = localStorage.getItem(this.getStorageKey('categories'));
      if (!stored) {
        this.saveCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error reading categories:', error);
      return DEFAULT_CATEGORIES;
    }
  }

  saveCategories(categories: Category[]): void {
    if (!this.isClient()) return;
    
    try {
      localStorage.setItem(
        this.getStorageKey('categories'),
        JSON.stringify(categories)
      );
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  }

  // Budgets
  getBudgets(): Budget[] {
    if (!this.isClient()) return [];
    
    try {
      const stored = localStorage.getItem(this.getStorageKey('budgets'));
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading budgets:', error);
      return [];
    }
  }

  saveBudgets(budgets: Budget[]): void {
    if (!this.isClient()) return;
    
    try {
      localStorage.setItem(
        this.getStorageKey('budgets'),
        JSON.stringify(budgets)
      );
    } catch (error) {
      console.error('Error saving budgets:', error);
    }
  }

  setBudget(categoryId: string, amount: number, month: string): void {
    const budgets = this.getBudgets();
    const existingIndex = budgets.findIndex(
      b => b.categoryId === categoryId && b.month === month
    );

    if (existingIndex >= 0) {
      budgets[existingIndex].amount = amount;
    } else {
      budgets.push({ categoryId, amount, month });
    }

    this.saveBudgets(budgets);
  }
}

export const storage = new StorageManager();