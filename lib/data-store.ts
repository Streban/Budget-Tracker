"use client"

import type { ExpenseData, BudgetItem, SavingsAccount, Account, GoldInvestment, ZakatRecord, Category, MonthlyIncome } from "./types"
import {
  categoriesApi,
  expenseDataApi,
  budgetDataApi,
  savingsAccountsApi,
  accountsApi,
  goldInvestmentsApi,
  zakatRecordsApi,
} from "./data-api"

// Data store class that uses API instead of localStorage
class DataStore {
  private categories: Category[] = []
  private expenseData: ExpenseData[] = []
  private budgetData: BudgetItem[] = []
  private savingsAccounts: SavingsAccount[] = []
  private accounts: Account[] = []
  private goldInvestments: GoldInvestment[] = []
  private zakatRecords: ZakatRecord[] = []
  private monthlyIncomes: MonthlyIncome[] = []

  constructor() {
    this.loadAllData()
    // Load monthly incomes from localStorage for now
    if (typeof window !== 'undefined') {
      const storedIncomes = localStorage.getItem('monthlyIncomes')
      if (storedIncomes) {
        this.monthlyIncomes = JSON.parse(storedIncomes)
      }
    }
  }

  private async loadAllData() {
    try {
      const [categories, expenseData, budgetData, savingsAccounts, accounts, goldInvestments, zakatRecords] =
        await Promise.all([
          categoriesApi.getAll(),
          expenseDataApi.getAll(),
          budgetDataApi.getAll(),
          savingsAccountsApi.getAll(),
          accountsApi.getAll(),
          goldInvestmentsApi.getAll(),
          zakatRecordsApi.getAll(),
        ])

      this.categories = categories
      this.expenseData = expenseData
      this.budgetData = budgetData
      this.savingsAccounts = savingsAccounts
      this.accounts = accounts
      this.goldInvestments = goldInvestments
      this.zakatRecords = zakatRecords
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  // Categories CRUD
  getCategories(): Category[] {
    return this.categories
  }

  async addCategory(category: Omit<Category, "id">): Promise<Category> {
    const newCategory = { ...category, id: Date.now().toString() }
    this.categories.push(newCategory)
    await categoriesApi.save(this.categories)
    return newCategory
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const index = this.categories.findIndex((c) => c.id === id)
    if (index === -1) return null
    this.categories[index] = { ...this.categories[index], ...updates }
    await categoriesApi.save(this.categories)
    return this.categories[index]
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const index = this.categories.findIndex((c) => c.id === id)
      if (index === -1) return false
      this.categories.splice(index, 1)
      const success = await categoriesApi.save(this.categories)
      if (!success) {
        console.error("Failed to save categories after deletion")
      }
      return success
    } catch (error) {
      console.error("Error deleting category:", error)
      return false
    }
  }

  // Expense Data CRUD
  getExpenseData(): ExpenseData[] {
    return this.expenseData
  }

  async addExpenseData(expense: Omit<ExpenseData, "id">): Promise<ExpenseData> {
    const newExpense = { ...expense, id: Date.now().toString() }
    this.expenseData.push(newExpense)
    await expenseDataApi.save(this.expenseData)
    return newExpense
  }

  async updateExpenseData(id: string, updates: Partial<ExpenseData>): Promise<ExpenseData | null> {
    const index = this.expenseData.findIndex((e) => e.id === id)
    if (index === -1) return null
    this.expenseData[index] = { ...this.expenseData[index], ...updates }
    await expenseDataApi.save(this.expenseData)
    return this.expenseData[index]
  }

  async deleteExpenseData(id: string): Promise<boolean> {
    try {
      const index = this.expenseData.findIndex((e) => e.id === id)
      if (index === -1) return false
      this.expenseData.splice(index, 1)
      const success = await expenseDataApi.save(this.expenseData)
      if (!success) {
        console.error("Failed to save expense data after deletion")
      }
      return success
    } catch (error) {
      console.error("Error deleting expense data:", error)
      return false
    }
  }

  // Budget Data CRUD
  getBudgetData(): BudgetItem[] {
    return this.budgetData
  }

  async addBudgetItem(item: Omit<BudgetItem, "id">): Promise<BudgetItem> {
    const newItem = { ...item, id: Date.now().toString() }
    this.budgetData.push(newItem)
    await budgetDataApi.save(this.budgetData)
    return newItem
  }

  async updateBudgetItem(id: string, updates: Partial<BudgetItem>): Promise<BudgetItem | null> {
    const index = this.budgetData.findIndex((b) => b.id === id)
    if (index === -1) return null
    this.budgetData[index] = { ...this.budgetData[index], ...updates }
    await budgetDataApi.save(this.budgetData)
    return this.budgetData[index]
  }

  async deleteBudgetItem(id: string): Promise<boolean> {
    try {
      const index = this.budgetData.findIndex((b) => b.id === id)
      if (index === -1) return false
      this.budgetData.splice(index, 1)
      const success = await budgetDataApi.save(this.budgetData)
      if (!success) {
        console.error("Failed to save budget data after deletion")
      }
      return success
    } catch (error) {
      console.error("Error deleting budget item:", error)
      return false
    }
  }

  // Savings Accounts CRUD
  getSavingsAccounts(): SavingsAccount[] {
    return this.savingsAccounts
  }

  async addSavingsAccount(account: Omit<SavingsAccount, "id">): Promise<SavingsAccount> {
    const newAccount = { ...account, id: Date.now().toString() }
    this.savingsAccounts.push(newAccount)
    await savingsAccountsApi.save(this.savingsAccounts)
    return newAccount
  }

  async updateSavingsAccount(id: string, updates: Partial<SavingsAccount>): Promise<SavingsAccount | null> {
    const index = this.savingsAccounts.findIndex((a) => a.id === id)
    if (index === -1) return null
    this.savingsAccounts[index] = { ...this.savingsAccounts[index], ...updates }
    await savingsAccountsApi.save(this.savingsAccounts)
    return this.savingsAccounts[index]
  }

  async deleteSavingsAccount(id: string): Promise<boolean> {
    try {
      const index = this.savingsAccounts.findIndex((a) => a.id === id)
      if (index === -1) return false
      this.savingsAccounts.splice(index, 1)
      const success = await savingsAccountsApi.save(this.savingsAccounts)
      if (!success) {
        console.error("Failed to save savings accounts after deletion")
      }
      return success
    } catch (error) {
      console.error("Error deleting savings account:", error)
      return false
    }
  }

  // Accounts CRUD
  getAccounts(): Account[] {
    return this.accounts
  }

  async addAccount(account: Omit<Account, "id">): Promise<Account> {
    const newAccount = { ...account, id: Date.now().toString() }
    this.accounts.push(newAccount)
    await accountsApi.save(this.accounts)
    return newAccount
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<Account | null> {
    const index = this.accounts.findIndex((a) => a.id === id)
    if (index === -1) return null
    this.accounts[index] = { ...this.accounts[index], ...updates }
    await accountsApi.save(this.accounts)
    return this.accounts[index]
  }

  async deleteAccount(id: string): Promise<boolean> {
    try {
      const index = this.accounts.findIndex((a) => a.id === id)
      if (index === -1) return false
      this.accounts.splice(index, 1)
      const success = await accountsApi.save(this.accounts)
      if (!success) {
        console.error("Failed to save accounts after deletion")
      }
      return success
    } catch (error) {
      console.error("Error deleting account:", error)
      return false
    }
  }

  // Gold Investments CRUD
  getGoldInvestments(): GoldInvestment[] {
    return this.goldInvestments
  }

  async addGoldInvestment(investment: Omit<GoldInvestment, "id">): Promise<GoldInvestment> {
    const newInvestment = { ...investment, id: Date.now().toString() }
    this.goldInvestments.push(newInvestment)
    await goldInvestmentsApi.save(this.goldInvestments)
    return newInvestment
  }

  async updateGoldInvestment(id: string, updates: Partial<GoldInvestment>): Promise<GoldInvestment | null> {
    const index = this.goldInvestments.findIndex((g) => g.id === id)
    if (index === -1) return null
    this.goldInvestments[index] = { ...this.goldInvestments[index], ...updates }
    await goldInvestmentsApi.save(this.goldInvestments)
    return this.goldInvestments[index]
  }

  async deleteGoldInvestment(id: string): Promise<boolean> {
    try {
      const index = this.goldInvestments.findIndex((g) => g.id === id)
      if (index === -1) return false
      this.goldInvestments.splice(index, 1)
      const success = await goldInvestmentsApi.save(this.goldInvestments)
      if (!success) {
        console.error("Failed to save gold investments after deletion")
      }
      return success
    } catch (error) {
      console.error("Error deleting gold investment:", error)
      return false
    }
  }

  // Zakat Records CRUD
  getZakatRecords(): ZakatRecord[] {
    return this.zakatRecords
  }

  async addZakatRecord(record: Omit<ZakatRecord, "id">): Promise<ZakatRecord> {
    const newRecord = { ...record, id: Date.now().toString() }
    this.zakatRecords.push(newRecord)
    await zakatRecordsApi.save(this.zakatRecords)
    return newRecord
  }

  async updateZakatRecord(id: string, updates: Partial<ZakatRecord>): Promise<ZakatRecord | null> {
    const index = this.zakatRecords.findIndex((z) => z.id === id)
    if (index === -1) return null
    this.zakatRecords[index] = { ...this.zakatRecords[index], ...updates }
    await zakatRecordsApi.save(this.zakatRecords)
    return this.zakatRecords[index]
  }

  async deleteZakatRecord(id: string): Promise<boolean> {
    try {
      const index = this.zakatRecords.findIndex((z) => z.id === id)
      if (index === -1) return false
      this.zakatRecords.splice(index, 1)
      const success = await zakatRecordsApi.save(this.zakatRecords)
      if (!success) {
        console.error("Failed to save zakat records after deletion")
      }
      return success
    } catch (error) {
      console.error("Error deleting zakat record:", error)
      return false
    }
  }

  // Monthly Income CRUD
  getMonthlyIncomes(): MonthlyIncome[] {
    return this.monthlyIncomes
  }

  async addMonthlyIncome(income: Omit<MonthlyIncome, "id">): Promise<MonthlyIncome> {
    const newIncome = { ...income, id: Date.now().toString() }
    this.monthlyIncomes.push(newIncome)
    // For now, we'll store in localStorage since there's no API endpoint
    if (typeof window !== 'undefined') {
      localStorage.setItem('monthlyIncomes', JSON.stringify(this.monthlyIncomes))
    }
    return newIncome
  }

  async updateMonthlyIncome(id: string, updates: Partial<MonthlyIncome>): Promise<MonthlyIncome | null> {
    const index = this.monthlyIncomes.findIndex((i) => i.id === id)
    if (index === -1) return null
    this.monthlyIncomes[index] = { ...this.monthlyIncomes[index], ...updates }
    if (typeof window !== 'undefined') {
      localStorage.setItem('monthlyIncomes', JSON.stringify(this.monthlyIncomes))
    }
    return this.monthlyIncomes[index]
  }

  async deleteMonthlyIncome(id: string): Promise<boolean> {
    try {
      const index = this.monthlyIncomes.findIndex((i) => i.id === id)
      if (index === -1) return false
      this.monthlyIncomes.splice(index, 1)
      if (typeof window !== 'undefined') {
        localStorage.setItem('monthlyIncomes', JSON.stringify(this.monthlyIncomes))
      }
      return true
    } catch (error) {
      console.error("Error deleting monthly income:", error)
      return false
    }
  }
}

export const dataStore = new DataStore()
