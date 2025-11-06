import { z } from 'zod'

export const UserRole = z.enum(['super_admin', 'admin', 'librarian', 'teacher', 'student', 'parent'])

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const UserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: UserRole,
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  profileImage: z.string().optional(),
})

export const StudentSchema = UserSchema.extend({
  role: z.literal('student'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  classId: z.string().uuid('Invalid class ID'),
  parentGuardianId: z.string().uuid('Invalid parent/guardian ID'),
})

export const BookSchema = z.object({
  isbn: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  publisher: z.string().optional(),
  publicationYear: z.number().optional(),
  genre: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  totalCopies: z.number().min(1, 'Total copies must be at least 1'),
})

export const AttendanceSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  classId: z.string().uuid('Invalid class ID'),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['present', 'absent', 'late', 'excused']),
  arrivalTime: z.string().optional(),
  notes: z.string().optional(),
})

export const AnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  targetAudience: z.enum(['all', 'students', 'teachers', 'parents', 'specific_class']),
  targetClassId: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  scheduledAt: z.string().optional(),
  attachmentUrls: z.array(z.string()).optional(),
})

export const IncidentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  incidentType: z.enum(['academic', 'behavioral', 'medical', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  studentId: z.string().uuid().optional(),
  incidentDate: z.string().min(1, 'Incident date is required'),
  notes: z.string().optional(),
  attachmentUrls: z.array(z.string()).optional(),
})

export const TimetableSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  subject: z.string().min(1, 'Subject is required'),
  teacherId: z.string().uuid('Invalid teacher ID'),
  dayOfWeek: z.number().min(0).max(6, 'Day must be between 0 (Sunday) and 6 (Saturday)'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  room: z.string().optional(),
  academicYear: z.string().min(1, 'Academic year is required'),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type UserInput = z.infer<typeof UserSchema>
export type StudentInput = z.infer<typeof StudentSchema>
export type BookInput = z.infer<typeof BookSchema>
export type AttendanceInput = z.infer<typeof AttendanceSchema>
export type AnnouncementInput = z.infer<typeof AnnouncementSchema>
export type IncidentInput = z.infer<typeof IncidentSchema>
export type TimetableInput = z.infer<typeof TimetableSchema>