import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken } = await request.json()

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: 'Missing tokens' },
        { status: 400 }
      )
    }

    // Validate tokens
    const payload = AuthService.verifyToken(accessToken)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid tokens' },
        { status: 401 }
      )
    }

    // Set secure httpOnly cookies
    const response = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    )

    // Set access token cookie (shorter lifespan)
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    })

    // Set refresh token cookie (longer lifespan)
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    // Set user info cookie (for client-side access)
    const user = await AuthService.getUserById(payload.userId)
    if (user) {
      response.cookies.set('user_info', JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }), {
        httpOnly: false, // Allow client-side access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60, // 15 minutes
        path: '/'
      })
    }

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}