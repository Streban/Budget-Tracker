"use client"

import { useAuth } from './auth-provider'
import { PinAuth } from './pin-auth'
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface ProtectedAppProps {
  children: React.ReactNode
}

export function ProtectedApp({ children }: ProtectedAppProps) {
  const { isAuthenticated, authenticate, logout } = useAuth()

  if (!isAuthenticated) {
    return <PinAuth onAuthenticated={authenticate} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Logout button in the top right corner */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="flex items-center gap-2 bg-white shadow-sm hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
      
      {children}
    </div>
  )
} 