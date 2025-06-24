import type { ExpenseData, BudgetItem, SavingsAccount, Account, GoldInvestment, ZakatRecord, Category, MonthlyIncome, Asset } from "./types"

// Check if we're in production (Vercel) or development
const isProduction = process.env.NODE_ENV === 'production'

// API endpoints for data operations
const API_BASE = "/api/data"

// Generic API functions
async function fetchData<T>(endpoint: string): Promise<T[]> {
  try {
    const response = await fetch(`${API_BASE}/${endpoint}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error)
    return []
  }
}

async function saveData<T>(endpoint: string, data: T[]): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return response.ok
  } catch (error) {
    console.error(`Error saving ${endpoint}:`, error)
    return false
  }
}

// Categories API
export const categoriesApi = {
  getAll: () => fetchData<Category>("categories"),
  save: (data: Category[]) => saveData("categories", data),
}

// Expense Data API
export const expenseDataApi = {
  getAll: () => fetchData<ExpenseData>("expense-data"),
  save: (data: ExpenseData[]) => saveData("expense-data", data),
}

// Budget Data API
export const budgetDataApi = {
  getAll: () => fetchData<BudgetItem>("budget-data"),
  save: (data: BudgetItem[]) => saveData("budget-data", data),
}

// Savings Accounts API
export const savingsAccountsApi = {
  getAll: () => fetchData<SavingsAccount>("savings-accounts"),
  save: (data: SavingsAccount[]) => saveData("savings-accounts", data),
}

// Accounts API
export const accountsApi = {
  getAll: () => fetchData<Account>("accounts"),
  save: (data: Account[]) => saveData("accounts", data),
}

// Gold Investments API
export const goldInvestmentsApi = {
  getAll: () => fetchData<GoldInvestment>("gold-investments"),
  save: (data: GoldInvestment[]) => saveData("gold-investments", data),
}

// Zakat Records API
export const zakatRecordsApi = {
  getAll: () => fetchData<ZakatRecord>("zakat-records"),
  save: (data: ZakatRecord[]) => saveData("zakat-records", data),
}

// Monthly Incomes API
export const monthlyIncomesApi = {
  getAll: () => fetchData<MonthlyIncome>("monthly-incomes"),
  save: (data: MonthlyIncome[]) => saveData("monthly-incomes", data),
}

// Assets API
export const assetsApi = {
  getAll: () => fetchData<Asset>("assets"),
  save: (data: Asset[]) => saveData("assets", data),
}
