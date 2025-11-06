import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { generateStudentId, generateBarcode } from '../src/lib/utils'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  await prisma.systemSetting.deleteMany()
  await prisma.incident.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.bookLoan.deleteMany()
  await prisma.book.deleteMany()
  await prisma.student.deleteMany()
  await prisma.timetable.deleteMany()
  await prisma.class.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️ Cleared existing data')

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12)

  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@school.com',
      passwordHash: hashedPassword,
      role: 'super_admin',
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+1234567890'
    }
  })

  const admin = await prisma.user.create({
    data: {
      email: 'school.admin@school.com',
      passwordHash: hashedPassword,
      role: 'admin',
      firstName: 'School',
      lastName: 'Administrator',
      phone: '+1234567891'
    }
  })

  const librarian = await prisma.user.create({
    data: {
      email: 'librarian@school.com',
      passwordHash: hashedPassword,
      role: 'librarian',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1234567892'
    }
  })

  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@school.com',
      passwordHash: hashedPassword,
      role: 'teacher',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567893'
    }
  })

  const parent = await prisma.user.create({
    data: {
      email: 'parent@school.com',
      passwordHash: hashedPassword,
      role: 'parent',
      firstName: 'Mary',
      lastName: 'Johnson',
      phone: '+1234567894'
    }
  })

  console.log('👥 Created users')

  // Create classes
  const currentYear = new Date().getFullYear().toString()

  const class1A = await prisma.class.create({
    data: {
      name: 'Grade 1A',
      gradeLevel: 1,
      academicYear: currentYear,
      teacherId: teacher.id,
      maxCapacity: 30,
      currentEnrollment: 0
    }
  })

  const class5B = await prisma.class.create({
    data: {
      name: 'Grade 5B',
      gradeLevel: 5,
      academicYear: currentYear,
      teacherId: teacher.id,
      maxCapacity: 35,
      currentEnrollment: 0
    }
  })

  const class10A = await prisma.class.create({
    data: {
      name: 'Grade 10A',
      gradeLevel: 10,
      academicYear: currentYear,
      teacherId: teacher.id,
      maxCapacity: 40,
      currentEnrollment: 0
    }
  })

  console.log('🏫 Created classes')

  // Create students
  const students = []
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: `student${i}@school.com`,
        passwordHash: hashedPassword,
        role: 'student',
        firstName: `Student${i}`,
        lastName: 'Test',
        phone: `+123456789${i + 4}`
      }
    })

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        studentId: generateStudentId('SCH', `${i <= 3 ? '01A' : i <= 6 ? '05B' : '10A'}`, i),
        barcodeUrl: `/barcodes/${generateBarcode()}.png`,
        classId: i <= 3 ? class1A.id : i <= 6 ? class5B.id : class10A.id,
        enrollmentDate: new Date(),
        dateOfBirth: new Date(`2010-0${(i % 9) + 1}-15`),
        gender: i % 2 === 0 ? 'male' : 'female',
        address: `${i} Main St, City`,
        emergencyContact: {
          name: `Parent ${i}`,
          phone: `+987654321${i}`,
          relationship: 'parent'
        },
        academicYear: currentYear,
        parentGuardianId: parent.id
      }
    })

    students.push(student)
  }

  console.log('🎓 Created students')

  // Create books
  const books = [
    {
      title: 'Introduction to Mathematics',
      author: 'John Smith',
      publisher: 'Education Press',
      publicationYear: 2020,
      genre: 'Education',
      totalCopies: 5,
      location: 'A1-101'
    },
    {
      title: 'Science for Kids',
      author: 'Jane Doe',
      publisher: 'Science Publishers',
      publicationYear: 2021,
      genre: 'Science',
      totalCopies: 3,
      location: 'B2-205'
    },
    {
      title: 'History of the World',
      author: 'Robert Johnson',
      publisher: 'History Press',
      publicationYear: 2019,
      genre: 'History',
      totalCopies: 4,
      location: 'C3-301'
    },
    {
      title: 'English Grammar',
      author: 'Mary Williams',
      publisher: 'Language Publishers',
      publicationYear: 2022,
      genre: 'Language',
      totalCopies: 6,
      location: 'D4-402'
    },
    {
      title: 'Computer Programming',
      author: 'David Brown',
      publisher: 'Tech Books',
      publicationYear: 2023,
      genre: 'Technology',
      totalCopies: 2,
      location: 'E5-503'
    }
  ]

  const createdBooks = []
  for (const bookData of books) {
    const book = await prisma.book.create({
      data: {
        ...bookData,
        barcode: generateBarcode(),
        barcodeUrl: `/barcodes/${generateBarcode()}.png`,
        availableCopies: bookData.totalCopies,
        description: `A comprehensive guide to ${bookData.genre.toLowerCase()} for students.`
      }
    })
    createdBooks.push(book)
  }

  console.log('📚 Created books')

  // Create book loans
  for (let i = 0; i < 5; i++) {
    const loanDate = new Date()
    loanDate.setDate(loanDate.getDate() - (i * 3))

    const dueDate = new Date(loanDate)
    dueDate.setDate(dueDate.getDate() + 14)

    await prisma.bookLoan.create({
      data: {
        bookId: createdBooks[i].id,
        studentId: students[i].userId,
        loanDate,
        dueDate,
        status: i < 3 ? 'active' : 'returned',
        returnDate: i >= 3 ? new Date() : null,
        fineAmount: i === 2 ? 2.50 : 0.00
      }
    })
  }

  console.log('📖 Created book loans')

  // Create attendance records
  const today = new Date()
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today)
    date.setDate(date.getDate() - dayOffset)

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue

    for (const student of students) {
      const status = Math.random() > 0.1 ? 'present' : (Math.random() > 0.5 ? 'late' : 'absent')

      await prisma.attendance.create({
        data: {
          studentId: student.userId,
          classId: student.classId,
          date,
          status,
          arrivalTime: status === 'late' ? '08:20' : '08:00',
          recordedBy: teacher.id,
          recordedAt: new Date()
        }
      })
    }
  }

  console.log('📊 Created attendance records')

  // Create timetable entries
  const timetableEntries = [
    { subject: 'Mathematics', dayOfWeek: 1, startTime: '08:00', endTime: '09:00', room: '101' },
    { subject: 'English', dayOfWeek: 1, startTime: '09:00', endTime: '10:00', room: '102' },
    { subject: 'Science', dayOfWeek: 2, startTime: '08:00', endTime: '09:00', room: '103' },
    { subject: 'History', dayOfWeek: 2, startTime: '09:00', endTime: '10:00', room: '104' },
    { subject: 'Mathematics', dayOfWeek: 3, startTime: '10:00', endTime: '11:00', room: '101' },
    { subject: 'English', dayOfWeek: 3, startTime: '11:00', endTime: '12:00', room: '102' },
    { subject: 'Science', dayOfWeek: 4, startTime: '08:00', endTime: '09:00', room: '103' },
    { subject: 'History', dayOfWeek: 4, startTime: '09:00', endTime: '10:00', room: '104' },
    { subject: 'Mathematics', dayOfWeek: 5, startTime: '08:00', endTime: '09:00', room: '101' },
    { subject: 'English', dayOfWeek: 5, startTime: '09:00', endTime: '10:00', room: '102' }
  ]

  for (const entry of timetableEntries) {
    await prisma.timetable.create({
      data: {
        ...entry,
        classId: class5B.id,
        teacherId: teacher.id,
        academicYear: currentYear
      }
    })
  }

  console.log('📅 Created timetable entries')

  // Create announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Mid-term Exams Announced',
        content: 'Mid-term examinations will begin next week. Please ensure all students are prepared.',
        authorId: admin.id,
        targetAudience: 'all',
        priority: 'high',
        isPublished: true
      },
      {
        title: 'New Library Books Available',
        content: 'We have added 50 new books to our library collection. Students are encouraged to borrow them.',
        authorId: librarian.id,
        targetAudience: 'students',
        priority: 'medium',
        isPublished: true
      },
      {
        title: 'Parent-Teacher Meeting',
        content: 'Parent-teacher meetings are scheduled for this Friday. All parents are requested to attend.',
        authorId: admin.id,
        targetAudience: 'parents',
        priority: 'high',
        isPublished: true
      }
    ]
  })

  console.log('📢 Created announcements')

  // Create incidents
  await prisma.incident.createMany({
    data: [
      {
        title: 'Late Arrival',
        description: 'Student arrived 30 minutes late to class without valid reason.',
        incidentType: 'behavioral',
        severity: 'low',
        studentId: students[0].userId,
        reportedBy: teacher.id,
        status: 'resolved',
        incidentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        resolutionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Missing Homework',
        description: 'Student failed to submit mathematics homework for the third time this month.',
        incidentType: 'academic',
        severity: 'medium',
        studentId: students[1].userId,
        reportedBy: teacher.id,
        status: 'open',
        incidentDate: new Date()
      }
    ]
  })

  console.log('⚠️ Created incidents')

  // Create system settings
  await prisma.systemSetting.createMany({
    data: [
      {
        key: 'school_name',
        value: 'Demo School',
        description: 'Name of the school',
        category: 'general',
        updatedBy: admin.id
      },
      {
        key: 'academic_year',
        value: currentYear,
        description: 'Current academic year',
        category: 'academic',
        updatedBy: admin.id
      },
      {
        key: 'library_fine_per_day',
        value: 0.50,
        description: 'Fine amount per day for overdue books',
        category: 'library',
        updatedBy: librarian.id
      },
      {
        key: 'max_books_per_student',
        value: 3,
        description: 'Maximum number of books a student can borrow',
        category: 'library',
        updatedBy: librarian.id
      },
      {
        key: 'late_threshold_minutes',
        value: 15,
        description: 'Minutes after which a student is marked late',
        category: 'attendance',
        updatedBy: admin.id
      }
    ]
  })

  console.log('⚙️ Created system settings')

  console.log('✅ Database seeding completed successfully!')
  console.log('')
  console.log('🔑 Demo Login Credentials:')
  console.log('Super Admin: admin@school.com / password123')
  console.log('Admin: school.admin@school.com / password123')
  console.log('Librarian: librarian@school.com / password123')
  console.log('Teacher: teacher@school.com / password123')
  console.log('Parent: parent@school.com / password123')
  console.log('Student: student1@school.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })