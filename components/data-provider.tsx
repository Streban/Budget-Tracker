"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { dataStore } from '@/lib/data-store'
import { Loader2, DollarSign, TrendingUp, PieChart } from 'lucide-react'

interface DataContextType {
  isDataLoaded: boolean
  isDataLoading: boolean
  initializeData: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

interface DataProviderProps {
  children: ReactNode
}

export function DataProvider({ children }: DataProviderProps) {
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)

  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    try {
      setIsDataLoading(true)
      await dataStore.initialize()
      setIsDataLoaded(true)
    } catch (error) {
      console.error('Error initializing data:', error)
    } finally {
      setIsDataLoading(false)
    }
  }

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse dark:mix-blend-screen"></div>
          <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000 dark:mix-blend-screen"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000 dark:mix-blend-screen"></div>
        </div>

        <div className="relative z-10 text-center space-y-8 px-4">
          {/* Main loading spinner with glow effect */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <div className="w-24 h-24 mx-auto rounded-full bg-primary/25 opacity-25"></div>
            </div>
            <div className="relative bg-card rounded-full p-6 shadow-2xl border">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            </div>
          </div>

          {/* Animated title */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent animate-pulse">
              Budget Tracker
            </h2>
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <span className="inline-block w-2 h-2 bg-primary rounded-full animate-bounce"></span>
              <span className="inline-block w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-200"></span>
              <span className="inline-block w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-400"></span>
            </div>
          </div>

          {/* Loading message with typewriter effect */}
          <div className="space-y-3">
            <p className="text-lg text-foreground font-medium animate-pulse">
              Preparing your financial dashboard...
            </p>
            <div className="flex justify-center space-x-8">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4 animate-pulse" />
                <span>Loading transactions</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 animate-pulse animation-delay-1000" />
                <span>Calculating trends</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <PieChart className="h-4 w-4 animate-pulse animation-delay-2000" />
                <span>Generating insights</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="max-w-md mx-auto">
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary/70 h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Additional animated elements */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-primary/80 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-3 h-3 bg-primary/60 rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DataContext.Provider value={{ isDataLoaded, isDataLoading, initializeData }}>
      {children}
    </DataContext.Provider>
  )
} 