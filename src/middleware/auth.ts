import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export function withAuth(handler: (req: NextRequest, user: any) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const accessToken = req.cookies.get('access_token')?.value

      if (!accessToken) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }

      const payload = AuthService.verifyToken(accessToken)
      if (!payload) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }

      const user = await AuthService.getUserById(payload.userId)
      if (!user) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }

      return handler(req, user)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
  }
}

export function withRole(allowedRoles: string[]) {
  return function(handler: (req: NextRequest, user: any) => Promise<NextResponse>) {
    return withAuth(async (req: NextRequest, user: any) => {
      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
      return handler(req, user)
    })
  }
}