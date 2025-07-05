export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  type: 'income' | 'expense';
  createdAt: string;
}

export interface MonthlyExpense {
  month: string;
  amount: number;
}