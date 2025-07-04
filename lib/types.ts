export interface ExpenseData {
  id: string
  category: string
  amount: number
  month: string
}

export interface BudgetItem {
  id: string
  name: string
  category: string
  forecast: number
  actual?: number
  date: string
  isPaid?: boolean
  notes?: string
}

export interface MonthlyIncome {
  id: string
  amount: number
  month: string
  source: string
}

export interface SavingsAccount {
  id: string
  name: string
  type: string
  balance: number
  goal: number
  interestRate: number
  bank: string
}

export interface Account {
  id: string
  name: string
  type: string
  balance: number
  bank: string
  lastTransaction: string
}

export interface SavingsTracker {
  id: string
  date: string
  amount: number
  type: "deposit" | "withdrawal"
  description: string
  accountId: string
  accountName: string
}

export interface GoldInvestment {
  id: string
  name: string
  type: string
  weight: number
  purity: string
  purchaseDate: string
}

export interface GoldPrices {
  gold22k: number
  gold24k: number
  lastYearAccountBalance: number
  nisaabThreshold: number
}

export interface ZakatRecord {
  id: string
  name: string
  year: string
  totalWealth: number
  zakatDue: number
  zakatPaid: number
  paymentDate: string
  status: string
}

export interface Category {
  id: string
  name: string
  color: string
  type: "expense" | "income"
}

export interface Asset {
  id: string
  name: string
  currency: string
  amount: number
  currentRate: number // Exchange rate to PKR
  notes: string
  dateAdded: string
}
