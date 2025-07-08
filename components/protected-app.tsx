"use client"

import { useAuth } from './auth-provider'
import { PinAuth } from './pin-auth'
import { Button } from "@/components/ui/button"
import { LogOut, Sun, Moon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"

interface ProtectedAppProps {
  children: React.ReactNode
}

export function ProtectedApp({ children }: ProtectedAppProps) {
  const { isAuthenticated, authenticate, logout } = useAuth()

  if (!isAuthenticated) {
    return <PinAuth onAuthenticated={authenticate} />
  }

  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="min-h-screen bg-background">
      {/* Logout and dark mode toggle in the top right corner */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        {/* Dark mode toggle */}
        <div className="flex items-center gap-1 px-2 py-1 rounded border bg-muted/50 shadow-sm">
          {isDark ? <Moon className="h-4 w-4 text-yellow-400" /> : <Sun className="h-4 w-4 text-yellow-400" />}
          <Switch
            checked={isDark}
            onCheckedChange={checked => setTheme(checked ? "dark" : "light")}
            aria-label="Toggle dark mode"
            className="ml-1"
          />
        </div>
        {/* Logout button */}
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="flex items-center gap-2 bg-background shadow-sm hover:bg-muted"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
      {children}
    </div>
  )
} 