"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Plus, Edit, Loader2 } from "lucide-react"
import { CategoryManager } from "./category-manager"
import { MonthSelector } from "./month-selector"
import { dataStore } from "@/lib/data-store"
import { formatPKR } from "@/lib/utils"
import { useMonth } from "@/lib/month-context"
import { useAvailableMonths } from "@/lib/use-available-months"
import type { ExpenseData, Category, Account, MonthlyIncome, SavingsAccount, BudgetItem } from "@/lib/types"

const savingsData = [
  { month: "Jan", amount: 1000 },
  { month: "Feb", amount: 1200 },
  { month: "Mar", amount: 1400 },
]

export function DashboardTab() {
  const { selectedMonth } = useMonth()
  const { refreshMonths, formatMonthDisplay } = useAvailableMonths()

  const [expenseData, setExpenseData] = useState<ExpenseData[]>([])
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([])
  const [monthlyIncomes, setMonthlyIncomes] = useState<MonthlyIncome[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isEditIncomeOpen, setIsEditIncomeOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    amount: "",
    date: "",
  })
  const [incomeFormData, setIncomeFormData] = useState({
    amount: "",
    month: "",
    source: "",
  })
  console.log(incomeFormData)
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setExpenseData(dataStore.getExpenseData())
      setBudgetData(dataStore.getBudgetData())
      setCategories(dataStore.getCategories())
      setAccounts(dataStore.getAccounts())
      setSavingsAccounts(dataStore.getSavingsAccounts())
      setMonthlyIncomes(dataStore.getMonthlyIncomes())
      
      // Refresh available months when data changes
      refreshMonths()
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      // Create a budget item with both forecast and actual values
      await dataStore.addBudgetItem({
        name: formData.name,
        category: formData.category,
        forecast: Number.parseFloat(formData.amount), // Use entered amount as forecast
        actual: Number.parseFloat(formData.amount),   // Use entered amount as actual
        date: formData.date,
      })

      setFormData({ name: "", category: "", amount: "", date: "" })
      setIsAddExpenseOpen(false)
      await loadData()
    } catch (error) {
      console.error('Error adding expense:', error)
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: "", category: "", amount: "", date: "" })
    setIsAddExpenseOpen(false)
  }

  const resetIncomeForm = () => {
    setIncomeFormData({ amount: "", month: "", source: "" })
    setIsEditIncomeOpen(false)
  }

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      const incomeData = {
        amount: Number.parseFloat(incomeFormData.amount),
        month: incomeFormData.month,
        source: incomeFormData.source,
      }

      await dataStore.addMonthlyIncome(incomeData)
      resetIncomeForm()
      await loadData()
    } catch (error) {
      console.error('Error adding income:', error)
      setLoading(false)
    }
  }

  // Group expense data by month and category - now using budget data actual expenses
  const getMonthlyExpenseData = (month: string) => {
    // Filter budget data for the selected month and use actual expenses
    const monthData = budgetData.filter((item) => item.date.startsWith(month))
    const grouped = monthData.reduce(
      (acc, item) => {
        // Only include items with actual values
        if (item.actual !== undefined) {
          const existing = acc.find((g) => g.category === item.category)
          if (existing) {
            existing.amount += item.actual
          } else {
            acc.push({ category: item.category, amount: item.actual })
          }
        }
        return acc
      },
      [] as { category: string; amount: number }[],
    )
    return grouped
  }

  const currentExpenseData = getMonthlyExpenseData(selectedMonth)
  const totalExpenses = currentExpenseData.reduce((sum, item) => sum + item.amount, 0)

  const categoryColors = categories.reduce(
    (acc, cat) => {
      acc[cat.name] = cat.color
      return acc
    },
    {} as Record<string, string>,
  )

  const expenseCategories = categories.filter((cat) => cat.type === "expense")

  // Calculate total balance from all accounts
  const totalAccountBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
  const totalSavingsBalance = savingsAccounts.reduce((sum, account) => sum + account.balance, 0)
  const totalBalance = totalAccountBalance + totalSavingsBalance

  // Get selected month's income (using the unified selectedMonth)
  const selectedMonthIncome = monthlyIncomes
    .filter(income => income.month === selectedMonth)
    .reduce((sum, income) => sum + income.amount, 0)

  // Get selected month's expenses (using the unified selectedMonth)
  const selectedMonthExpenses = getMonthlyExpenseData(selectedMonth)
    .reduce((sum, item) => sum + item.amount, 0)

  // Calculate expense percentage change from previous month
  const calculateExpenseChange = () => {
    const currentDate = new Date(selectedMonth + "-01")
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    const previousMonthStr = previousMonth.toISOString().substring(0, 7)
    
    const currentExpenses = selectedMonthExpenses
    const previousExpenses = getMonthlyExpenseData(previousMonthStr)
      .reduce((sum, item) => sum + item.amount, 0)
    
    if (previousExpenses === 0) return { percentage: 0, direction: 'same' as const }
    
    const change = ((currentExpenses - previousExpenses) / previousExpenses) * 100
    const direction = change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'same' as const
    
    return { percentage: Math.abs(change), direction }
  }

  const expenseChange = calculateExpenseChange()

  // Show loading spinner while data is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] space-x-2">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-lg">Loading dashboard data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header with Month Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Overview for {formatMonthDisplay(selectedMonth)}</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector />
        </div>
      </div>

      {/* Quick Balance Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPKR(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              From accounts & savings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsEditIncomeOpen(true)}>
                <Edit className="h-3 w-3" />
              </Button>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPKR(selectedMonthIncome)}</div>
            <p className="text-xs text-muted-foreground">
              For {formatMonthDisplay(selectedMonth)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPKR(selectedMonthExpenses)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {expenseChange.direction === 'up' && <TrendingUp className="inline h-3 w-3 mr-1 text-red-500" />}
              {expenseChange.direction === 'down' && <TrendingDown className="inline h-3 w-3 mr-1 text-green-500" />}
              {expenseChange.percentage > 0 ? 
                `${expenseChange.direction === 'up' ? '+' : '-'}${expenseChange.percentage.toFixed(1)}% from last month` : 
                'No change from last month'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Fixed sizing and responsive */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expenses by Category</CardTitle>
            <CardDescription>Breakdown of your spending for {formatMonthDisplay(selectedMonth)}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                amount: {
                  label: "Amount",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentExpenseData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" fontSize={12} angle={-45} textAnchor="end" height={60} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="amount">
                    {currentExpenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={categoryColors[entry.category] || `hsl(${(index * 137.5) % 360}, 70%, 50%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
            <CardDescription>Category breakdown for {formatMonthDisplay(selectedMonth)}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                amount: {
                  label: "Amount",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <Pie
                    data={currentExpenseData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="amount"
                    nameKey="category"
                    labelLine={false}
                    fontSize={10}
                  >
                    {currentExpenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={categoryColors[entry.category] || "#8884d8"} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Savings Trend - Full width */}
      <Card>
        <CardHeader>
          <CardTitle>Savings Trend</CardTitle>
          <CardDescription>Your savings progress over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              amount: {
                label: "Savings Amount",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[250px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={savingsData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="amount" stroke="hsl(var(--chart-2))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
