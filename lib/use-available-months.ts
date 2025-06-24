import { useState, useEffect } from 'react'
import { dataStore } from './data-store'
import { getCurrentMonth } from './utils'

export function useAvailableMonths() {
  const [availableMonths, setAvailableMonths] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAvailableMonths = () => {
      try {
        setLoading(true)
        
        // Get all data sources
        const budgetData = dataStore.getBudgetData()
        const expenseData = dataStore.getExpenseData()
        const monthlyIncomes = dataStore.getMonthlyIncomes()
        
        // Extract months from all data sources
        const budgetMonths = budgetData.map(item => item.date.substring(0, 7))
        const expenseMonths = expenseData.map(item => item.month)
        const incomeMonths = monthlyIncomes.map(item => item.month)
        
        // Combine all months and ensure current month is included
        const currentMonth = getCurrentMonth()
        const allMonths = [
          currentMonth,
          ...budgetMonths,
          ...expenseMonths,
          ...incomeMonths
        ]
        
        // Remove duplicates, filter out empty strings, and sort
        const uniqueMonths = Array.from(new Set(allMonths))
          .filter(month => month && month.trim() !== '')
          .sort()
          .reverse() // Most recent first
        
        setAvailableMonths(uniqueMonths)
      } catch (error) {
        console.error('Error loading available months:', error)
        // Fallback to current month if there's an error
        setAvailableMonths([getCurrentMonth()])
      } finally {
        setLoading(false)
      }
    }

    // Load immediately
    loadAvailableMonths()

    // Set up interval to refresh every 30 seconds to catch new data
    const interval = setInterval(loadAvailableMonths, 30000)

    return () => clearInterval(interval)
  }, [])

  const formatMonthDisplay = (monthStr: string) => {
    const date = new Date(monthStr + "-01")
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

  return {
    availableMonths,
    loading,
    formatMonthDisplay,
    refreshMonths: () => {
      const loadAvailableMonths = () => {
        try {
          setLoading(true)
          
          const budgetData = dataStore.getBudgetData()
          const expenseData = dataStore.getExpenseData()
          const monthlyIncomes = dataStore.getMonthlyIncomes()
          
          const budgetMonths = budgetData.map(item => item.date.substring(0, 7))
          const expenseMonths = expenseData.map(item => item.month)
          const incomeMonths = monthlyIncomes.map(item => item.month)
          
          const currentMonth = getCurrentMonth()
          const allMonths = [
            currentMonth,
            ...budgetMonths,
            ...expenseMonths,
            ...incomeMonths
          ]
          
          const uniqueMonths = Array.from(new Set(allMonths))
            .filter(month => month && month.trim() !== '')
            .sort()
            .reverse()
          
          setAvailableMonths(uniqueMonths)
        } catch (error) {
          console.error('Error loading available months:', error)
          setAvailableMonths([getCurrentMonth()])
        } finally {
          setLoading(false)
        }
      }
      loadAvailableMonths()
    }
  }
} 