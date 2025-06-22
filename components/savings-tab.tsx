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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Plus, Edit, Trash2, TrendingUp, Wallet, Target } from "lucide-react"
import { dataStore } from "@/lib/data-store"
import type { SavingsAccount, Account } from "@/lib/types"

export function SavingsTab() {
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isSavingsDialogOpen, setIsSavingsDialogOpen] = useState(false)
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false)
  const [editingSavings, setEditingSavings] = useState<SavingsAccount | null>(null)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)

  const [savingsFormData, setSavingsFormData] = useState({
    name: "",
    type: "",
    balance: "",
    goal: "",
    interestRate: "",
    bank: "",
  })

  const [accountFormData, setAccountFormData] = useState({
    name: "",
    type: "",
    balance: "",
    bank: "",
    lastTransaction: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setSavingsAccounts(dataStore.getSavingsAccounts())
    setAccounts(dataStore.getAccounts())
  }

  // Savings Account CRUD
  const handleSavingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const savingsData = {
      name: savingsFormData.name,
      type: savingsFormData.type,
      balance: Number.parseFloat(savingsFormData.balance),
      goal: Number.parseFloat(savingsFormData.goal),
      interestRate: Number.parseFloat(savingsFormData.interestRate),
      bank: savingsFormData.bank,
    }

    if (editingSavings) {
      await dataStore.updateSavingsAccount(editingSavings.id, savingsData)
    } else {
      await dataStore.addSavingsAccount(savingsData)
    }

    resetSavingsForm()
    loadData()
  }

  const handleEditSavings = (account: SavingsAccount) => {
    setEditingSavings(account)
    setSavingsFormData({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      goal: account.goal.toString(),
      interestRate: account.interestRate.toString(),
      bank: account.bank,
    })
    setIsSavingsDialogOpen(true)
  }

  const handleDeleteSavings = async (id: string) => {
    if (confirm("Are you sure you want to delete this savings account?")) {
      await dataStore.deleteSavingsAccount(id)
      loadData()
    }
  }

  const resetSavingsForm = () => {
    setSavingsFormData({ name: "", type: "", balance: "", goal: "", interestRate: "", bank: "" })
    setEditingSavings(null)
    setIsSavingsDialogOpen(false)
  }

  // Account CRUD
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const accountData = {
      name: accountFormData.name,
      type: accountFormData.type,
      balance: Number.parseFloat(accountFormData.balance),
      bank: accountFormData.bank,
      lastTransaction: accountFormData.lastTransaction,
    }

    if (editingAccount) {
      await dataStore.updateAccount(editingAccount.id, accountData)
    } else {
      await dataStore.addAccount(accountData)
    }

    resetAccountForm()
    loadData()
  }

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account)
    setAccountFormData({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      bank: account.bank,
      lastTransaction: account.lastTransaction,
    })
    setIsAccountDialogOpen(true)
  }

  const handleDeleteAccount = async (id: string) => {
    if (confirm("Are you sure you want to delete this account?")) {
      await dataStore.deleteAccount(id)
      loadData()
    }
  }

  const resetAccountForm = () => {
    setAccountFormData({ name: "", type: "", balance: "", bank: "", lastTransaction: "" })
    setEditingAccount(null)
    setIsAccountDialogOpen(false)
  }

  const totalSavings = savingsAccounts.reduce((sum, account) => sum + account.balance, 0)
  const totalGoals = savingsAccounts.reduce((sum, account) => sum + account.goal, 0)
  const totalAccountBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  const accountTypes = [
    "Checking",
    "Savings",
    "Business Checking",
    "Money Market",
    "CD",
    "Investment",
    "Credit",
    "Brokerage",
  ]
  const savingsTypes = ["High Yield Savings", "Savings Account", "Money Market", "CD", "Investment Account"]

  return (
    <div className="space-y-6">
      {/* Savings Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalGoals.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalGoals > 0 ? ((totalSavings / totalGoals) * 100).toFixed(1) : 0}% of total goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAccountBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Savings Goals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Savings Goals</CardTitle>
              <CardDescription>Track your progress towards financial goals</CardDescription>
            </div>
            <Dialog open={isSavingsDialogOpen} onOpenChange={setIsSavingsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSavings ? "Edit Savings Goal" : "Add Savings Goal"}</DialogTitle>
                  <DialogDescription>
                    {editingSavings ? "Update your savings goal details" : "Create a new savings goal to track"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSavingsSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="savings-name">Goal Name</Label>
                    <Input
                      id="savings-name"
                      value={savingsFormData.name}
                      onChange={(e) => setSavingsFormData({ ...savingsFormData, name: e.target.value })}
                      placeholder="e.g., Emergency Fund"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="savings-type">Account Type</Label>
                    <Select
                      value={savingsFormData.type}
                      onValueChange={(value) => setSavingsFormData({ ...savingsFormData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        {savingsTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="savings-balance">Current Balance</Label>
                      <Input
                        id="savings-balance"
                        type="number"
                        step="0.01"
                        value={savingsFormData.balance}
                        onChange={(e) => setSavingsFormData({ ...savingsFormData, balance: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="savings-goal">Goal Amount</Label>
                      <Input
                        id="savings-goal"
                        type="number"
                        step="0.01"
                        value={savingsFormData.goal}
                        onChange={(e) => setSavingsFormData({ ...savingsFormData, goal: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="savings-rate">Interest Rate (%)</Label>
                      <Input
                        id="savings-rate"
                        type="number"
                        step="0.01"
                        value={savingsFormData.interestRate}
                        onChange={(e) => setSavingsFormData({ ...savingsFormData, interestRate: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="savings-bank">Bank</Label>
                      <Input
                        id="savings-bank"
                        value={savingsFormData.bank}
                        onChange={(e) => setSavingsFormData({ ...savingsFormData, bank: e.target.value })}
                        placeholder="Bank name"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetSavingsForm}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingSavings ? "Update" : "Add"} Goal</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {savingsAccounts.map((account) => {
              const progress = account.goal > 0 ? (account.balance / account.goal) * 100 : 0
              return (
                <div key={account.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{account.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {account.type} • {account.bank} • {account.interestRate}% APY
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-medium">
                          ${account.balance.toLocaleString()} / ${account.goal.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">{progress.toFixed(1)}% complete</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditSavings(account)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSavings(account.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Overview of all your financial accounts</CardDescription>
            </div>
            <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingAccount ? "Edit Account" : "Add Account"}</DialogTitle>
                  <DialogDescription>
                    {editingAccount ? "Update your account details" : "Add a new financial account to track"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAccountSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="account-name">Account Name</Label>
                    <Input
                      id="account-name"
                      value={accountFormData.name}
                      onChange={(e) => setAccountFormData({ ...accountFormData, name: e.target.value })}
                      placeholder="e.g., Primary Checking"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="account-type">Account Type</Label>
                    <Select
                      value={accountFormData.type}
                      onValueChange={(value) => setAccountFormData({ ...accountFormData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="account-balance">Balance</Label>
                      <Input
                        id="account-balance"
                        type="number"
                        step="0.01"
                        value={accountFormData.balance}
                        onChange={(e) => setAccountFormData({ ...accountFormData, balance: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="account-bank">Bank</Label>
                      <Input
                        id="account-bank"
                        value={accountFormData.bank}
                        onChange={(e) => setAccountFormData({ ...accountFormData, bank: e.target.value })}
                        placeholder="Bank name"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="account-transaction">Last Transaction Date</Label>
                    <Input
                      id="account-transaction"
                      type="date"
                      value={accountFormData.lastTransaction}
                      onChange={(e) => setAccountFormData({ ...accountFormData, lastTransaction: e.target.value })}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetAccountForm}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingAccount ? "Update" : "Add"} Account</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Last Transaction</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>
                    <Badge variant={account.type === "Credit" ? "destructive" : "outline"}>{account.type}</Badge>
                  </TableCell>
                  <TableCell>{account.bank}</TableCell>
                  <TableCell
                    className={`text-right font-medium ${account.balance < 0 ? "text-red-600" : "text-green-600"}`}
                  >
                    ${Math.abs(account.balance).toLocaleString()}
                  </TableCell>
                  <TableCell>{new Date(account.lastTransaction).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditAccount(account)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteAccount(account.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
