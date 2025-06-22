import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const dataPath = path.join(process.cwd(), "data", "expense-data.json")

export async function GET() {
  try {
    const fileContents = await fs.readFile(dataPath, "utf8")
    const data = JSON.parse(fileContents)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error reading expense data:", error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving expense data:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
