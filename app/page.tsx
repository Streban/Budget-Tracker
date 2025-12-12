"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardTab } from "@/components/dashboard-tab";
import { BudgetTab } from "@/components/budget-tab";
import { SavingsTab } from "@/components/savings-tab";
import { GoldZakatTab } from "@/components/gold-zakat-tab";
import { TripExpensesTab } from "@/components/trip-expenses-tab";
import { ProtectedApp } from "@/components/protected-app";
import { DataProvider } from "@/components/data-provider";
import { MonthProvider } from "@/lib/month-context";
import { Wallet, TrendingUp, PiggyBank, Coins } from "lucide-react";

export default function BudgetTracker() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <ProtectedApp>
      <DataProvider>
        <MonthProvider>
          <div className="p-4 pt-16">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Budget Tracker
                </h1>
                <p className="text-muted-foreground">
                  Manage your finances, track expenses, and monitor your
                  financial goals
                </p>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
                <div className="flex justify-start w-full overflow-x-auto pb-2 -mb-2">
                  <TabsList className="inline-flex h-11 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-auto min-w-full sm:min-w-0">
                    <TabsTrigger
                      value="dashboard"
                      className="flex items-center justify-center gap-2 px-4 py-2 min-w-[80px] sm:min-w-[120px]"
                    >
                      <TrendingUp className="h-4 w-4 shrink-0" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="budget"
                      className="flex items-center justify-center gap-2 px-4 py-2 min-w-[80px] sm:min-w-[100px]"
                    >
                      <Wallet className="h-4 w-4 shrink-0" />
                      <span className="hidden sm:inline">Budget</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="savings"
                      className="flex items-center justify-center gap-2 px-4 py-2 min-w-[80px] sm:min-w-[100px]"
                    >
                      <PiggyBank className="h-4 w-4 shrink-0" />
                      <span className="hidden sm:inline">Savings</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="gold-zakat"
                      className="flex items-center justify-center gap-2 px-4 py-2 min-w-[80px] sm:min-w-[140px]"
                    >
                      <Coins className="h-4 w-4 shrink-0" />
                      <span className="hidden sm:inline">Gold & Zakat</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="dashboard">
                  <DashboardTab
                    onNavigateToTrip={() => setActiveTab("trip-expenses")}
                  />
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

                <TabsContent value="trip-expenses">
                  <TripExpensesTab />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </MonthProvider>
      </DataProvider>
    </ProtectedApp>
  );
}
