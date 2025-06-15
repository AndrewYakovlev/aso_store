import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateAnonymousUser } from '@/shared/lib/auth/anonymous'

export async function POST(request: NextRequest) {
  try {
    const anonymousUser = await getOrCreateAnonymousUser(request)
    
    return NextResponse.json({
      success: true,
      data: {
        id: anonymousUser.id,
        sessionId: anonymousUser.sessionId,
      },
    })
  } catch (error) {
    console.error('Anonymous user creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create anonymous user' },
      { status: 500 }
    )
  }
}