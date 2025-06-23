import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Import KV only in production
let kv: any = null
if (process.env.NODE_ENV === 'production') {
  try {
    kv = require('@vercel/kv').kv
  } catch (error) {
    console.error('Failed to import @vercel/kv:', error)
  }
}

export async function POST() {
  // Only allow migration in production
  if (process.env.NODE_ENV !== 'production' || !kv) {
    return NextResponse.json({ 
      error: 'Migration only available in production with KV setup' 
    }, { status: 400 })
  }

  const dataFiles = [
    { file: 'categories.json', key: 'categories' },
    { file: 'expense-data.json', key: 'expense-data' },
    { file: 'budget-data.json', key: 'budget-data' },
    { file: 'savings-accounts.json', key: 'savings-accounts' },
    { file: 'accounts.json', key: 'accounts' },
    { file: 'gold-investments.json', key: 'gold-investments' },
    { file: 'zakat-records.json', key: 'zakat-records' }
  ]

  const results = []

  for (const { file, key } of dataFiles) {
    try {
      const filePath = path.join(process.cwd(), 'data', file)
      const fileContent = await fs.readFile(filePath, 'utf8')
      const data = JSON.parse(fileContent)
      
      await kv.set(key, data)
      results.push({ file, key, status: 'success', records: data.length })
    } catch (error) {
      results.push({ 
        file, 
        key, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  return NextResponse.json({ 
    success: true, 
    message: 'Migration completed', 
    results 
  })
} 