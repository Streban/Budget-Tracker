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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, Edit, Trash2, TrendingUp, Coins, Calculator, DollarSign } from "lucide-react"
import { dataStore } from "@/lib/data-store"
import { formatPKR } from "@/lib/utils"
import type { GoldInvestment, ZakatRecord } from "@/lib/types"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

export function GoldZakatTab() {
  const { toast } = useToast()
  const [goldInvestments, setGoldInvestments] = useState<GoldInvestment[]>([])
  const [zakatRecords, setZakatRecords] = useState<ZakatRecord[]>([])
  const [savingsAccounts, setSavingsAccounts] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [isGoldDialogOpen, setIsGoldDialogOpen] = useState(false)
  const [isZakatDialogOpen, setIsZakatDialogOpen] = useState(false)
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false)
  const [isNisaabDialogOpen, setIsNisaabDialogOpen] = useState(false)
  const [editingGold, setEditingGold] = useState<GoldInvestment | null>(null)
  const [editingZakat, setEditingZakat] = useState<ZakatRecord | null>(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  const [isPhotoEnabled, setIsPhotoEnabled] = useState(false)
  const [previewImage, setPreviewImage] = useState<string>("")
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false)

  // Gold prices state
  const [goldPrices, setGoldPrices] = useState({
    gold22k: 0,
    gold21k: 0,
    gold24k: 0,
    lastYearAccountBalance: 0,
    nisaabThreshold: 150000
  })

  const [goldFormData, setGoldFormData] = useState({
    name: "",
    type: "",
    weight: "",
    purity: "",
    purchaseDate: "",
    imageDataUrl: "",
  })

  const [zakatFormData, setZakatFormData] = useState({
    name: "",
    year: "",
    totalWealth: "",
    zakatDue: "",
    zakatPaid: "",
    paymentDate: "",
    status: "Pending",
  })

  useEffect(() => {
    loadData()
    loadGoldPrices()
  }, [])

  const loadData = () => {
    setGoldInvestments(dataStore.getGoldInvestments())
    setZakatRecords(dataStore.getZakatRecords())
    setSavingsAccounts(dataStore.getSavingsAccounts())
    setAccounts(dataStore.getAccounts())
    setAssets(dataStore.getAssets())
  }

  const loadGoldPrices = () => {
    const prices = dataStore.getGoldPrices()
    if (prices) {
      setGoldPrices({
        gold22k: prices.gold22k || 0,
        gold21k: prices.gold21k || 0,
        gold24k: prices.gold24k || 0,
        lastYearAccountBalance: prices.lastYearAccountBalance || 0,
        nisaabThreshold: prices.nisaabThreshold || 150000
      })
    }
  }

  const saveGoldPrices = async () => {
    await dataStore.setGoldPrices(goldPrices)
    setIsPriceDialogOpen(false)
    setIsNisaabDialogOpen(false)
    loadData() // Reload to recalculate values
  }

  // Calculate gold value based on weight, purity and current gold prices
  const calculateGoldValue = (weight: number, purity: string) => {
    const pricePerGram = purity === "24K" ? goldPrices.gold24k :
      purity === "22K" ? goldPrices.gold22k :
        purity === "21K" ? goldPrices.gold21k :
          purity === "18K" ? goldPrices.gold24k * 0.75 :
            purity === "14K" ? goldPrices.gold24k * 0.583 :
              purity === "10K" ? goldPrices.gold24k * 0.417 :
                goldPrices.gold22k; // default to 22k

    return weight * pricePerGram
  }

  const handlePhotoFileChange = async (file: File | null) => {
    if (!file) return
    const maxBytes = 2 * 1024 * 1024 // 2MB
    if (file.size > maxBytes) {
      toast({ title: "Image too large", description: "Please upload an image smaller than 2MB." })
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setGoldFormData(prev => ({ ...prev, imageDataUrl: result }))
    }
    reader.readAsDataURL(file)
  }

  // Gold Investment CRUD
  const handleGoldSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const goldData = {
      name: goldFormData.name,
      type: goldFormData.type,
      weight: Number.parseFloat(goldFormData.weight),
      purity: goldFormData.purity,
      purchaseDate: goldFormData.purchaseDate,
      imageDataUrl: isPhotoEnabled ? goldFormData.imageDataUrl || "" : "",
    }

    if (editingGold) {
      await dataStore.updateGoldInvestment(editingGold.id, goldData)
    } else {
      await dataStore.addGoldInvestment(goldData)
    }

    resetGoldForm()
    loadData()
  }

  const handleEditGold = (investment: GoldInvestment) => {
    setEditingGold(investment)
    setGoldFormData({
      name: investment.name,
      type: investment.type,
      weight: investment.weight.toString(),
      purity: investment.purity,
      purchaseDate: investment.purchaseDate,
      imageDataUrl: investment.imageDataUrl || "",
    })
    setIsPhotoEnabled(!!investment.imageDataUrl)
    setIsGoldDialogOpen(true)
  }

  const handleDeleteGold = async (id: string) => {
    await dataStore.deleteGoldInvestment(id)
    loadData()
  }

  const resetGoldForm = () => {
    setGoldFormData({
      name: "",
      type: "",
      weight: "",
      purity: "",
      purchaseDate: "",
      imageDataUrl: "",
    })
    setIsPhotoEnabled(false)
    setEditingGold(null)
    setIsGoldDialogOpen(false)
  }

  // Zakat Record CRUD
  const handleZakatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const zakatData = {
      name: zakatFormData.name,
      year: zakatFormData.year,
      totalWealth: Number.parseFloat(zakatFormData.totalWealth),
      zakatDue: Number.parseFloat(zakatFormData.zakatDue),
      zakatPaid: Number.parseFloat(zakatFormData.zakatPaid),
      paymentDate: zakatFormData.paymentDate,
      status: zakatFormData.status,
    }

    if (editingZakat) {
      await dataStore.updateZakatRecord(editingZakat.id, zakatData)
    } else {
      await dataStore.addZakatRecord(zakatData)
    }

    resetZakatForm()
    loadData()
  }

  const handleEditZakat = (record: ZakatRecord) => {
    setEditingZakat(record)
    setZakatFormData({
      name: record.name || "",
      year: record.year,
      totalWealth: record.totalWealth.toString(),
      zakatDue: record.zakatDue.toString(),
      zakatPaid: record.zakatPaid.toString(),
      paymentDate: record.paymentDate,
      status: record.status,
    })
    setIsZakatDialogOpen(true)
  }

  const handleDeleteZakat = async (id: string) => {
    await dataStore.deleteZakatRecord(id)
    loadData()
  }

  const resetZakatForm = () => {
    setZakatFormData({ name: "", year: "", totalWealth: "", zakatDue: "", zakatPaid: "", paymentDate: "", status: "Pending" })
    setEditingZakat(null)
    setIsZakatDialogOpen(false)
  }

  const totalGoldWeight = goldInvestments.reduce((sum, item) => sum + item.weight, 0)
  const totalGoldValue = goldInvestments.reduce((sum, item) => sum + calculateGoldValue(item.weight, item.purity), 0)
  // Calculate zakat eligible gold value using 90% of total gold weight
  const zakatEligibleGoldValue = goldInvestments.reduce((sum, item) => sum + calculateGoldValue(item.weight * 0.9, item.purity), 0)

  // Calculate total savings like in Savings Tab: account balance + assets value
  const totalAccountBalance = accounts.reduce((sum: number, account: any) => sum + account.balance, 0)
  const totalAssetsValue = assets.reduce((sum: number, asset: any) => sum + (asset.amount * asset.currentRate), 0)

  const nisabThreshold = goldPrices.nisaabThreshold

  // Calculate zakat eligible savings: minimum of current account balance and last year balance
  const minSavingsForZakat = Math.min(totalAccountBalance, goldPrices.lastYearAccountBalance)
  const zakatEligibleSavings = minSavingsForZakat >= nisabThreshold ? minSavingsForZakat : 0

  // Calculate zakat eligible assets: assets value above nisab threshold
  const zakatEligibleAssets = totalAssetsValue >= nisabThreshold ? totalAssetsValue : 0

  const zakatEligibleCategories = [
    { category: "Gold & Silver", amount: zakatEligibleGoldValue },
    { category: "Savings (Account Balance)", amount: zakatEligibleSavings },
    { category: "Assets", amount: zakatEligibleAssets },
  ]

  const totalZakatableWealth = zakatEligibleCategories.reduce((sum, asset) => sum + asset.amount, 0)
  const currentYearZakat = totalZakatableWealth * 0.025 // 2.5%

  const goldTypes = ["Gold Coins", "Gold Jewelry", "Gold Bars", "Gold ETF", "Gold Mining Stocks"]
  const purityOptions = ["24K", "22K", "21K", "18K", "14K", "10K"]
  const statusOptions = ["Pending", "Paid", "Overdue"]

  // Get unique years from zakat records for filter, including current year
  const currentYear = new Date().getFullYear()
  const zakatYears = Array.from(new Set([
    currentYear.toString(),
    ...zakatRecords.map(record => record.year)
  ])).sort((a, b) => parseInt(b) - parseInt(a))

  // Filter zakat records by selected year
  const filteredZakatRecords = zakatRecords.filter(record =>
    selectedYear === "all" || record.year === selectedYear
  )

  return (
    <div className="space-y-6">
      {/* Gold & Zakat Overview */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gold Weight</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGoldWeight}g</div>
            <p className="text-xs text-muted-foreground">Across {goldInvestments.length} investments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gold Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPKR(totalGoldValue)}</div>
            <p className="text-xs text-muted-foreground">
              Based on current gold prices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zakatable Wealth</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPKR(totalZakatableWealth)}</div>
            <p className="text-xs text-muted-foreground">Above nisab threshold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zakat Due</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPKR(currentYearZakat)}</div>
            <p className="text-xs text-muted-foreground">2.5% of zakatable wealth</p>
          </CardContent>
        </Card>
      </div>

      {/* Gold Prices Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Current Gold Prices</CardTitle>
              <CardDescription>Set current market prices for gold calculations</CardDescription>
            </div>
            <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Update Prices
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Update Gold Prices</DialogTitle>
                  <DialogDescription>
                    Set current market prices per gram for different gold purities
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="gold-24k-price">24K Gold Price (per gram)</Label>
                    <Input
                      id="gold-24k-price"
                      type="number"
                      step="0.01"
                      value={goldPrices.gold24k}
                      onChange={(e) => setGoldPrices({ ...goldPrices, gold24k: Number.parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gold-22k-price">22K Gold Price (per gram)</Label>
                    <Input
                      id="gold-22k-price"
                      type="number"
                      step="0.01"
                      value={goldPrices.gold22k}
                      onChange={(e) => setGoldPrices({ ...goldPrices, gold22k: Number.parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gold-21k-price">21K Gold Price (per gram)</Label>
                    <Input
                      id="gold-21k-price"
                      type="number"
                      step="0.01"
                      value={goldPrices.gold21k}
                      onChange={(e) => setGoldPrices({ ...goldPrices, gold21k: Number.parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last-year-account-balance">Last Year Account Balance</Label>
                    <Input
                      id="last-year-account-balance"
                      type="number"
                      step="0.01"
                      value={goldPrices.lastYearAccountBalance}
                      onChange={(e) => setGoldPrices({ ...goldPrices, lastYearAccountBalance: Number.parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsPriceDialogOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button onClick={saveGoldPrices} className="w-full sm:w-auto">Save Prices</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">24K Gold</span>
              <span className="text-lg font-bold">{formatPKR(goldPrices.gold24k)}/gram</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">22K Gold</span>
              <span className="text-lg font-bold">{formatPKR(goldPrices.gold22k)}/gram</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">21K Gold</span>
              <span className="text-lg font-bold">{formatPKR(goldPrices.gold21k)}/gram</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg lg:col-span-3">
              <span className="font-medium">Last Year Account Balance</span>
              <span className="text-lg font-bold">{formatPKR(goldPrices.lastYearAccountBalance)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gold Investments */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Gold Investments</CardTitle>
              <CardDescription>Track your gold holdings and their current value</CardDescription>
            </div>
            <Dialog open={isGoldDialogOpen} onOpenChange={setIsGoldDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Gold Investment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingGold ? "Edit Gold Investment" : "Add Gold Investment"}</DialogTitle>
                  <DialogDescription>
                    {editingGold ? "Update your gold investment details" : "Add a new gold investment to track"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleGoldSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="gold-name">Investment Name</Label>
                    <Input
                      id="gold-name"
                      value={goldFormData.name}
                      onChange={(e) => setGoldFormData({ ...goldFormData, name: e.target.value })}
                      placeholder="e.g., Wedding Ring"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gold-type">Type</Label>
                    <Select
                      value={goldFormData.type}
                      onValueChange={(value: string) => setGoldFormData({ ...goldFormData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gold type" />
                      </SelectTrigger>
                      <SelectContent>
                        {goldTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gold-weight">Weight (grams)</Label>
                      <Input
                        id="gold-weight"
                        type="number"
                        step="0.01"
                        value={goldFormData.weight}
                        onChange={(e) => setGoldFormData({ ...goldFormData, weight: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="gold-purity">Purity</Label>
                      <Select
                        value={goldFormData.purity}
                        onValueChange={(value: string) => setGoldFormData({ ...goldFormData, purity: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select purity" />
                        </SelectTrigger>
                        <SelectContent>
                          {purityOptions.map((purity) => (
                            <SelectItem key={purity} value={purity}>
                              {purity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="gold-purchase-date">Purchase Date</Label>
                    <Input
                      id="gold-purchase-date"
                      type="date"
                      value={goldFormData.purchaseDate}
                      onChange={(e) => setGoldFormData({ ...goldFormData, purchaseDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="gold-photo-toggle">Attach a photo?</Label>
                      <Switch id="gold-photo-toggle" checked={isPhotoEnabled} onCheckedChange={setIsPhotoEnabled} />
                    </div>
                    {isPhotoEnabled && (
                      <div className="space-y-2">
                        <Input
                          id="gold-photo"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoFileChange(e.target.files?.[0] || null)}
                        />
                        {goldFormData.imageDataUrl && (
                          <div className="relative w-40 h-40">
                            <Image
                              src={goldFormData.imageDataUrl}
                              alt="Preview"
                              fill
                              className="object-cover rounded-md border"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button type="button" variant="outline" onClick={resetGoldForm} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button type="submit" className="w-full sm:w-auto">{editingGold ? "Update" : "Add"} Investment</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Name</TableHead>
                  <TableHead className="min-w-[100px]">Type</TableHead>
                  <TableHead className="min-w-[80px]">Weight (g)</TableHead>
                  <TableHead className="min-w-[80px]">Purity</TableHead>
                  <TableHead className="text-right min-w-[120px]">Current Value</TableHead>
                  <TableHead className="min-w-[120px]">Purchase Date</TableHead>
                  <TableHead className="min-w-[80px]">Photo</TableHead>
                  <TableHead className="min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goldInvestments.map((investment) => {
                  const currentValue = calculateGoldValue(investment.weight, investment.purity)

                  return (
                    <TableRow key={investment.id}>
                      <TableCell className="font-medium">{investment.name}</TableCell>
                      <TableCell className="font-medium">{investment.type}</TableCell>
                      <TableCell>{investment.weight}g</TableCell>
                      <TableCell>
                        <Badge variant="outline">{investment.purity}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatPKR(currentValue)}</TableCell>
                      <TableCell>{new Date(investment.purchaseDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {investment.imageDataUrl ? (
                          <Dialog open={isPhotoDialogOpen && previewImage === investment.imageDataUrl} onOpenChange={(open) => {
                            setIsPhotoDialogOpen(open)
                            if (!open) setPreviewImage("")
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="secondary" size="sm" onClick={() => { setPreviewImage(investment.imageDataUrl!); setIsPhotoDialogOpen(true) }}>
                                View Photo
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[520px]">
                              <div className="relative w-full h-96">
                                <Image src={investment.imageDataUrl} alt={investment.name} fill className="object-contain" />
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="text-xs text-muted-foreground">No photo</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditGold(investment)} className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteGold(investment.id)} className="h-8 w-8 p-0">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Zakat Calculation */}
      <Card>
        <CardHeader>
          <CardTitle>Zakat Calculation</CardTitle>
          <CardDescription>Current year zakatable assets breakdown (click on any category to see zakat amount)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {zakatEligibleCategories.map((asset, index) => {
              const categoryZakat = asset.amount * 0.025; // 2.5% zakat for this category
              return (
                <Popover key={index}>
                  <PopoverTrigger asChild>
                    <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <span className="font-medium">{asset.category}</span>
                      <span className="text-lg font-bold">{formatPKR(asset.amount)}</span>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">{asset.category}</h4>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Total Amount:</span>
                          <span className="font-medium">{formatPKR(asset.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Zakat Rate:</span>
                          <span className="font-medium">2.5%</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="font-medium">Zakat Due:</span>
                          <span className="font-bold text-green-600">{formatPKR(categoryZakat)}</span>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              );
            })}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total Zakatable Wealth</span>
                <span>{formatPKR(totalZakatableWealth)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                <span>Nisab Threshold</span>
                <div className="flex items-center gap-2">
                  <span>{formatPKR(nisabThreshold)}</span>
                  <Dialog open={isNisaabDialogOpen} onOpenChange={setIsNisaabDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Update Nisaab Threshold</DialogTitle>
                        <DialogDescription>
                          Set the current nisaab threshold for zakat calculation
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="nisaab-threshold">Nisaab Threshold (PKR)</Label>
                          <Input
                            id="nisaab-threshold"
                            type="number"
                            step="0.01"
                            value={goldPrices.nisaabThreshold}
                            onChange={(e) => setGoldPrices({ ...goldPrices, nisaabThreshold: Number.parseFloat(e.target.value) || 0 })}
                            placeholder="150000"
                          />
                        </div>
                      </div>
                      <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsNisaabDialogOpen(false)} className="w-full sm:w-auto">
                          Cancel
                        </Button>
                        <Button onClick={saveGoldPrices} className="w-full sm:w-auto">Save Threshold</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="flex items-center justify-between text-xl font-bold text-green-600 mt-2">
                <span>Zakat Due (2.5%)</span>
                <span>{formatPKR(currentYearZakat)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zakat Payment History */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle>Zakat Payment History</CardTitle>
              <CardDescription>Track your annual zakat payments</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Label htmlFor="year-filter" className="text-sm whitespace-nowrap">Filter by Year:</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {zakatYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isZakatDialogOpen} onOpenChange={setIsZakatDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{editingZakat ? "Edit Zakat Record" : "Record Zakat Payment"}</DialogTitle>
                    <DialogDescription>
                      {editingZakat ? "Update your zakat payment record" : "Add a new zakat payment record"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleZakatSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="zakat-name">Payment Name/Description</Label>
                      <Input
                        id="zakat-name"
                        value={zakatFormData.name}
                        onChange={(e) => setZakatFormData({ ...zakatFormData, name: e.target.value })}
                        placeholder="e.g., Annual Zakat Payment, Ramadan Zakat"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zakat-year">Year</Label>
                      <Input
                        id="zakat-year"
                        value={zakatFormData.year}
                        onChange={(e) => setZakatFormData({ ...zakatFormData, year: e.target.value })}
                        placeholder="e.g., 2024"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zakat-wealth">Total Wealth</Label>
                      <Input
                        id="zakat-wealth"
                        type="number"
                        step="0.01"
                        value={zakatFormData.totalWealth}
                        onChange={(e) => setZakatFormData({ ...zakatFormData, totalWealth: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="zakat-due">Zakat Due</Label>
                        <Input
                          id="zakat-due"
                          type="number"
                          step="0.01"
                          value={zakatFormData.zakatDue}
                          onChange={(e) => setZakatFormData({ ...zakatFormData, zakatDue: e.target.value })}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="zakat-paid">Zakat Paid</Label>
                        <Input
                          id="zakat-paid"
                          type="number"
                          step="0.01"
                          value={zakatFormData.zakatPaid}
                          onChange={(e) => setZakatFormData({ ...zakatFormData, zakatPaid: e.target.value })}
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="zakat-payment-date">Payment Date</Label>
                        <Input
                          id="zakat-payment-date"
                          type="date"
                          value={zakatFormData.paymentDate}
                          onChange={(e) => setZakatFormData({ ...zakatFormData, paymentDate: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="zakat-status">Status</Label>
                        <Select
                          value={zakatFormData.status}
                          onValueChange={(value: string) => setZakatFormData({ ...zakatFormData, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                      <Button type="button" variant="outline" onClick={resetZakatForm} className="w-full sm:w-auto">
                        Cancel
                      </Button>
                      <Button type="submit" className="w-full sm:w-auto">{editingZakat ? "Update" : "Record"} Payment</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Name</TableHead>
                  <TableHead className="min-w-[80px]">Year</TableHead>
                  <TableHead className="text-right min-w-[120px]">Total Wealth</TableHead>
                  <TableHead className="text-right min-w-[120px]">Zakat Due</TableHead>
                  <TableHead className="text-right min-w-[120px]">Zakat Paid</TableHead>
                  <TableHead className="min-w-[120px]">Payment Date</TableHead>
                  <TableHead className="min-w-[80px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredZakatRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.name || "N/A"}</TableCell>
                    <TableCell className="font-medium">{record.year}</TableCell>
                    <TableCell className="text-right">{formatPKR(record.totalWealth)}</TableCell>
                    <TableCell className="text-right">{formatPKR(record.zakatDue)}</TableCell>
                    <TableCell className="text-right">{formatPKR(record.zakatPaid)}</TableCell>
                    <TableCell>{new Date(record.paymentDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          record.status === "Paid" ? "default" : record.status === "Overdue" ? "destructive" : "secondary"
                        }
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditZakat(record)} className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteZakat(record.id)} className="h-8 w-8 p-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
