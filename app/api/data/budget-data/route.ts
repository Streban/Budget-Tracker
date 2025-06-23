import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { BudgetItem } from "@/lib/types"

// Import KV only in production
let kv: any = null
if (process.env.NODE_ENV === 'production') {
  try {
    kv = require('@vercel/kv').kv
  } catch (error) {
    console.error('Failed to import @vercel/kv:', error)
  }
}

const dataPath = path.join(process.cwd(), "data", "budget-data.json")
const KV_KEY = "budget-data"

export async function GET() {
  try {
    // Use KV in production, JSON files in development
    if (process.env.NODE_ENV === 'production' && kv) {
      const data = await kv.get(KV_KEY) as BudgetItem[] | null
      return NextResponse.json(data || [])
    } else {
      // Development: use JSON files
      const fileContents = await fs.readFile(dataPath, "utf8")
      const data = JSON.parse(fileContents)
      return NextResponse.json(data)
    }
  } catch (error) {
    console.error("Error reading budget data:", error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: BudgetItem[] = await request.json()
    
    // Use KV in production, JSON files in development
    if (process.env.NODE_ENV === 'production' && kv) {
      await kv.set(KV_KEY, data)
    } else {
      // Development: use JSON files
      await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving budget data:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
