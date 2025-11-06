import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './db'
import { UserRole } from './validations'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
}

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '15m'
const REFRESH_TOKEN_EXPIRES_IN = '7d'

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12)
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  static generateAccessToken(user: AuthUser): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      } as JWTPayload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
  }

  static generateRefreshToken(user: AuthUser): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      } as JWTPayload,
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    )
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
      return null
    }
  }

  static async login(email: string, password: string): Promise<{ user: AuthUser; accessToken: string; refreshToken: string } | null> {
    const user = await prisma.user.findUnique({
      where: { email, isActive: true }
    })

    if (!user) {
      return null
    }

    const isValidPassword = await this.verifyPassword(password, user.passwordHash)
    if (!isValidPassword) {
      return null
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      firstName: user.firstName,
      lastName: user.lastName
    }

    const accessToken = this.generateAccessToken(authUser)
    const refreshToken = this.generateRefreshToken(authUser)

    return { user: authUser, accessToken, refreshToken }
  }

  static async getUserById(userId: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true }
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      firstName: user.firstName,
      lastName: user.lastName
    }
  }

  static async createUser(userData: {
    email: string
    password: string
    role: UserRole
    firstName: string
    lastName: string
    phone?: string
  }): Promise<AuthUser> {
    const hashedPassword = await this.hashPassword(userData.password)

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash: hashedPassword,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone
      }
    })

    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      firstName: user.firstName,
      lastName: user.lastName
    }
  }

  static hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy = {
      super_admin: 6,
      admin: 5,
      librarian: 4,
      teacher: 3,
      parent: 2,
      student: 1
    }

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
  }

  static canAccessResource(user: AuthUser, resource: string, action: string): boolean {
    // Define permission matrix
    const permissions = {
      super_admin: ['*'], // Can access everything
      admin: ['users', 'students', 'classes', 'library', 'attendance', 'timetable', 'announcements', 'incidents', 'reports', 'settings'],
      librarian: ['library', 'books', 'loans', 'reports'],
      teacher: ['students', 'attendance', 'timetable', 'announcements', 'incidents', 'reports'],
      parent: ['students', 'attendance', 'announcements', 'reports'],
      student: ['profile', 'library', 'attendance', 'announcements']
    }

    if (user.role === 'super_admin') return true

    const userPermissions = permissions[user.role] || []
    return userPermissions.includes(resource) || userPermissions.includes('*')
  }
}