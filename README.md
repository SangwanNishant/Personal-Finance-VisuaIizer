# Personal Finance Tracker

A modern web application for managing personal finances with budgeting, analytics, and insightful visualizations. Built with Next.js, React, MongoDB, and Recharts.

&#x20;

---

## 🚀 Key Features

### Stage 1: Transaction Tracking ✅

- Add, edit, and delete expense transactions
- Searchable and filterable transaction list
- Monthly expense visualization using bar charts
- Responsive design with intuitive UI
- Built-in form validation and error handling

### Stage 2: Category System & Enhanced Dashboard ✅

- 8 predefined categories with icons and color coding
- Category-wise spending shown with pie charts
- Summary cards and visual indicators for categories
- Dashboard for quick financial overview

### Stage 3: Budgeting Tools & Insights ✅

- Monthly budget setup by category
- Real-time comparison of budget vs actual spending
- Visual progress bars with spending status
- Alerts for overspending
- Financial goal tracking and insights

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **UI Libraries**: shadcn/ui, Radix UI
- **Charts**: Recharts
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Styling**: Tailwind CSS with custom gradients
- **Icons**: Lucide React

---

## 📋 Prerequisites

- Node.js (v18 or above)
- Yarn package manager
- MongoDB (local or MongoDB Atlas)

---

## ⚡ Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd personal-finance-tracker
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root folder:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=finance_tracker
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Set Up MongoDB

#### Option A: Local MongoDB

1. Install MongoDB
2. Start the MongoDB service:
   ```bash
   sudo systemctl start mongod
   ```
3. Verify installation:
   ```bash
   mongo --eval "db.adminCommand('ismaster')"
   ```

#### Option B: MongoDB Atlas

1. [Create an Atlas account](https://www.mongodb.com/atlas)
2. Set up a cluster and get the connection string
3. Update `.env.local` with:
   ```env
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/finance_tracker?retryWrites=true&w=majority
   ```

### 5. Run the Development Server

```bash
yarn dev
```

Visit `http://localhost:3000` in your browser.

---

## 📄 Database Schema

### Transactions

```json
{
  "id": "uuid-string",
  "amount": 25.50,
  "date": "2024-12-20T00:00:00.000Z",
  "description": "Lunch at restaurant",
  "category": "food",
  "createdAt": "2024-12-20T12:00:00.000Z",
  "updatedAt": "2024-12-20T12:00:00.000Z"
}
```

### Budgets

```json
{
  "id": "uuid-string",
  "category": "food",
  "amount": 500.00,
  "month": "2024-12",
  "createdAt": "2024-12-01T00:00:00.000Z",
  "updatedAt": "2024-12-01T00:00:00.000Z"
}
```

---

## 📡 API Endpoints

### Transactions

- `GET /api/transactions` – Get all transactions
- `POST /api/transactions` – Add a new transaction
- `PUT /api/transactions/:id` – Update an existing transaction
- `DELETE /api/transactions/:id` – Remove a transaction

### Budgets

- `GET /api/budgets` – Get all budgets
- `POST /api/budgets` – Create or update a budget

### Categories

- `GET /api/categories` – Get predefined categories

### Analytics

- `GET /api/analytics/monthly` – Get monthly expense data
- `GET /api/analytics/categories` – Get category-wise spending
- `GET /api/analytics/budget` – Compare budget vs actual spending

---

## 🎨 Predefined Categories

1. 🍽️ **Food & Dining** (#ef4444)
2. 🚗 **Transportation** (#3b82f6)
3. 🛒 **Shopping** (#8b5cf6)
4. 🎬 **Entertainment** (#f59e0b)
5. 💡 **Bills & Utilities** (#10b981)
6. 🏥 **Healthcare** (#ec4899)
7. 📚 **Education** (#6366f1)
8. 📦 **Other** (#6b7280)

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub, GitLab, or Bitbucket
2. Install the Vercel CLI:

```bash
npm i -g vercel
vercel
```

3. Set the environment variables in your Vercel dashboard:
   - `MONGO_URL`
   - `DB_NAME`
   - `NEXT_PUBLIC_BASE_URL`

### Docker

1. Build Docker image:

```bash
docker build -t finance-tracker .
```

2. Run the container:

```bash
docker run -p 3000:3000 --env-file .env.local finance-tracker
```

---

## 🤔 Troubleshooting

- **MongoDB Connection Issues**:

  - Ensure MongoDB is running and accessible
  - Validate your connection string

- **Port Conflicts**:

  ```bash
  lsof -ti:3000 | xargs kill -9
  yarn dev -p 3001
  ```

- **Chart Errors**:

  - Make sure transactions include valid dates
  - Check browser console for Recharts issues

- **Dependencies**:

  ```bash
  rm -rf node_modules yarn.lock
  yarn install
  ```

- **Performance Optimizations**:

  ```js
  db.transactions.createIndex({ "date": -1 });
  db.transactions.createIndex({ "category": 1 });
  db.budgets.createIndex({ "month": 1, "category": 1 });
  ```

---

## 🔖 License

This project is licensed under the MIT License. See the `LICENSE` file for more information.

---

**Crafted with precision using Next.js, React, and MongoDB.**

