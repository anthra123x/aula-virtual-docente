import { z } from 'zod'

export const AttendanceStatusSchema = z.enum(['PRESENT', 'ABSENT', 'LATE'])
export const ObservationTypeSchema = z.enum(['ACADEMIC', 'BEHAVIOR'])
export const ClassStatusSchema = z.enum(['PLANNED', 'DONE', 'CANCELLED'])

export const CreateCourseSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional().nullable(),
  color: z.string().default('#3B82F6'),
})

export const UpdateCourseSchema = CreateCourseSchema.partial()

export const CreateGroupSchema = z.object({
  name: z.string().min(1, 'El nombre del grupo es requerido'),
  grade: z.string().optional().nullable(),
  courseId: z.string(),
})

export const UpdateGroupSchema = CreateGroupSchema.partial()

export const CreateStudentSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().nullable(),
  phone: z.string().optional().nullable(),
  groupId: z.string(),
})

export const UpdateStudentSchema = CreateStudentSchema.partial()

export const CreateClassSessionSchema = z.object({
  date: z.string().min(1, 'La fecha es requerida'),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  topic: z.string().min(2, 'El tema debe tener al menos 2 caracteres'),
  status: ClassStatusSchema.default('PLANNED'),
  groupId: z.string(),
  periodId: z.string().optional().nullable(),
})

export const UpdateClassSessionSchema = CreateClassSessionSchema.partial()

export const CreateLessonPlanSchema = z.object({
  objectives: z.string().optional().nullable(),
  activities: z.string().optional().nullable(),
  resources: z.string().optional().nullable(),
  homework: z.string().optional().nullable(),
  classSessionId: z.string(),
})

export const UpdateLessonPlanSchema = CreateLessonPlanSchema.partial()

export const CreateAttendanceSchema = z.object({
  studentId: z.string(),
  classSessionId: z.string(),
  status: AttendanceStatusSchema.default('PRESENT'),
})

export const BulkAttendanceSchema = z.object({
  classSessionId: z.string(),
  records: z.array(
    z.object({
      studentId: z.string(),
      status: AttendanceStatusSchema,
    }),
  ),
})

export const CreateObservationSchema = z.object({
  description: z.string().min(3, 'La descripción debe tener al menos 3 caracteres'),
  type: ObservationTypeSchema.default('ACADEMIC'),
  studentId: z.string(),
})

export const UpdateObservationSchema = CreateObservationSchema.partial()

export const CreateAcademicPeriodSchema = z.object({
  name: z.string().min(1, 'El nombre del período es requerido'),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  endDate: z.string().min(1, 'La fecha de fin es requerida'),
  year: z.coerce.number().int().min(2020, 'Año inválido'),
})

export const UpdateAcademicPeriodSchema = CreateAcademicPeriodSchema.partial()
