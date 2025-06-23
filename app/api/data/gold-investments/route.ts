import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { GoldInvestment } from "@/lib/types"

// Import KV only in production
let kv: any = null
if (process.env.NODE_ENV === 'production') {
  try {
    kv = require('@vercel/kv').kv
  } catch (error) {
    console.error('Failed to import @vercel/kv:', error)
  }
}

const dataPath = path.join(process.cwd(), "data", "gold-investments.json")
const KV_KEY = "gold-investments"

export async function GET() {
  try {
    if (process.env.NODE_ENV === 'production' && kv) {
      const data = await kv.get(KV_KEY) as GoldInvestment[] | null
      return NextResponse.json(data || [])
    } else {
      const fileContents = await fs.readFile(dataPath, "utf8")
      const data = JSON.parse(fileContents)
      return NextResponse.json(data)
    }
  } catch (error) {
    console.error("Error reading gold investments:", error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: GoldInvestment[] = await request.json()
    
    if (process.env.NODE_ENV === 'production' && kv) {
      await kv.set(KV_KEY, data)
    } else {
      await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving gold investments:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
