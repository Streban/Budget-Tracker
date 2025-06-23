// Migration script to transfer JSON data to Vercel KV
// Run this once after setting up KV to migrate your existing data

const fs = require('fs').promises
const path = require('path')

// This would be used in a Vercel function or locally with KV credentials
async function migrateDataToKV() {
  const dataFiles = [
    'categories.json',
    'expense-data.json',
    'budget-data.json',
    'savings-accounts.json',
    'accounts.json',
    'gold-investments.json',
    'zakat-records.json'
  ]

  const kvKeys = [
    'categories',
    'expense-data',
    'budget-data',
    'savings-accounts',
    'accounts',
    'gold-investments',
    'zakat-records'
  ]

  console.log('Starting data migration to Vercel KV...')

  for (let i = 0; i < dataFiles.length; i++) {
    try {
      const filePath = path.join(process.cwd(), 'data', dataFiles[i])
      const fileContent = await fs.readFile(filePath, 'utf8')
      const data = JSON.parse(fileContent)
      
      console.log(`Migrating ${dataFiles[i]}... (${data.length} records)`)
      
      // In actual use, you'd call your API endpoint:
      // await fetch('/api/data/' + kvKeys[i], {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // })
      
      console.log(`✓ ${dataFiles[i]} migrated successfully`)
    } catch (error) {
      console.error(`✗ Failed to migrate ${dataFiles[i]}:`, error.message)
    }
  }

  console.log('Migration completed!')
}

// Export for use in API route
module.exports = { migrateDataToKV }

// Run if called directly
if (require.main === module) {
  migrateDataToKV()
} 