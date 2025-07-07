import { Transaction, Category, MonthlyData, CategorySpending } from '@/types/finance';
import { storage } from './storage';

export function calculateMonthlyData(transactions: Transaction[]): MonthlyData[] {
  const monthlyMap = new Map<string, MonthlyData>();

  transactions.forEach(transaction => {
    const month = transaction.date.substring(0, 7); // YYYY-MM
    const existing = monthlyMap.get(month) || { month, income: 0, expenses: 0, net: 0 };

    if (transaction.type === 'income') {
      existing.income += transaction.amount;
    } else {
      existing.expenses += transaction.amount;
    }

    existing.net = existing.income - existing.expenses;
    monthlyMap.set(month, existing);
  });

  return Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
}

export function calculateCategorySpending(transactions: Transaction[]): CategorySpending[] {
  const categories = storage.getCategories();
  const categoryMap = new Map<string, CategorySpending>();

  // Initialize categories
  categories.forEach(category => {
    categoryMap.set(category.id, {
      category: category.name,
      amount: 0,
      color: category.color,
    });
  });

  // Calculate spending
  transactions
    .filter(t => t.type === 'expense')
    .forEach(transaction => {
      const category = categories.find(c => c.id === transaction.category);
      if (category) {
        const existing = categoryMap.get(category.id)!;
        existing.amount += transaction.amount;
      }
    });

  return Array.from(categoryMap.values()).filter(c => c.amount > 0);
}

export function calculateBudgetComparison(month: string): CategorySpending[] {
  const transactions = storage.getTransactions();
  const categories = storage.getCategories();
  const budgets = storage.getBudgets();

  const monthTransactions = transactions.filter(
    t => t.date.startsWith(month) && t.type === 'expense'
  );

  const categorySpending = calculateCategorySpending(monthTransactions);
  const budgetMap = new Map(budgets.filter(b => b.month === month).map(b => [b.categoryId, b.amount]));

  return categories.map(category => {
    const spending = categorySpending.find(c => c.category === category.name);
    const budget = budgetMap.get(category.id);
    
    return {
      category: category.name,
      amount: spending?.amount || 0,
      color: category.color,
      budget,
      percentage: budget ? ((spending?.amount || 0) / budget) * 100 : 0,
    };
  }).filter(c => c.budget || c.amount > 0);
}

export function getCurrentMonth(): string {
  return new Date().toISOString().substring(0, 7);
}

export function formatMonth(monthString: string): string {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function getSpendingInsights(transactions: Transaction[]): string[] {
  const insights: string[] = [];
  const thisMonth = getCurrentMonth();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthString = lastMonth.toISOString().substring(0, 7);

  const thisMonthTransactions = transactions.filter(t => t.date.startsWith(thisMonth));
  const lastMonthTransactions = transactions.filter(t => t.date.startsWith(lastMonthString));

  const thisMonthExpenses = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonthExpenses = lastMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Month-over-month comparison
  if (lastMonthExpenses > 0) {
    const change = ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
    if (change > 10) {
      insights.push(`Your spending increased by ${change.toFixed(1)}% compared to last month.`);
    } else if (change < -10) {
      insights.push(`Great job! Your spending decreased by ${Math.abs(change).toFixed(1)}% compared to last month.`);
    }
  }

  // Category analysis
  const categorySpending = calculateCategorySpending(thisMonthTransactions);
  const topCategory = categorySpending.reduce((max, cat) => cat.amount > max.amount ? cat : max, { amount: 0, category: '' });
  
  if (topCategory.amount > 0) {
    insights.push(`Your highest spending category this month is ${topCategory.category} with ${formatCurrency(topCategory.amount)}.`);
  }

  // Budget analysis
  const budgetComparison = calculateBudgetComparison(thisMonth);
  const overBudget = budgetComparison.filter(c => c.percentage && c.percentage > 100);
  
  if (overBudget.length > 0) {
    insights.push(`You're over budget in ${overBudget.length} category${overBudget.length > 1 ? 'ies' : 'y'} this month.`);
  }

  return insights;
}