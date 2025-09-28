"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, DollarSign, Loader2, Filter, Menu, Copy, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { CategoryManager } from "./category-manager"
import { MonthSelector } from "./month-selector"
import { dataStore } from "@/lib/data-store"
import { formatPKR } from "@/lib/utils"
import { useMonth } from "@/lib/month-context"
import { useAvailableMonths } from "@/lib/use-available-months"
import type { BudgetItem, Category, MonthlyIncome, Account, ClosedMonth } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

export function BudgetTab() {
  const { selectedMonth } = useMonth()
  const { refreshMonths, formatMonthDisplay } = useAvailableMonths()
  const { toast } = useToast()
  
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [monthlyIncomes, setMonthlyIncomes] = useState<MonthlyIncome[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false)
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false)
  const [isCloseMonthDialogOpen, setIsCloseMonthDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [closedMonths, setClosedMonths] = useState<ClosedMonth[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState("")
  const [editableRemainingAmount, setEditableRemainingAmount] = useState("")
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "unpaid">("all")
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    forecast: "",
    actual: "",
    date: new Date().toISOString().split('T')[0],
    notes: "",
  })
  const [incomeFormData, setIncomeFormData] = useState({
    amount: "",
    month: "",
    source: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const newBudgetData = dataStore.getBudgetData()
      setBudgetData(newBudgetData)
      setCategories(dataStore.getCategories())
      setMonthlyIncomes(dataStore.getMonthlyIncomes())
      setAccounts(dataStore.getAccounts())
      setClosedMonths(dataStore.getClosedMonths())
      
      // Refresh available months when data changes
      refreshMonths()
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      const itemData = {
        name: formData.name,
        category: formData.category,
        forecast: Number.parseFloat(formData.forecast),
        actual: formData.actual ? Number.parseFloat(formData.actual) : undefined,
        date: formData.date,
        notes: formData.notes || undefined,
      }

      if (editingItem) {
        await dataStore.updateBudgetItem(editingItem.id, itemData)
      } else {
        await dataStore.addBudgetItem(itemData)
      }

      resetForm()
      await loadData()
    } catch (error) {
      console.error('Error saving budget item:', error)
      setLoading(false)
    }
  }

  const handleEdit = (item: BudgetItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      forecast: item.forecast.toString(),
      actual: item.actual?.toString() || "",
      date: item.date,
      notes: item.notes || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      setLoading(true)
      await dataStore.deleteBudgetItem(id)
      await loadData()
    } catch (error) {
      console.error('Error deleting budget item:', error)
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ 
      name: "", 
      category: "", 
      forecast: "", 
      actual: "", 
      date: new Date().toISOString().split('T')[0],
      notes: "" 
    })
    setEditingItem(null)
    setIsDialogOpen(false)
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
      console.error('Error saving income:', error)
      setLoading(false)
    }
  }

  const resetIncomeForm = () => {
    setIncomeFormData({ amount: "", month: "", source: "" })
    setIsIncomeDialogOpen(false)
  }

  const handleCloseMonth = () => {
    // Check if month is already closed
    if (dataStore.isMonthClosed(selectedMonth)) {
      toast({
        title: "Month Already Closed 🔒",
        description: `${formatMonthDisplay(selectedMonth)} has already been closed and cannot be closed again.`,
        variant: "destructive",
      })
      return
    }

    // Calculate remaining money
    const currentMonthIncome = monthlyIncomes
      .filter(income => income.month === selectedMonth)
      .reduce((sum, income) => sum + income.amount, 0)
    
    const totalActual = budgetData
      .filter((item) => item.date.startsWith(selectedMonth))
      .reduce((sum, item) => sum + (item.actual || 0), 0)
    
    const remainingMoney = currentMonthIncome - totalActual
    
    // Initialize editable amount with calculated remaining money
    setEditableRemainingAmount(remainingMoney.toString())
    
    if (remainingMoney > 0) {
      // If there's remaining money, open dialog to select account
      toast({
        title: "Money Available to Save! 💰",
        description: `You have ${formatPKR(remainingMoney)} remaining from this month. Choose an account to save it.`,
      })
      setIsCloseMonthDialogOpen(true)
    } else if (remainingMoney === 0) {
      // Perfect balance
      toast({
        title: "Perfect Balance! ⚖️",
        description: `Month ${formatMonthDisplay(selectedMonth)} closed with exact balance - no remaining money to save.`,
      })
      handleMonthClosure()
    } else {
      // Deficit/overspent
      toast({
        title: "Month Closed 📊",
        description: `Month ${formatMonthDisplay(selectedMonth)} closed. You spent ${formatPKR(Math.abs(remainingMoney))} more than your income.`,
        variant: "destructive",
      })
      handleMonthClosure()
    }
  }

  const handleMonthClosure = async () => {
    try {
      setLoading(true)
      
      // Calculate income and expenses
      const currentMonthIncome = monthlyIncomes
        .filter(income => income.month === selectedMonth)
        .reduce((sum, income) => sum + income.amount, 0)
      
      const totalActual = budgetData
        .filter((item) => item.date.startsWith(selectedMonth))
        .reduce((sum, item) => sum + (item.actual || 0), 0)
      
      // Use editable remaining amount instead of calculated amount
      const remainingMoney = parseFloat(editableRemainingAmount) || 0
      
      if (remainingMoney > 0 && selectedAccountId) {
        // Find the selected account
        const selectedAccount = accounts.find(account => account.id === selectedAccountId)
        if (selectedAccount) {
          // Add savings tracker record
          const monthName = new Date(selectedMonth + "-01").toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })
          
          await dataStore.addSavingsTracker({
            date: new Date().toISOString().split('T')[0],
            amount: remainingMoney,
            type: "deposit",
            description: `${monthName} Month Saved Salary`,
            accountId: selectedAccount.id,
            accountName: selectedAccount.name,
          })
          
          // Update account balance
          await dataStore.updateAccount(selectedAccount.id, {
            balance: selectedAccount.balance + remainingMoney,
            lastTransaction: new Date().toISOString().split('T')[0],
          })
        }
      }
      
      // Create closed month record
      const selectedAccount = accounts.find(account => account.id === selectedAccountId)
      await dataStore.addClosedMonth({
        month: selectedMonth,
        closedDate: new Date().toISOString().split('T')[0],
        totalIncome: currentMonthIncome,
        totalExpenses: totalActual,
        remainingMoney: remainingMoney,
        savedToAccountId: selectedAccount?.id,
        savedToAccountName: selectedAccount?.name,
      })
      
      // Reset form and close dialog
      setSelectedAccountId("")
      setEditableRemainingAmount("")
      setIsCloseMonthDialogOpen(false)
      
      // Reload data to reflect changes
      await loadData()
      
      // Show specific success message based on what happened
      if (remainingMoney > 0 && selectedAccountId) {
        const selectedAccount = accounts.find(account => account.id === selectedAccountId)
        toast({
          title: "Month Closed & Money Saved! 🎉",
          description: `${formatPKR(remainingMoney)} has been transferred to ${selectedAccount?.name} and month ${formatMonthDisplay(selectedMonth)} is now closed.`,
        })
      } else {
        toast({
          title: "Month Closed Successfully! 🎉",
          description: `${formatMonthDisplay(selectedMonth)} has been closed.`,
        })
      }
    } catch (error) {
      console.error('Error closing month:', error)
      toast({
        title: "Error Closing Month",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getRemainingMoney = () => {
    const currentMonthIncome = monthlyIncomes
      .filter(income => income.month === selectedMonth)
      .reduce((sum, income) => sum + income.amount, 0)
    
    const totalActual = budgetData
      .filter((item) => item.date.startsWith(selectedMonth))
      .reduce((sum, item) => sum + (item.actual || 0), 0)
    
    return currentMonthIncome - totalActual
  }

    const getNextMonth = (currentMonth: string) => {
    const date = new Date(currentMonth + "-01")
    date.setMonth(date.getMonth() + 1)
    return date.toISOString().substring(0, 7) // Format: YYYY-MM
  }

  const handleCopyToNextMonth = async () => {
    try {
      setLoading(true)
      const nextMonth = getNextMonth(selectedMonth)
      
      // Get all budget items from current month
      const currentMonthItems = budgetData.filter(item => 
        item.date.startsWith(selectedMonth)
      )
      
      if (currentMonthItems.length === 0) {
        setLoading(false)
        return
      }

      // Copy each item to next month
      for (const item of currentMonthItems) {
        const newItemData = {
          name: item.name,
          category: item.category,
          forecast: item.forecast,
          actual: undefined, // Reset actual amount for new month
          date: `${nextMonth}-01`, // Set to first day of next month
          notes: undefined,
          isPaid: false // Reset payment status
        }
        await dataStore.addBudgetItem(newItemData)
      }

      // Copy income to next month
      const currentMonthIncome = monthlyIncomes.filter(income => 
        income.month === selectedMonth
      )
      
      for (const income of currentMonthIncome) {
        const newIncomeData = {
          amount: income.amount,
          month: nextMonth,
          source: income.source
        }
        await dataStore.addMonthlyIncome(newIncomeData)
      }

      setIsCopyDialogOpen(false)
      await loadData()
   
    } catch (error) {
      console.error('Error copying to next month:', error)
      setLoading(false)
    }
  }

  const formatMonthForDisplay = (monthStr: string) => {
    const date = new Date(monthStr + "-01")
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const handlePaymentToggle = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(true)
      await dataStore.updateBudgetItem(id, { isPaid: !currentStatus })
      await loadData()
    } catch (error) {
      console.error('Error updating payment status:', error)
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setEditingItem(null)
    setFormData({
      name: "",
      category: "",
      forecast: "",
      actual: "",
      date: new Date().toISOString().split('T')[0],
      notes: "",
    })
    setIsDialogOpen(true)
  }

  // Filter budget data by selected month and payment status
  const currentBudgetData = budgetData
    .filter((item) => item.date.startsWith(selectedMonth))
    .filter((item) => {
      if (paymentFilter === "paid") return item.isPaid === true
      if (paymentFilter === "unpaid") return item.isPaid !== true
      return true
    })
    .sort((a, b) => a.category.localeCompare(b.category))

  const totalForecast = currentBudgetData.reduce((sum, item) => sum + item.forecast, 0)
  const totalActual = currentBudgetData.reduce((sum, item) => sum + (item.actual || 0), 0)
  const totalVariance = totalActual - totalForecast

  const expenseCategories = categories.filter((cat) => cat.type === "expense")

  function getVarianceStatus(forecast: number, actual?: number) {
    if (actual === undefined) return { status: "pending", color: "secondary" }
    const variance = ((actual - forecast) / forecast) * 100
    if (variance > 10) return { status: "over", color: "destructive" }
    if (variance < -10) return { status: "under", color: "secondary" }
    return { status: "on-track", color: "default" }
  }

  function getVarianceColor(forecast: number, actual?: number) {
    if (actual === undefined) return "text-gray-400 bg-gray-50"
    const variance = actual - forecast
    if (variance > 0) return "text-red-600 bg-red-50"
    if (variance < 0) return "text-green-600 bg-green-50"
    return "text-gray-600 bg-gray-50"
  }

  // Get current month's income
  const currentMonthIncome = monthlyIncomes
    .filter(income => income.month === selectedMonth)
    .reduce((sum, income) => sum + income.amount, 0)

  // Calculate money left
  const moneyLeftFromForecast = currentMonthIncome - totalForecast
  const moneyLeftFromActual = currentMonthIncome - totalActual

  // Function to get category color
  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName)
    return category?.color || "#8884d8" // default color if not found
  }

  // Show loading spinner while data is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] space-x-2">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-lg">Loading budget data...</span>
      </div>
    )
  }

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
            <CardTitle className="text-sm font-bold">Money Left</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-medium">From Forecast:</span>
                <span className={cn("font-medium", moneyLeftFromForecast >= 0 ? "text-green-600" : "text-red-600")}>
                  {formatPKR(Math.abs(moneyLeftFromForecast))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-medium">From Actual:</span>
                <span className={cn("font-medium", moneyLeftFromActual >= 0 ? "text-green-600" : "text-red-600")}>
                  {formatPKR(Math.abs(moneyLeftFromActual))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle>Monthly Budget Tracking</CardTitle>
              <CardDescription>Track your forecasted vs actual expenses</CardDescription>
            </div>
            
            {/* Mobile Hamburger Menu */}
            <div className="flex items-center gap-2 md:hidden">
              <MonthSelector triggerClassName="w-24 text-xs" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleAddNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Budget Item
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsIncomeDialogOpen(true)}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Add Income
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsCopyDialogOpen(true)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Next Month
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleCloseMonth}
                    disabled={dataStore.isMonthClosed(selectedMonth)}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {dataStore.isMonthClosed(selectedMonth) ? "Month Closed" : "Close Month"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5">
                    <Label htmlFor="mobile-filter" className="text-xs font-medium text-muted-foreground">
                      Filter by Payment
                    </Label>
                    <Select value={paymentFilter} onValueChange={(value: "all" | "paid" | "unpaid") => setPaymentFilter(value)}>
                      <SelectTrigger className="w-full mt-1 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="paid">Paid Only</SelectItem>
                        <SelectItem value="unpaid">Unpaid Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5">
                    <CategoryManager categories={categories} onCategoriesChange={loadData} />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop Button Layout */}
            <div className="hidden md:flex items-center gap-2">
              <Select value={paymentFilter} onValueChange={(value: "all" | "paid" | "unpaid") => setPaymentFilter(value)}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="paid">Paid Only</SelectItem>
                  <SelectItem value="unpaid">Unpaid Only</SelectItem>
                </SelectContent>
              </Select>
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
                              <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Next Month
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Copy to Next Month</DialogTitle>
                    <DialogDescription>
                      Copy all budget items and income from {formatMonthForDisplay(selectedMonth)} to {formatMonthForDisplay(getNextMonth(selectedMonth))}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">What will be copied:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• All budget items with their names, categories, and forecast amounts</li>
                        <li>• All income records</li>
                        <li>• Actual amounts will be reset (you can enter them for the new month)</li>
                        <li>• Payment status will be reset to unpaid</li>
                      </ul>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>From:</strong> {formatMonthForDisplay(selectedMonth)} → <strong>To:</strong> {formatMonthForDisplay(getNextMonth(selectedMonth))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCopyDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCopyToNextMonth}>
                      Copy Records
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCloseMonth}
                disabled={dataStore.isMonthClosed(selectedMonth)}
              >
                <Lock className="h-4 w-4 mr-2" />
                {dataStore.isMonthClosed(selectedMonth) ? "Month Closed" : "Close Month"}
              </Button>
              <MonthSelector triggerClassName="w-32" />
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={handleAddNew}>
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
                        <Label htmlFor="actual">Actual (Optional)</Label>
                        <Input
                          id="actual"
                          type="number"
                          step="0.01"
                          value={formData.actual}
                          onChange={(e) => setFormData({ ...formData, actual: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional notes or details"
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

          {/* Mobile Income Dialog */}
          <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Monthly Income</DialogTitle>
                <DialogDescription>Add income for budget planning</DialogDescription>
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

          {/* Mobile Add Item Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                    <Label htmlFor="actual">Actual (Optional)</Label>
                    <Input
                      id="actual"
                      type="number"
                      step="0.01"
                      value={formData.actual}
                      onChange={(e) => setFormData({ ...formData, actual: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes or details"
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

                     {/* Mobile Copy Dialog */}
           <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
             <DialogContent>
               <DialogHeader>
                 <DialogTitle>Copy to Next Month</DialogTitle>
                 <DialogDescription>
                   Copy all budget items and income from {formatMonthForDisplay(selectedMonth)} to {formatMonthForDisplay(getNextMonth(selectedMonth))}
                 </DialogDescription>
               </DialogHeader>
               <div className="space-y-4">
                 <div className="p-4 bg-muted rounded-lg">
                   <h4 className="font-medium mb-2">What will be copied:</h4>
                   <ul className="text-sm text-muted-foreground space-y-1">
                     <li>• All budget items with their names, categories, and forecast amounts</li>
                     <li>• All income records</li>
                     <li>• Actual amounts will be reset (you can enter them for the new month)</li>
                     <li>• Payment status will be reset to unpaid</li>
                   </ul>
                 </div>
                 <div className="text-sm text-muted-foreground">
                   <strong>From:</strong> {formatMonthForDisplay(selectedMonth)} → <strong>To:</strong> {formatMonthForDisplay(getNextMonth(selectedMonth))}
                 </div>
               </div>
               <DialogFooter>
                 <Button type="button" variant="outline" onClick={() => setIsCopyDialogOpen(false)}>
                   Cancel
                 </Button>
                 <Button onClick={handleCopyToNextMonth}>
                   Copy Records
                 </Button>
               </DialogFooter>
             </DialogContent>
           </Dialog>

          {/* Close Month Dialog */}
          <Dialog open={isCloseMonthDialogOpen} onOpenChange={setIsCloseMonthDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Close Month - {formatMonthDisplay(selectedMonth)}</DialogTitle>
                <DialogDescription>
                  Close this month and optionally save money to an account. You can edit the amount to save.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="remaining-amount">Amount to Save</Label>
                  <div className="relative">
                    <Input
                      id="remaining-amount"
                      type="number"
                      step="0.01"
                      value={editableRemainingAmount}
                      onChange={(e) => setEditableRemainingAmount(e.target.value)}
                      placeholder="0.00"
                      className="text-lg font-medium"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-sm text-muted-foreground">PKR</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Calculated remaining: {formatPKR(getRemainingMoney())} (you can edit this amount)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="select-account">Select Account to Save Money</Label>
                  <Select
                    value={selectedAccountId}
                    onValueChange={(value: string) => setSelectedAccountId(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} ({account.bank}) - {formatPKR(account.balance)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-muted-foreground">
                  This will create a savings record with description: <strong>"{new Date(selectedMonth + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Month Saved Salary"</strong> and update the selected account balance.
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCloseMonthDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleMonthClosure}
                  disabled={parseFloat(editableRemainingAmount) > 0 && !selectedAccountId}
                >
                  {parseFloat(editableRemainingAmount) > 0 ? "Close Month & Save Money" : "Close Month"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Paid</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Forecast</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Date</TableHead>
                  <TableHead className="w-32">Notes</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentBudgetData.map((item) => {
                  const { status, color } = getVarianceStatus(item.forecast, item.actual)

                  return (
                    <TableRow key={item.id} className={cn(item.isPaid && "opacity-75")}>
                      <TableCell className="text-center">
                        <Checkbox
                          id={`paid-${item.id}`}
                          checked={item.isPaid || false}
                          onCheckedChange={() => handlePaymentToggle(item.id, item.isPaid || false)}
                        />
                      </TableCell>
                      <TableCell className={cn("font-medium", item.isPaid && "line-through text-muted-foreground")}>
                        {item.name}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", item.isPaid && "line-through")}
                          style={{ 
                            borderColor: getCategoryColor(item.category),
                            color: getCategoryColor(item.category),
                            backgroundColor: `${getCategoryColor(item.category)}10`
                          }}
                        >
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn("text-right font-medium", item.isPaid && "line-through text-muted-foreground")}>
                        {formatPKR(item.forecast)}
                      </TableCell>
                      <TableCell className={cn("text-right font-medium", item.isPaid && "line-through text-muted-foreground")}>
                        {item.actual !== undefined ? formatPKR(item.actual) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={color as any} className={cn("text-xs", item.isPaid && "line-through")}>
                          {status === "over" ? "Over" : 
                           status === "under" ? "Under" : 
                           status === "pending" ? "Pending" : "On Track"}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn("text-sm", item.isPaid && "line-through text-muted-foreground")}>
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell className={cn("text-sm max-w-32 truncate", item.isPaid && "line-through text-muted-foreground")} title={item.notes}>
                        {item.notes || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {currentBudgetData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No budget items found for {formatMonthDisplay(selectedMonth)}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {currentBudgetData.map((item) => {
              const { status, color } = getVarianceStatus(item.forecast, item.actual)
              const variance = item.actual !== undefined ? item.actual - item.forecast : 0

              return (
                <Card key={item.id} className={cn("p-4", item.isPaid && "opacity-75 bg-muted/30")}>
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Checkbox
                          id={`paid-mobile-${item.id}`}
                          checked={item.isPaid || false}
                          onCheckedChange={() => handlePaymentToggle(item.id, item.isPaid || false)}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className={cn("font-medium text-sm", item.isPaid && "line-through text-muted-foreground")}>
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", item.isPaid && "line-through")}
                              style={{ 
                                borderColor: getCategoryColor(item.category),
                                color: getCategoryColor(item.category),
                                backgroundColor: `${getCategoryColor(item.category)}10`
                              }}
                            >
                              {item.category}
                            </Badge>
                            <Badge variant={color as any} className={cn("text-xs", item.isPaid && "line-through")}>
                              {status === "over" ? "Over" : 
                               status === "under" ? "Under" : 
                               status === "pending" ? "Pending" : "On Track"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Amount Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Forecast</p>
                        <p className={cn("font-medium", item.isPaid && "line-through text-muted-foreground")}>
                          {formatPKR(item.forecast)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Actual</p>
                        <p className={cn("font-medium", item.isPaid && "line-through text-muted-foreground")}>
                          {item.actual !== undefined ? formatPKR(item.actual) : "Not set"}
                        </p>
                      </div>
                    </div>

                    {/* Notes Row */}
                    {item.notes && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Notes</p>
                        <p className={cn("text-sm", item.isPaid && "line-through text-muted-foreground")}>
                          {item.notes}
                        </p>
                      </div>
                    )}

                    {/* Footer Row */}
                    <div className="flex items-center justify-center text-xs text-muted-foreground pt-2 border-t">
                      <span className={cn(item.isPaid && "line-through")}>
                        {new Date(item.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </Card>
              )
            })}
            
            {currentBudgetData.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p>No budget items found for {formatMonthDisplay(selectedMonth)}</p>
                <p className="text-sm mt-2">Tap the menu button above to add your first item</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
