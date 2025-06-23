"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Plus, Edit } from "lucide-react"
import { CategoryManager } from "./category-manager"
import { dataStore } from "@/lib/data-store"
import { formatPKR, getCurrentMonth } from "@/lib/utils"
import type { ExpenseData, Category, Account, MonthlyIncome, SavingsAccount } from "@/lib/types"

const savingsData = [
  { month: "Jan", amount: 1000 },
  { month: "Feb", amount: 1200 },
  { month: "Mar", amount: 1400 },
]

export function DashboardTab() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([])
  const [monthlyIncomes, setMonthlyIncomes] = useState<MonthlyIncome[]>([])
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

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setExpenseData(dataStore.getExpenseData())
    setCategories(dataStore.getCategories())
    setAccounts(dataStore.getAccounts())
    setSavingsAccounts(dataStore.getSavingsAccounts())
    setMonthlyIncomes(dataStore.getMonthlyIncomes())
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()

    // Extract month from date for expense data
    const month = formData.date.substring(0, 7) // Get YYYY-MM format

    await dataStore.addExpenseData({
      category: formData.category,
      amount: Number.parseFloat(formData.amount),
      month: month,
    })

    setFormData({ name: "", category: "", amount: "", date: "" })
    setIsAddExpenseOpen(false)
    loadData()
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

    const incomeData = {
      amount: Number.parseFloat(incomeFormData.amount),
      month: incomeFormData.month,
      source: incomeFormData.source,
    }

    await dataStore.addMonthlyIncome(incomeData)
    resetIncomeForm()
    loadData()
  }

  // Group expense data by month and category
  const getMonthlyExpenseData = (month: string) => {
    const monthData = expenseData.filter((item) => item.month === month)
    const grouped = monthData.reduce(
      (acc, item) => {
        const existing = acc.find((g) => g.category === item.category)
        if (existing) {
          existing.amount += item.amount
        } else {
          acc.push({ category: item.category, amount: item.amount })
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

  // Function to format month for display
  const formatMonthDisplay = (monthStr: string) => {
    const date = new Date(monthStr + "-01")
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

  // Get available months from expense data
  const availableMonths = Array.from(new Set(expenseData.map((item) => item.month)))
    .sort()
    .reverse()

  // Calculate total balance from all accounts
  const totalAccountBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
  const totalSavingsBalance = savingsAccounts.reduce((sum, account) => sum + account.balance, 0)
  const totalBalance = totalAccountBalance + totalSavingsBalance

  // Get current month's income
  const currentMonthIncome = monthlyIncomes
    .filter(income => income.month === selectedMonth)
    .reduce((sum, income) => sum + income.amount, 0)

  return (
    <div className="space-y-6">
      {/* Quick Balance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <div className="text-2xl font-bold">{formatPKR(currentMonthIncome)}</div>
            <p className="text-xs text-muted-foreground">For {formatMonthDisplay(selectedMonth)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPKR(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1" />
              -5.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28%</div>
            <p className="text-xs text-muted-foreground">+3.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Add controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex gap-2">
          <CategoryManager categories={categories} onCategoriesChange={loadData} />
          <Dialog open={isEditIncomeOpen} onOpenChange={setIsEditIncomeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Income
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Monthly Income</DialogTitle>
                <DialogDescription>Add or update your monthly income for tracking</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleIncomeSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="income-source">Income Source</Label>
                  <Input
                    id="income-source"
                    value={incomeFormData.source}
                    onChange={(e) => setIncomeFormData({ ...incomeFormData, source: e.target.value })}
                    placeholder="e.g., Salary, Freelance"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="income-amount">Amount</Label>
                  <Input
                    id="income-amount"
                    type="number"
                    step="0.01"
                    value={incomeFormData.amount}
                    onChange={(e) => setIncomeFormData({ ...incomeFormData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="income-month">Month</Label>
                  <Input
                    id="income-month"
                    type="month"
                    value={incomeFormData.month}
                    onChange={(e) => setIncomeFormData({ ...incomeFormData, month: e.target.value })}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetIncomeForm}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Income</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>Add a new expense entry to track your spending</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <Label htmlFor="expense-name">Name</Label>
                  <Input
                    id="expense-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter expense name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expense-category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: string) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expense-amount">Amount</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expense-date">Date</Label>
                  <Input
                    id="expense-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Expense</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Charts - Fixed sizing and responsive */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Expenses by Category */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Monthly Expenses by Category</CardTitle>
                <CardDescription>Breakdown of your spending</CardDescription>
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.length > 0 ? (
                    availableMonths.map((month) => (
                      <SelectItem key={month} value={month}>
                        {formatMonthDisplay(month)}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value={getCurrentMonth()}>{formatMonthDisplay(getCurrentMonth())}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
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
                  <Bar dataKey="amount" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
            <CardDescription>Current month category breakdown</CardDescription>
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
                    labelLine={false}
                    fontSize={10}
                  >
                    {currentExpenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={categoryColors[entry.category] || "#8884d8"} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
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
