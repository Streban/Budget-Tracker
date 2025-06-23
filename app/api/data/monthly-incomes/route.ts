import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { MonthlyIncome } from "@/lib/types"

// Import KV only in production
let kv: any = null
if (process.env.NODE_ENV === 'production') {
  try {
    kv = require('@vercel/kv').kv
  } catch (error) {
    console.error('Failed to import @vercel/kv:', error)
  }
}

const dataPath = path.join(process.cwd(), "data", "monthly-incomes.json")
const KV_KEY = "monthly-incomes"

export async function GET() {
  try {
    // Use KV in production, JSON files in development
    if (process.env.NODE_ENV === 'production' && kv) {
      const data = await kv.get(KV_KEY) as MonthlyIncome[] | null
      return NextResponse.json(data || [])
    } else {
      // Development: use JSON files
      try {
        const fileContents = await fs.readFile(dataPath, "utf8")
        const data = JSON.parse(fileContents)
        return NextResponse.json(data)
      } catch (error) {
        // If file doesn't exist, return empty array
        return NextResponse.json([])
      }
    }
  } catch (error) {
    console.error("Error reading monthly incomes:", error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: MonthlyIncome[] = await request.json()
    
    // Use KV in production, JSON files in development
    if (process.env.NODE_ENV === 'production' && kv) {
      await kv.set(KV_KEY, data)
    } else {
      // Development: use JSON files
      // Ensure data directory exists
      const dataDir = path.dirname(dataPath)
      await fs.mkdir(dataDir, { recursive: true })
      await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving monthly incomes:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
} 