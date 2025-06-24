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
import { Plus, Edit, Trash2, TrendingUp, Wallet, Target, Coins } from "lucide-react"
import { dataStore } from "@/lib/data-store"
import { formatPKR } from "@/lib/utils"
import type { SavingsAccount, Account } from "@/lib/types"

interface SavingsTracker {
  id: string
  date: string
  amount: number
  type: "deposit" | "withdrawal"
  description: string
}

interface Asset {
  id: string
  name: string
  currency: string
  amount: number
  currentRate: number // Exchange rate to PKR
  notes: string
  dateAdded: string
}

export function SavingsTab() {
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [savingsTrackers, setSavingsTrackers] = useState<SavingsTracker[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [isSavingsDialogOpen, setIsSavingsDialogOpen] = useState(false)
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false)
  const [isSavingsTrackerDialogOpen, setIsSavingsTrackerDialogOpen] = useState(false)
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false)
  const [editingSavings, setEditingSavings] = useState<SavingsAccount | null>(null)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)

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

  const [savingsTrackerFormData, setSavingsTrackerFormData] = useState({
    date: "",
    amount: "",
    type: "deposit",
    description: "",
  })

  const [assetFormData, setAssetFormData] = useState({
    name: "",
    currency: "",
    amount: "",
    currentRate: "",
    notes: "",
    dateAdded: "",
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
      await dataStore.deleteSavingsAccount(id)
      loadData()
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
      await dataStore.deleteAccount(id)
      loadData()
    }

  const resetAccountForm = () => {
    setAccountFormData({ name: "", type: "", balance: "", bank: "", lastTransaction: "" })
    setEditingAccount(null)
    setIsAccountDialogOpen(false)
  }

  const totalSavings = savingsAccounts.reduce((sum, account) => sum + account.balance, 0)
  const totalGoals = savingsAccounts.reduce((sum, account) => sum + account.goal, 0)
  const totalAccountBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
  const totalAssetsValue = assets.reduce((sum, asset) => sum + (asset.amount * asset.currentRate), 0)

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

  const handleSavingsTrackerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trackerData = {
      date: savingsTrackerFormData.date,
      amount: Number.parseFloat(savingsTrackerFormData.amount),
      type: savingsTrackerFormData.type as "deposit" | "withdrawal",
      description: savingsTrackerFormData.description,
    }

    // Here you would normally save to your data store
    // For now, we'll just add to local state
    const newTracker = {
      id: Date.now().toString(),
      ...trackerData,
    }
    setSavingsTrackers([...savingsTrackers, newTracker])

    resetSavingsTrackerForm()
  }

  const resetSavingsTrackerForm = () => {
    setSavingsTrackerFormData({ date: "", amount: "", type: "deposit", description: "" })
    setIsSavingsTrackerDialogOpen(false)
  }

  // Asset CRUD
  const handleAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const assetData = {
      name: assetFormData.name,
      currency: assetFormData.currency,
      amount: Number.parseFloat(assetFormData.amount),
      currentRate: Number.parseFloat(assetFormData.currentRate),
      notes: assetFormData.notes,
      dateAdded: assetFormData.dateAdded,
    }

    if (editingAsset) {
      const updatedAssets = assets.map(asset => 
        asset.id === editingAsset.id 
          ? { ...asset, ...assetData }
          : asset
      )
      setAssets(updatedAssets)
    } else {
      const newAsset = {
        id: Date.now().toString(),
        ...assetData,
      }
      setAssets([...assets, newAsset])
    }

    resetAssetForm()
  }

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset)
    setAssetFormData({
      name: asset.name,
      currency: asset.currency,
      amount: asset.amount.toString(),
      currentRate: asset.currentRate.toString(),
      notes: asset.notes,
      dateAdded: asset.dateAdded,
    })
    setIsAssetDialogOpen(true)
  }

  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id))
  }

  const resetAssetForm = () => {
    setAssetFormData({ name: "", currency: "", amount: "", currentRate: "", notes: "", dateAdded: "" })
    setEditingAsset(null)
    setIsAssetDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Savings Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPKR(totalSavings)}</div>
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
            <div className="text-2xl font-bold">{formatPKR(totalGoals)}</div>
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
            <div className="text-2xl font-bold">{formatPKR(totalAccountBalance)}</div>
            <p className="text-xs text-muted-foreground">Across all accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assets Value</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPKR(totalAssetsValue)}</div>
            <p className="text-xs text-muted-foreground">Foreign currencies & assets</p>
          </CardContent>
        </Card>
      </div>

      {/* Assets Tracking */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assets & Currency Tracking</CardTitle>
              <CardDescription>Track your foreign currencies and other assets</CardDescription>
            </div>
            <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingAsset ? "Edit Asset" : "Add Asset"}</DialogTitle>
                  <DialogDescription>
                    {editingAsset ? "Update your asset details" : "Add a new currency or asset to track"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAssetSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="asset-name">Asset Name</Label>
                    <Input
                      id="asset-name"
                      value={assetFormData.name}
                      onChange={(e) => setAssetFormData({ ...assetFormData, name: e.target.value })}
                      placeholder="e.g., US Dollars, Gold, etc."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="asset-currency">Currency/Unit</Label>
                      <Input
                        id="asset-currency"
                        value={assetFormData.currency}
                        onChange={(e) => setAssetFormData({ ...assetFormData, currency: e.target.value })}
                        placeholder="e.g., USD, EUR, oz"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="asset-amount">Amount</Label>
                      <Input
                        id="asset-amount"
                        type="number"
                        step="0.01"
                        value={assetFormData.amount}
                        onChange={(e) => setAssetFormData({ ...assetFormData, amount: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="asset-rate">Current Rate (to PKR)</Label>
                      <Input
                        id="asset-rate"
                        type="number"
                        step="0.01"
                        value={assetFormData.currentRate}
                        onChange={(e) => setAssetFormData({ ...assetFormData, currentRate: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="asset-date">Date Added</Label>
                      <Input
                        id="asset-date"
                        type="date"
                        value={assetFormData.dateAdded}
                        onChange={(e) => setAssetFormData({ ...assetFormData, dateAdded: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="asset-notes">Notes</Label>
                    <Input
                      id="asset-notes"
                      value={assetFormData.notes}
                      onChange={(e) => setAssetFormData({ ...assetFormData, notes: e.target.value })}
                      placeholder="Optional notes about this asset"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetAssetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingAsset ? "Update" : "Add"} Asset</Button>
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
                <TableHead>Asset Name</TableHead>
                <TableHead>Currency/Unit</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Rate (PKR)</TableHead>
                <TableHead className="text-right">Total Value (PKR)</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{asset.currency}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{asset.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{formatPKR(asset.currentRate)}</TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {formatPKR(asset.amount * asset.currentRate)}
                  </TableCell>
                  <TableCell>{new Date(asset.dateAdded).toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{asset.notes || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditAsset(asset)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteAsset(asset.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {assets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No assets tracked yet. Add your first asset above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
                      onValueChange={(value: string) => setSavingsFormData({ ...savingsFormData, type: value })}
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
                          {formatPKR(account.balance)} / {formatPKR(account.goal)}
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
                      onValueChange={(value: string) => setAccountFormData({ ...accountFormData, type: value })}
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
                    {formatPKR(Math.abs(account.balance))}
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

      {/* Current Savings Tracking */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Savings Tracking</CardTitle>
              <CardDescription>Track your deposits and withdrawals</CardDescription>
            </div>
            <Dialog open={isSavingsTrackerDialogOpen} onOpenChange={setIsSavingsTrackerDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Savings Transaction</DialogTitle>
                  <DialogDescription>Track a deposit or withdrawal to your savings</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSavingsTrackerSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="tracker-date">Date</Label>
                    <Input
                      id="tracker-date"
                      type="date"
                      value={savingsTrackerFormData.date}
                      onChange={(e) => setSavingsTrackerFormData({ ...savingsTrackerFormData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tracker-amount">Amount</Label>
                      <Input
                        id="tracker-amount"
                        type="number"
                        step="0.01"
                        value={savingsTrackerFormData.amount}
                        onChange={(e) => setSavingsTrackerFormData({ ...savingsTrackerFormData, amount: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="tracker-type">Type</Label>
                      <Select
                        value={savingsTrackerFormData.type}
                        onValueChange={(value: string) => setSavingsTrackerFormData({ ...savingsTrackerFormData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deposit">Deposit</SelectItem>
                          <SelectItem value="withdrawal">Withdrawal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="tracker-description">Description</Label>
                    <Input
                      id="tracker-description"
                      value={savingsTrackerFormData.description}
                      onChange={(e) => setSavingsTrackerFormData({ ...savingsTrackerFormData, description: e.target.value })}
                      placeholder="e.g., Monthly savings deposit"
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetSavingsTrackerForm}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Transaction</Button>
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
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savingsTrackers.map((tracker) => (
                <TableRow key={tracker.id}>
                  <TableCell>{new Date(tracker.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{tracker.description}</TableCell>
                  <TableCell>
                    <Badge variant={tracker.type === "deposit" ? "default" : "destructive"}>
                      {tracker.type}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${
                    tracker.type === "deposit" ? "text-green-600" : "text-red-600"
                  }`}>
                    {tracker.type === "deposit" ? "+" : "-"}{formatPKR(tracker.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {savingsTrackers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No savings transactions yet. Add your first transaction above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
