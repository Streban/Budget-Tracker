"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Loader2 } from "lucide-react"
import { useMonth } from "@/lib/month-context"
import { useAvailableMonths } from "@/lib/use-available-months"
import { cn } from "@/lib/utils"

interface MonthSelectorProps {
  showIcon?: boolean
  className?: string
  triggerClassName?: string
  placeholder?: string
  onMonthChange?: (month: string) => void
}

export function MonthSelector({ 
  showIcon = true, 
  className,
  triggerClassName,
  placeholder = "Select month",
  onMonthChange
}: MonthSelectorProps) {
  const { selectedMonth, setSelectedMonth } = useMonth()
  const { availableMonths, loading, formatMonthDisplay } = useAvailableMonths()

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month)
    onMonthChange?.(month)
  }

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {showIcon && <Calendar className="h-4 w-4 text-muted-foreground" />}
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && <Calendar className="h-4 w-4 text-muted-foreground" />}
      <Select value={selectedMonth} onValueChange={handleMonthChange}>
        <SelectTrigger className={cn("w-40", triggerClassName)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {availableMonths.map((month) => (
            <SelectItem key={month} value={month}>
              {formatMonthDisplay(month)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 