// ==========================================
// SAMOP CONSULTING - DATA TYPES
// ==========================================

// User & Authentication Types
export type UserRole = "client" | "admin"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

// Service Types
export type ServiceType = "education" | "immigration" | "sevis" | "credential_evaluation"

export interface Service {
  id: string
  name: string
  type: ServiceType
  description: string
  price: number
  currency: string
}

// Application & Process Types
export type ApplicationStatus =
  | "pending"
  | "documents_required"
  | "under_review"
  | "submitted"
  | "interview_scheduled"
  | "approved"
  | "rejected"
  | "completed"

export type EducationLevel = "bachelors" | "masters" | "phd"

export interface Application {
  id: string
  clientId: string
  serviceType: ServiceType
  status: ApplicationStatus
  country: string
  institution?: string
  program?: string
  educationLevel?: EducationLevel
  startDate?: string
  notes: string
  createdAt: string
  updatedAt: string
}

// Document Types
export type DocumentType =
  | "passport"
  | "transcript"
  | "diploma"
  | "recommendation_letter"
  | "statement_of_purpose"
  | "cv_resume"
  | "financial_statement"
  | "english_proficiency"
  | "photo"
  | "other"

export type DocumentStatus = "pending" | "approved" | "rejected" | "requires_update"

export interface Document {
  id: string
  applicationId: string
  clientId: string
  type: DocumentType
  name: string
  url: string
  status: DocumentStatus
  feedback?: string
  uploadedAt: string
}

// Appointment Types
export type AppointmentType = "consultation" | "document_review" | "interview_prep" | "visa_guidance"
export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "rescheduled"

export interface Appointment {
  id: string
  clientId?: string
  clientName: string
  clientEmail: string
  clientPhone: string
  type: AppointmentType
  status: AppointmentStatus
  date: string
  time: string
  duration: number // in minutes
  notes?: string
  createdAt: string
}

// Contact & Message Types
export interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

// Chat Types
export interface ChatMessage {
  id: string
  senderId: string
  senderType: "client" | "admin" | "bot"
  message: string
  timestamp: string
}

export interface ChatSession {
  id: string
  clientId: string
  messages: ChatMessage[]
  isActive: boolean
  createdAt: string
}

// Client Onboarding Types
export interface OnboardingInvite {
  id: string
  email: string
  serviceTypes: ServiceType[]
  token: string
  expiresAt: string
  isUsed: boolean
  createdAt: string
}

export interface ClientProfile extends User {
  applications: Application[]
  documents: Document[]
  appointments: Appointment[]
  nationality: string
  currentCountry: string
  dateOfBirth?: string
  address?: string
}

// Dashboard Stats Types
export interface DashboardStats {
  totalClients: number
  activeApplications: number
  pendingDocuments: number
  upcomingAppointments: number
  completedThisMonth: number
  successRate: number
}

// Country Options
export interface Country {
  code: string
  name: string
  flag: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Availability types for admin scheduling
export interface TimeSlot {
  start: string // HH:MM format
  end: string // HH:MM format
}

export interface AvailabilitySchedule {
  id: string
  date: string // YYYY-MM-DD
  slots: TimeSlot[]
  isRecurring: boolean
  dayOfWeek?: number // 0-6, Sunday-Saturday
  createdAt: string
  updatedAt: string
}

// Payment and Access Code Types
export type PaymentProvider = "paystack" | "flutterwave" | "paypal" | "stripe"
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded"

export interface AppointmentFee {
  id: string
  serviceType: AppointmentType
  amount: number
  currency: string
  description: string
}

export interface Payment {
  id: string
  appointmentId: string
  amount: number
  currency: string
  provider: PaymentProvider
  status: PaymentStatus
  reference: string
  createdAt: string
}

export interface AccessCode {
  id: string
  code: string
  clientEmail: string
  clientName: string
  serviceType: AppointmentType
  isUsed: boolean
  expiresAt: string
  createdBy: string
  createdAt: string
}

export interface BookingSlot {
  date: string
  time: string
  available: boolean
}
