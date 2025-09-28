'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
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
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Plus,
  Edit,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { MonthSelector } from './month-selector';
import { dataStore } from '@/lib/data-store';
import { formatPKR } from '@/lib/utils';
import { useMonth } from '@/lib/month-context';
import { useAvailableMonths } from '@/lib/use-available-months';
import type {
  ExpenseData,
  Category,
  Account,
  MonthlyIncome,
  SavingsAccount,
  BudgetItem,
} from '@/lib/types';

export function DashboardTab() {
  const { selectedMonth } = useMonth();
  const { refreshMonths, formatMonthDisplay } = useAvailableMonths();

  const [budgetData, setBudgetData] = useState<BudgetItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [monthlyIncomes, setMonthlyIncomes] = useState<MonthlyIncome[]>([]);
  const [isAmountsHidden, setIsAmountsHidden] = useState(true);
  console.log('account', accounts);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setBudgetData(dataStore.getBudgetData());
      setCategories(dataStore.getCategories());
      setAccounts(dataStore.getAccounts());
      setSavingsAccounts(dataStore.getSavingsAccounts());
      setMonthlyIncomes(dataStore.getMonthlyIncomes());

      refreshMonths();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getMonthlyExpenseData = (month: string) => {
    const monthData = budgetData.filter((item) => item.date.startsWith(month));
    const grouped = monthData.reduce((acc, item) => {
      // Only include items with actual values
      if (item.actual !== undefined) {
        const existing = acc.find((g) => g.category === item.category);
        if (existing) {
          existing.amount += item.actual;
        } else {
          acc.push({ category: item.category, amount: item.actual });
        }
      }
      return acc;
    }, [] as { category: string; amount: number }[]);
    return grouped;
  };

  const currentExpenseData = getMonthlyExpenseData(selectedMonth);

  // Generate monthly expense history from January to current month
  const getMonthlyExpenseHistory = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-based
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const history = [];
    for (let i = 0; i <= currentMonth; i++) {
      const monthStr = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
      const monthExpenses = getMonthlyExpenseData(monthStr).reduce(
        (sum: number, item: { amount: number }) => sum + item.amount,
        0
      );
      history.push({
        month: months[i],
        amount: monthExpenses
      });
    }
    return history;
  };

  const monthlyExpenseHistory = getMonthlyExpenseHistory();

  const categoryColors = categories.reduce((acc, cat) => {
    acc[cat.name] = cat.color;
    return acc;
  }, {} as Record<string, string>);

  const expenseCategories = categories.filter((cat) => cat.type === 'expense');

  // Calculate total balance from all accounts
  const totalAccountBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  );
  const totalSavingsBalance = savingsAccounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  );
  const totalBalance = totalAccountBalance + totalSavingsBalance;

  // Get selected month's income (using the unified selectedMonth)
  const selectedMonthIncome = monthlyIncomes
    .filter((income) => income.month === selectedMonth)
    .reduce((sum, income) => sum + income.amount, 0);

  // Get selected month's expenses (using the unified selectedMonth)
  const selectedMonthExpenses = getMonthlyExpenseData(selectedMonth).reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  // Calculate expense percentage change from previous month
  const calculateExpenseChange = () => {
    const currentDate = new Date(selectedMonth + '-01');
    const previousMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );
    const previousMonthStr = previousMonth.toISOString().substring(0, 7);

    const currentExpenses = selectedMonthExpenses;
    const previousExpenses = getMonthlyExpenseData(previousMonthStr).reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    if (previousExpenses === 0)
      return { percentage: 0, direction: 'same' as const };

    const change =
      ((currentExpenses - previousExpenses) / previousExpenses) * 100;
    const direction =
      change > 0
        ? ('up' as const)
        : change < 0
          ? ('down' as const)
          : ('same' as const);

    return { percentage: Math.abs(change), direction };
  };

  const expenseChange = calculateExpenseChange();

  return (
    <div className="space-y-6">
      {/* Dashboard Header with Month Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Overview for {formatMonthDisplay(selectedMonth)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAmountsHidden(!isAmountsHidden)}
            className="h-8 w-8 p-0"
          >
            {isAmountsHidden ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
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
            <div className="text-2xl font-bold">
              {isAmountsHidden ? '••••••' : formatPKR(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              From accounts & savings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                Monthly Income
              </CardTitle>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isAmountsHidden ? '••••••' : formatPKR(selectedMonthIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              For {formatMonthDisplay(selectedMonth)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Expenses
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isAmountsHidden ? '••••••' : formatPKR(selectedMonthExpenses)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              {expenseChange.direction === 'up' && (
                <TrendingUp className="inline h-3 w-3 mr-1 text-red-500" />
              )}
              {expenseChange.direction === 'down' && (
                <TrendingDown className="inline h-3 w-3 mr-1 text-green-500" />
              )}
              {expenseChange.percentage > 0
                ? `${expenseChange.direction === 'up' ? '+' : '-'
                }${expenseChange.percentage.toFixed(1)}% from last month`
                : 'No change from last month'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Fixed sizing and responsive */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Expenses by Category */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Monthly Expenses by Category</CardTitle>
            <CardDescription>
              Breakdown of your spending for {formatMonthDisplay(selectedMonth)}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <ChartContainer
              config={{
                amount: {
                  label: 'Amount',
                  color: 'hsl(var(--chart-1))',
                },
              }}
              className="h-[250px] w-full overflow-hidden"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={currentExpenseData}
                  margin={{ top: 5, right: 10, left: 5, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                    interval={0}
                  />
                  <YAxis fontSize={10} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="amount">
                    {currentExpenseData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          categoryColors[entry.category] ||
                          `hsl(${(index * 137.5) % 360}, 70%, 50%)`
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Distribution Pie Chart */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
            <CardDescription>
              Category breakdown for {formatMonthDisplay(selectedMonth)}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <ChartContainer
              config={{
                amount: {
                  label: 'Amount',
                  color: 'hsl(var(--chart-1))',
                },
              }}
              className="h-[250px] w-full overflow-hidden"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <Pie
                    data={currentExpenseData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="amount"
                    nameKey="category"
                    labelLine={false}
                    fontSize={8}
                  >
                    {currentExpenseData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={categoryColors[entry.category] || '#8884d8'}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend fontSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Expense History - Full width */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Monthly Expense History</CardTitle>
          <CardDescription>Your total expenses from January to current month</CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <ChartContainer
            config={{
              amount: {
                label: 'Total Expenses',
                color: 'hsl(var(--chart-3))',
              },
            }}
            className="h-[250px] w-full overflow-hidden"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyExpenseHistory}
                margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={10} />
                <YAxis fontSize={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="amount"
                  fill="hsl(var(--chart-3))"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
