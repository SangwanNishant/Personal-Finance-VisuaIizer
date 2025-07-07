export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  type: 'income' | 'expense';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  budget?: number;
}

export interface Budget {
  categoryId: string;
  amount: number;
  month: string; // YYYY-MM format
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface CategorySpending {
  category: string;
  amount: number;
  color: string;
  budget?: number;
  percentage?: number;
}