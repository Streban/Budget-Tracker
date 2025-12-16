"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Plus, Wallet, Minus } from "lucide-react";
import { dataStore } from "@/lib/data-store";
import { formatRiyal } from "@/lib/utils";
import type { TripExpense, TripBudget } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export function TripExpensesTab() {
  const { toast } = useToast();
  const [tripExpenses, setTripExpenses] = useState<TripExpense[]>([]);
  const [tripBudget, setTripBudget] = useState<TripBudget | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);

  useEffect(() => {
    loadData();
    const savedDay = localStorage.getItem("trip-current-day");
    if (savedDay) {
      setCurrentDay(parseInt(savedDay, 10));
    }
  }, []);

  const loadData = async () => {
    try {
      await dataStore.initialize();
      setTripExpenses([...dataStore.getTripExpenses()]);
      setTripBudget(dataStore.getTripBudget());
    } catch (error) {
      console.error("Error loading trip data:", error);
      toast({
        title: "Error",
        description: "Failed to load trip expenses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const budget = parseFloat(budgetInput);
    if (isNaN(budget) || budget <= 0) {
      toast({
        title: "Invalid Budget",
        description: "Please enter a valid budget amount",
        variant: "destructive",
      });
      return;
    }

    const success = await dataStore.setTripBudget(budget);
    if (success) {
      setTripBudget({
        id: tripBudget?.id || Date.now().toString(),
        budget,
        lastUpdated: new Date().toISOString(),
      });
      setBudgetInput("");
      setIsBudgetDialogOpen(false);
      toast({
        title: "Budget Set",
        description: `Budget set to ${formatRiyal(budget)}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save budget",
        variant: "destructive",
      });
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid expense amount",
        variant: "destructive",
      });
      return;
    }

    if (!expenseDescription.trim()) {
      toast({
        title: "Missing Description",
        description: "Please enter a description for the expense",
        variant: "destructive",
      });
      return;
    }

    const newExpense = await dataStore.addTripExpense({
      amount,
      description: expenseDescription.trim(),
      date: new Date().toISOString(),
      day: currentDay,
    });

    if (newExpense) {
      setTripExpenses((prev) => [...prev, newExpense]);
      setExpenseAmount("");
      setExpenseDescription("");
      toast({
        title: "Expense Added",
        description: "Expense has been added successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const success = await dataStore.deleteTripExpense(id);
    if (success) {
      loadData();
      toast({
        title: "Expense Deleted",
        description: "Expense has been deleted",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    }
  };

  const handleDayChange = (delta: number) => {
    const newDay = Math.max(1, currentDay + delta);
    setCurrentDay(newDay);
    localStorage.setItem("trip-current-day", newDay.toString());
  };

  const totalExpenses = tripExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const remainingAmount = (tripBudget?.budget || 0) - totalExpenses;

  const expensesByDay = tripExpenses.reduce((acc, expense) => {
    const day = expense.day || 0;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(expense);
    return acc;
  }, {} as Record<number, typeof tripExpenses>);

  const dailyTotals = Object.entries(expensesByDay)
    .map(([day, expenses]) => ({
      day: parseInt(day, 10),
      total: expenses.reduce((sum, e) => sum + e.amount, 0),
      expenses: expenses.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    }))
    .sort((a, b) => b.day - a.day);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Trip Budget
            </div>
            {!tripBudget && (
              <Dialog
                open={isBudgetDialogOpen}
                onOpenChange={setIsBudgetDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Set Budget
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Set Trip Budget</DialogTitle>
                    <DialogDescription>
                      Enter your total budget for this trip
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSetBudget} className="space-y-4">
                    <div>
                      <Label htmlFor="budget">Budget Amount</Label>
                      <Input
                        id="budget"
                        type="number"
                        step="0.01"
                        value={budgetInput}
                        onChange={(e) => setBudgetInput(e.target.value)}
                        placeholder="Enter budget amount"
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsBudgetDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Set Budget</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tripBudget ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Expenses:
                </span>
                <span className="font-semibold">
                  {formatRiyal(totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-base font-medium">Remaining Amount:</span>
                <span
                  className={`font-bold text-xl ${
                    remainingAmount >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatRiyal(remainingAmount)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Click "Set Budget" to add your trip budget
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Add Expense
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleDayChange(-1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-sm font-medium min-w-[3rem] text-center">
                Day {currentDay}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleDayChange(1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <Label htmlFor="expense-amount">Amount</Label>
              <Input
                id="expense-amount"
                type="number"
                step="0.01"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="expense-description">Description</Label>
              <Input
                id="expense-description"
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                placeholder="Short description"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {tripExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No expenses yet. Add your first expense above.
            </div>
          ) : (
            <div className="space-y-4">
              {dailyTotals.map(({ day, total, expenses }) => (
                <div key={day} className="space-y-2">
                  <div className="flex items-center justify-between px-2 py-1.5 bg-muted/50 rounded-md">
                    <span className="text-sm font-semibold">Day {day}</span>
                    <span className="text-sm font-semibold">
                      {formatRiyal(total)}
                    </span>
                  </div>
                  <div className="space-y-2 pl-2">
                    {expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {expense.description}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <span className="font-semibold">
                            {formatRiyal(expense.amount)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
