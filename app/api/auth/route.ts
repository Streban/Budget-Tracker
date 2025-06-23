import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json()
    
    // Get the PIN from environment variables
    const CORRECT_PIN = process.env.BUDGET_TRACKER_PIN || '8981'
    
    if (pin === CORRECT_PIN) {
      // Generate a simple session token
      const sessionToken = generateSessionToken()
      
      return NextResponse.json({ 
        success: true, 
        sessionToken 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid PIN' 
      }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Server error' 
    }, { status: 500 })
  }
}

function generateSessionToken(): string {
  // Simple token generation - in production, use a more secure method
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2)
  return `${timestamp}-${random}`
} 