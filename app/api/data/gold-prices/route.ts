import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { GoldPrices } from "@/lib/types"

// Import KV only in production
let kv: any = null
if (process.env.NODE_ENV === 'production') {
  try {
    kv = require('@vercel/kv').kv
  } catch (error) {
    console.error('Failed to import @vercel/kv:', error)
  }
}

const dataPath = path.join(process.cwd(), "data", "gold-prices.json")
const KV_KEY = "gold-prices"

export async function GET() {
  try {
    if (process.env.NODE_ENV === 'production' && kv) {
      const data = await kv.get(KV_KEY) as GoldPrices | null
      return NextResponse.json(data || { gold22k: 0, gold24k: 0 })
    } else {
      try {
        const fileContents = await fs.readFile(dataPath, "utf8")
        const data = JSON.parse(fileContents)
        return NextResponse.json(data)
      } catch (error) {
        // If file doesn't exist, return default prices
        return NextResponse.json({ gold22k: 0, gold24k: 0 })
      }
    }
  } catch (error) {
    console.error("Error reading gold prices:", error)
    return NextResponse.json({ gold22k: 0, gold24k: 0 }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: GoldPrices = await request.json()
    
    if (process.env.NODE_ENV === 'production' && kv) {
      await kv.set(KV_KEY, data)
    } else {
      // Ensure data directory exists
      const dataDir = path.dirname(dataPath)
      await fs.mkdir(dataDir, { recursive: true })
      await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving gold prices:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
} 