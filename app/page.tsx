"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardTab } from "@/components/dashboard-tab"
import { BudgetTab } from "@/components/budget-tab"
import { SavingsTab } from "@/components/savings-tab"
import { GoldZakatTab } from "@/components/gold-zakat-tab"
import { ProtectedApp } from "@/components/protected-app"
import { DataProvider } from "@/components/data-provider"
import { MonthProvider } from "@/lib/month-context"
import { Wallet, TrendingUp, PiggyBank, Coins } from "lucide-react"

export default function BudgetTracker() {
  return (
    <ProtectedApp>
      <DataProvider>
        <MonthProvider>
          <div className="p-4 pt-16">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Tracker</h1>
                <p className="text-gray-600">Manage your finances, track expenses, and monitor your financial goals</p>
              </div>

              <Tabs defaultValue="dashboard" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-fit">
                  <TabsTrigger value="dashboard" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="budget" className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <span className="hidden sm:inline">Budget</span>
                  </TabsTrigger>
                  <TabsTrigger value="savings" className="flex items-center gap-2">
                    <PiggyBank className="h-4 w-4" />
                    <span className="hidden sm:inline">Savings</span>
                  </TabsTrigger>
                  <TabsTrigger value="gold-zakat" className="flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    <span className="hidden sm:inline">Gold & Zakat</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                  <DashboardTab />
                </TabsContent>

                <TabsContent value="budget">
                  <BudgetTab />
                </TabsContent>

                <TabsContent value="savings">
                  <SavingsTab />
                </TabsContent>

                <TabsContent value="gold-zakat">
                  <GoldZakatTab />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </MonthProvider>
      </DataProvider>
    </ProtectedApp>
  )
}
