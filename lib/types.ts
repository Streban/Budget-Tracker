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
  actual: number
  date: string
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

export interface GoldInvestment {
  id: string
  type: string
  weight: number
  purity: string
  purchasePrice: number
  purchaseDate: string
  currentPrice: number
  location: string
}

export interface ZakatRecord {
  id: string
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
