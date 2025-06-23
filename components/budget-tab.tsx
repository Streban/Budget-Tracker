"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
import { Plus, Edit, Trash2, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import { CategoryManager } from "./category-manager"
import { dataStore } from "@/lib/data-store"
import { formatPKR, getCurrentMonth } from "@/lib/utils"
import type { BudgetItem, Category, MonthlyIncome } from "@/lib/types"

export function BudgetTab() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [monthlyIncomes, setMonthlyIncomes] = useState<MonthlyIncome[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    forecast: "",
    actual: "",
    date: "",
  })
  const [incomeFormData, setIncomeFormData] = useState({
    amount: "",
    month: "",
    source: "",
  })

  useEffect(() => {
    loadData()
    // Set selected month to the latest available month when data loads
    const months = Array.from(new Set(budgetData.map((item) => item.date.substring(0, 7))))
      .sort()
      .reverse()
    if (months.length > 0 && !months.includes(selectedMonth)) {
      setSelectedMonth(months[0])
    }
  }, [budgetData])

  const loadData = () => {
    const newBudgetData = dataStore.getBudgetData()
    setBudgetData(newBudgetData)
    setCategories(dataStore.getCategories())
    setMonthlyIncomes(dataStore.getMonthlyIncomes())

    // Update selected month to latest if current selection has no data
    const months = Array.from(new Set(newBudgetData.map((item) => item.date.substring(0, 7))))
      .sort()
      .reverse()
    if (months.length > 0 && !newBudgetData.some((item) => item.date.startsWith(selectedMonth))) {
      setSelectedMonth(months[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const itemData = {
      name: formData.name,
      category: formData.category,
      forecast: Number.parseFloat(formData.forecast),
      actual: Number.parseFloat(formData.actual),
      date: formData.date,
    }

    if (editingItem) {
      await dataStore.updateBudgetItem(editingItem.id, itemData)
    } else {
      await dataStore.addBudgetItem(itemData)
    }

    resetForm()
    loadData()
  }

  const handleEdit = (item: BudgetItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      forecast: item.forecast.toString(),
      actual: item.actual.toString(),
      date: item.date,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this budget item?")) {
      await dataStore.deleteBudgetItem(id)
      loadData()
    }
  }

  const resetForm = () => {
    setFormData({ name: "", category: "", forecast: "", actual: "", date: "" })
    setEditingItem(null)
    setIsDialogOpen(false)
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

  const resetIncomeForm = () => {
    setIncomeFormData({ amount: "", month: "", source: "" })
    setIsIncomeDialogOpen(false)
  }

  // Filter budget data by selected month
  const currentBudgetData = budgetData.filter((item) => item.date.startsWith(selectedMonth))

  const availableMonths = Array.from(new Set(budgetData.map((item) => item.date.substring(0, 7))))
    .sort()
    .reverse()

  // Function to format month for display
  const formatMonthDisplay = (monthStr: string) => {
    const date = new Date(monthStr + "-01")
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

  const totalForecast = currentBudgetData.reduce((sum, item) => sum + item.forecast, 0)
  const totalActual = currentBudgetData.reduce((sum, item) => sum + item.actual, 0)
  const totalVariance = totalActual - totalForecast

  const expenseCategories = categories.filter((cat) => cat.type === "expense")

  function getVarianceStatus(forecast: number, actual: number) {
    const variance = ((actual - forecast) / forecast) * 100
    if (variance > 10) return { status: "over", color: "destructive" }
    if (variance < -10) return { status: "under", color: "secondary" }
    return { status: "on-track", color: "default" }
  }

  function getVarianceColor(forecast: number, actual: number) {
    const variance = actual - forecast
    if (variance > 0) return "text-red-600 bg-red-50"
    if (variance < 0) return "text-green-600 bg-green-50"
    return "text-gray-600 bg-gray-50"
  }

  // Get current month's income
  const currentMonthIncome = monthlyIncomes
    .filter(income => income.month === selectedMonth)
    .reduce((sum, income) => sum + income.amount, 0)

  return (
    <div className="space-y-6">
      {/* Budget Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPKR(currentMonthIncome)}</div>
            <p className="text-xs text-muted-foreground">For {formatMonthDisplay(selectedMonth)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPKR(totalForecast)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPKR(totalActual)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Variance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", totalVariance > 0 ? "text-red-600" : "text-green-600")}>
              {totalVariance > 0 ? "+" : ""}{formatPKR(Math.abs(totalVariance))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Monthly Budget Tracking</CardTitle>
              <CardDescription>Track your forecasted vs actual expenses</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <CategoryManager categories={categories} onCategoriesChange={loadData} />
              <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Add Income
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Monthly Income</DialogTitle>
                    <DialogDescription>Add income for budget planning</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleIncomeSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="budget-income-source">Income Source</Label>
                      <Input
                        id="budget-income-source"
                        value={incomeFormData.source}
                        onChange={(e) => setIncomeFormData({ ...incomeFormData, source: e.target.value })}
                        placeholder="e.g., Salary, Freelance"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="budget-income-amount">Amount</Label>
                      <Input
                        id="budget-income-amount"
                        type="number"
                        step="0.01"
                        value={incomeFormData.amount}
                        onChange={(e) => setIncomeFormData({ ...incomeFormData, amount: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="budget-income-month">Month</Label>
                      <Input
                        id="budget-income-month"
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
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingItem ? "Edit Budget Item" : "Add Budget Item"}</DialogTitle>
                    <DialogDescription>
                      {editingItem ? "Update the budget item details" : "Add a new budget item to track"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter item name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="forecast">Forecast</Label>
                        <Input
                          id="forecast"
                          type="number"
                          step="0.01"
                          value={formData.forecast}
                          onChange={(e) => setFormData({ ...formData, forecast: e.target.value })}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="actual">Actual</Label>
                        <Input
                          id="actual"
                          type="number"
                          step="0.01"
                          value={formData.actual}
                          onChange={(e) => setFormData({ ...formData, actual: e.target.value })}
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                      <Button type="submit">{editingItem ? "Update" : "Add"} Item</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Forecast</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentBudgetData.map((item) => {
                const variance = item.actual - item.forecast
                const { status, color } = getVarianceStatus(item.forecast, item.actual)

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatPKR(item.forecast)}</TableCell>
                    <TableCell className="text-right">{formatPKR(item.actual)}</TableCell>
                    <TableCell className={cn("text-right font-medium", getVarianceColor(item.forecast, item.actual))}>
                      {variance > 0 ? "+" : ""}{formatPKR(Math.abs(variance))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={color as any}>
                        {status === "over" ? "Over Budget" : status === "under" ? "Under Budget" : "On Track"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
