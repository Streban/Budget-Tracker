"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Shield } from "lucide-react"

interface PinAuthProps {
  onAuthenticated: () => void
}

export function PinAuth({ onAuthenticated }: PinAuthProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const MAX_ATTEMPTS = 5

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      })

      const data = await response.json()

      if (data.success) {
        // Store session token and auth time
        localStorage.setItem('budgetTracker_authenticated', 'true')
        localStorage.setItem('budgetTracker_authTime', Date.now().toString())
        localStorage.setItem('budgetTracker_sessionToken', data.sessionToken)
        onAuthenticated()
        setError('')
        setPin('')
        setAttempts(0)
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        setError(`Incorrect PIN. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`)
        setPin('')
        
        if (newAttempts >= MAX_ATTEMPTS) {
          setError('Too many failed attempts. Please wait 5 minutes before trying again.')
          setTimeout(() => {
            setAttempts(0)
            setError('')
          }, 5 * 60 * 1000) // 5 minutes
        }
      }
    } catch (error) {
      setError('Connection error. Please try again.')
      console.error('Auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Only allow digits
    if (value.length <= 4) {
      setPin(value)
      setError('')
    }
  }

  const isBlocked = attempts >= MAX_ATTEMPTS

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Access Protected</CardTitle>
          <CardDescription>
            Enter your 4-digit PIN to access Budget Tracker
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <div className="relative">
                <Input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={handlePinChange}
                  placeholder="Enter 4-digit PIN"
                  className="text-center text-lg tracking-widest"
                  maxLength={4}
                  disabled={isBlocked || isLoading}
                />
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            {error && (
              <div className="text-sm text-red-600 text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={pin.length !== 4 || isBlocked || isLoading}
            >
              {isLoading ? 'Verifying...' : isBlocked ? 'Blocked' : 'Access Budget Tracker'}
            </Button>
          </form>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            Your session will remain active for 24 hours
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 