import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { TripBudget } from "@/lib/types"

let kv: any = null
if (process.env.NODE_ENV === 'production') {
  try {
    kv = require('@vercel/kv').kv
  } catch (error) {
    console.error('Failed to import @vercel/kv:', error)
  }
}

const dataPath = path.join(process.cwd(), "data", "trip-budget.json")
const KV_KEY = "trip-budget"

export async function GET() {
  try {
    if (process.env.NODE_ENV === 'production' && kv) {
      const data = await kv.get(KV_KEY) as TripBudget | null
      return NextResponse.json(data || null)
    } else {
      try {
        const fileContents = await fs.readFile(dataPath, "utf8")
        const data = JSON.parse(fileContents)
        return NextResponse.json(data)
      } catch {
        return NextResponse.json(null)
      }
    }
  } catch (error) {
    console.error("Error reading trip budget:", error)
    return NextResponse.json(null, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: TripBudget = await request.json()
    
    if (process.env.NODE_ENV === 'production' && kv) {
      await kv.set(KV_KEY, data)
    } else {
      await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving trip budget:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

