"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentMonth } from './utils'

interface MonthContextType {
  selectedMonth: string
  setSelectedMonth: (month: string) => void
}

const MonthContext = createContext<MonthContextType | undefined>(undefined)

export function MonthProvider({ children }: { children: React.ReactNode }) {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())

  // Persist to localStorage
  useEffect(() => {
    const savedMonth = localStorage.getItem('budget-tracker-selected-month')
    
    if (savedMonth) setSelectedMonth(savedMonth)
  }, [])

  const handleSetSelectedMonth = (month: string) => {
    setSelectedMonth(month)
    localStorage.setItem('budget-tracker-selected-month', month)
  }

  return (
    <MonthContext.Provider
      value={{
        selectedMonth,
        setSelectedMonth: handleSetSelectedMonth,
      }}
    >
      {children}
    </MonthContext.Provider>
  )
}

export function useMonth() {
  const context = useContext(MonthContext)
  if (context === undefined) {
    throw new Error('useMonth must be used within a MonthProvider')
  }
  return context
} 