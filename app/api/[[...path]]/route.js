import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 0,
      retryWrites: true,
      retryReads: true,
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    maxPoolSize: 10,
    minPoolSize: 0,
    retryWrites: true,
    retryReads: true,
  });
  clientPromise = client.connect();
}

const dbName = process.env.DB_NAME || 'finance_tracker';

const CATEGORIES = [
  { id: 'food', name: 'Food & Dining', icon: '🍽️', color: '#ef4444' },
  { id: 'transportation', name: 'Transportation', icon: '🚗', color: '#3b82f6' },
  { id: 'shopping', name: 'Shopping', icon: '🛒', color: '#8b5cf6' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#f59e0b' },
  { id: 'bills', name: 'Bills & Utilities', icon: '💡', color: '#10b981' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', color: '#ec4899' },
  { id: 'education', name: 'Education', icon: '📚', color: '#6366f1' },
  { id: 'other', name: 'Other', icon: '📦', color: '#6b7280' }
];

async function connectToDatabase() {
  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

async function getCategories(request) {
  try {
    return NextResponse.json({ categories: CATEGORIES });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

async function getBudgets(request) {
  try {
    const db = await connectToDatabase();
    const budgets = await db.collection('budgets')
      .find({})
      .toArray();
    
    return NextResponse.json({ budgets });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

async function createOrUpdateBudget(request) {
  try {
    const body = await request.json();
    const { category, amount, month } = body;

    if (!category || !amount || !month) {
      return NextResponse.json({ error: 'Category, amount, and month are required' }, { status: 400 });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
    }

    const validCategory = CATEGORIES.find(cat => cat.id === category);
    if (!validCategory) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const db = await connectToDatabase();
    
    const existingBudget = await db.collection('budgets').findOne({
      category: category,
      month: month
    });

    if (existingBudget) {

      const result = await db.collection('budgets').updateOne(
        { category: category, month: month },
        { 
          $set: { 
            amount: parseFloat(amount),
            updatedAt: new Date()
          }
        }
      );
      
      return NextResponse.json({ 
        message: 'Budget updated successfully',
        budget: { category, amount: parseFloat(amount), month }
      });
    } else {

      const budget = {
        id: uuidv4(),
        category: category,
        amount: parseFloat(amount),
        month: month,
        createdAt: new Date()
      };

      await db.collection('budgets').insertOne(budget);
      
      return NextResponse.json({ 
        message: 'Budget created successfully',
        budget
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating/updating budget:', error);
    return NextResponse.json({ error: 'Failed to save budget' }, { status: 500 });
  }
}

async function getTransactions(request) {
  try {
    const db = await connectToDatabase();
    const transactions = await db.collection('transactions')
      .find({})
      .sort({ date: -1 })
      .toArray();
    
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}


async function createTransaction(request) {
  try {
    const body = await request.json();
    const { amount, date, description, category } = body;


    if (!amount || !date || !description || !category) {
      return NextResponse.json({ error: 'Amount, date, description, and category are required' }, { status: 400 });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
    }


    const validCategory = CATEGORIES.find(cat => cat.id === category);
    if (!validCategory) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const transaction = {
      id: uuidv4(),
      amount: parseFloat(amount),
      date: new Date(date),
      description: description.trim(),
      category: category,
      createdAt: new Date()
    };

    const db = await connectToDatabase();
    const result = await db.collection('transactions').insertOne(transaction);
    
    return NextResponse.json({ 
      message: 'Transaction created successfully',
      transaction: { ...transaction, _id: result.insertedId }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}

async function updateTransaction(request, id) {
  try {
    const body = await request.json();
    const { amount, date, description, category } = body;


    if (!amount || !date || !description || !category) {
      return NextResponse.json({ error: 'Amount, date, description, and category are required' }, { status: 400 });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
    }


    const validCategory = CATEGORIES.find(cat => cat.id === category);
    if (!validCategory) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const updateData = {
      amount: parseFloat(amount),
      date: new Date(date),
      description: description.trim(),
      category: category,
      updatedAt: new Date()
    };

    const db = await connectToDatabase();
    const result = await db.collection('transactions').updateOne(
      { id: id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Transaction updated successfully',
      transaction: { id, ...updateData }
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}


async function deleteTransaction(request, id) {
  try {
    const db = await connectToDatabase();
    const result = await db.collection('transactions').deleteOne({ id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}


async function getMonthlyAnalytics(request) {
  try {
    const db = await connectToDatabase();
    const transactions = await db.collection('transactions').find({}).toArray();

    const monthlyData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          total: 0,
          count: 0
        };
      }
      
      acc[monthKey].total += transaction.amount;
      acc[monthKey].count += 1;
      
      return acc;
    }, {});

    const monthlyExpenses = Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(item => ({
        month: item.month,
        expenses: Math.round(item.total * 100) / 100,
        count: item.count
      }));

    return NextResponse.json({ monthlyExpenses });
  } catch (error) {
    console.error('Error fetching monthly analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

async function getCategoryAnalytics(request) {
  try {
    const db = await connectToDatabase();
    const transactions = await db.collection('transactions').find({}).toArray();

    const categoryData = transactions.reduce((acc, transaction) => {
      const categoryId = transaction.category || 'other';
      
      if (!acc[categoryId]) {
        const categoryInfo = CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES.find(cat => cat.id === 'other');
        acc[categoryId] = {
          id: categoryId,
          name: categoryInfo.name,
          icon: categoryInfo.icon,
          color: categoryInfo.color,
          total: 0,
          count: 0,
          percentage: 0
        };
      }
      
      acc[categoryId].total += transaction.amount;
      acc[categoryId].count += 1;
      
      return acc;
    }, {});

    const totalExpenses = Object.values(categoryData).reduce((sum, cat) => sum + cat.total, 0);
    const categoryExpenses = Object.values(categoryData)
      .map(cat => ({
        ...cat,
        total: Math.round(cat.total * 100) / 100,
        percentage: totalExpenses > 0 ? Math.round((cat.total / totalExpenses) * 100) : 0
      }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({ categoryExpenses, totalExpenses: Math.round(totalExpenses * 100) / 100 });
  } catch (error) {
    console.error('Error fetching category analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch category analytics' }, { status: 500 });
  }
}

async function getBudgetAnalytics(request) {
  try {
    const db = await connectToDatabase();
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    const transactions = await db.collection('transactions').find({}).toArray();
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      return transactionMonth === currentMonth;
    });

    const budgets = await db.collection('budgets').find({ month: currentMonth }).toArray();

    const categorySpending = currentMonthTransactions.reduce((acc, transaction) => {
      const categoryId = transaction.category || 'other';
      acc[categoryId] = (acc[categoryId] || 0) + transaction.amount;
      return acc;
    }, {});

    const budgetComparison = CATEGORIES.map(category => {
      const budget = budgets.find(b => b.category === category.id);
      const spent = categorySpending[category.id] || 0;
      const budgetAmount = budget ? budget.amount : 0;
      const remaining = budgetAmount - spent;
      const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

      return {
        ...category,
        budget: budgetAmount,
        spent: Math.round(spent * 100) / 100,
        remaining: Math.round(remaining * 100) / 100,
        percentage: percentage,
        status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'
      };
    }).filter(item => item.budget > 0 || item.spent > 0);

    const totalBudget = budgetComparison.reduce((sum, item) => sum + item.budget, 0);
    const totalSpent = budgetComparison.reduce((sum, item) => sum + item.spent, 0);
    const totalRemaining = totalBudget - totalSpent;

    return NextResponse.json({ 
      budgetComparison,
      summary: {
        totalBudget: Math.round(totalBudget * 100) / 100,
        totalSpent: Math.round(totalSpent * 100) / 100,
        totalRemaining: Math.round(totalRemaining * 100) / 100,
        overallPercentage: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
      },
      month: currentMonth
    });
  } catch (error) {
    console.error('Error fetching budget analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch budget analytics' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  const url = new URL(request.url);
  const pathSegments = params.path || [];
  const path = pathSegments.join('/');

  try {
    if (path === 'transactions') {
      return await getTransactions(request);
    } else if (path === 'categories') {
      return await getCategories(request);
    } else if (path === 'budgets') {
      return await getBudgets(request);
    } else if (path === 'analytics/monthly') {
      return await getMonthlyAnalytics(request);
    } else if (path === 'analytics/categories') {
      return await getCategoryAnalytics(request);
    } else if (path === 'analytics/budget') {
      return await getBudgetAnalytics(request);
    } else {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('GET request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const pathSegments = params.path || [];
  const path = pathSegments.join('/');

  try {
    if (path === 'transactions') {
      return await createTransaction(request);
    } else if (path === 'budgets') {
      return await createOrUpdateBudget(request);
    } else {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('POST request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const pathSegments = params.path || [];
  
  if (pathSegments.length === 2 && pathSegments[0] === 'transactions') {
    const id = pathSegments[1];
    return await updateTransaction(request, id);
  } else {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function DELETE(request, { params }) {
  const pathSegments = params.path || [];
  
  if (pathSegments.length === 2 && pathSegments[0] === 'transactions') {
    const id = pathSegments[1];
    return await deleteTransaction(request, id);
  } else {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}