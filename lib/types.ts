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
  | "draft"
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
  adminNotes?: string
  formId?: string // Add formId to link Application to ApplicationFormData
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
  | "birth_certificate"
  | "marriage_certificate"
  | "police_clearance"
  | "medical_report"
  | "employment_letter"
  | "other"

export type DocumentStatus = "pending" | "approved" | "rejected" | "requires_update"

export interface Document {
  id: string
  applicationId: string
  clientId: string
  type: DocumentType
  name: string
  url: string
  fileUrl?: string // Added fileUrl for preview/download
  status: DocumentStatus
  feedback?: string
  adminNotes?: string
  uploadedAt: string
  reviewedAt?: string
  reviewedBy?: string
}

// Appointment Types
export type AppointmentType = "consultation" | "document_review" | "interview_prep" | "visa_guidance"
export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "rescheduled" | "pending_reschedule"

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
  duration: number
  notes?: string
  rescheduleRequest?: {
    proposedDate: string
    proposedTime: string
    reason: string
    requestedBy: "client" | "admin"
    requestedAt: string
    status: "pending" | "approved" | "rejected"
    adminNotes?: string
    respondedAt?: string
  }
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
  reply?: string
  repliedAt?: string
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
  start: string
  end: string
}

export interface AvailabilitySchedule {
  id: string
  date: string
  slots: TimeSlot[]
  isRecurring: boolean
  dayOfWeek?: number
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

// Payment Verification Type for Bank Transfer Workflow
export type PaymentVerificationStatus = "pending" | "verified" | "rejected"
export type PaymentRegion = "us" | "africa" | "international"

export interface PaymentVerification {
  id: string
  appointmentId: string
  clientEmail: string
  clientName: string
  paymentMethod: "bank_transfer" | "mobile_money"
  region: PaymentRegion
  amount: number
  currency: string
  transactionId?: string
  receiptUrl?: string
  status: PaymentVerificationStatus
  adminNotes?: string
  verifiedBy?: string
  verifiedAt?: string
  createdAt: string
}

// Activity Log
export interface ActivityLog {
  id: string
  entityType: "client" | "application" | "document" | "appointment"
  entityId: string
  action: string
  performedBy: string
  performedByRole: "client" | "admin"
  details?: string
  createdAt: string
}

// PaymentGateway type for admin management
export type PaymentGatewayType = "credit_card" | "bank_transfer" | "paypal" | "mobile_money"
export type PaymentGatewayRegion = "us" | "uk" | "eu" | "africa" | "asia" | "global"

export interface PaymentGateway {
  id: string
  name: string
  type: PaymentGatewayType
  region: PaymentGatewayRegion
  isActive: boolean
  // Bank details
  bankName?: string
  accountName?: string
  accountNumber?: string
  routingNumber?: string
  swiftCode?: string
  iban?: string
  bankAddress?: string
  // Mobile money details
  mobileProvider?: string
  mobileNumber?: string
  // PayPal details
  paypalEmail?: string
  // Card processor details
  processorName?: string
  merchantId?: string
  // General
  currency: string
  instructions?: string
  createdAt: string
  updatedAt: string
}

// Document Upload Queue
export interface DocumentUploadQueue {
  id: string
  clientId: string
  applicationId: string
  fileName: string
  fileSize: number
  documentType: DocumentType
  status: "uploading" | "processing" | "completed" | "failed"
  progress: number
  error?: string
  createdAt: string
}

// Weekly Default Schedule type
export interface WeeklyDefaultSchedule {
  sunday: TimeSlot[]
  monday: TimeSlot[]
  tuesday: TimeSlot[]
  wednesday: TimeSlot[]
  thursday: TimeSlot[]
  friday: TimeSlot[]
  saturday: TimeSlot[]
}

// ==========================================
// APPLICATION FORM TYPES
// ==========================================

export interface PersonalInfo {
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth: string
  gender: "male" | "female" | "other"
  nationality: string
  countryOfResidence: string
  address: string
  city: string
  state: string
  postalCode: string
  phone: string
  email: string
  maritalStatus: "single" | "married" | "divorced" | "widowed"
}

export interface EducationHistory {
  id: string
  level: "high_school" | "bachelors" | "masters" | "phd" | "diploma" | "certificate"
  institution: string
  country: string
  fieldOfStudy: string
  startDate: string
  endDate: string
  gpa?: string
  graduated: boolean
  certificateObtained: string
}

export interface WorkExperience {
  id: string
  companyName: string
  position: string
  country: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  responsibilities: string
}

export interface TestScore {
  testType: "ielts" | "toefl" | "gre" | "gmat" | "sat" | "duolingo" | "pte" | "other"
  overallScore: string
  datesTaken: string
  expiryDate?: string
  componentScores?: Record<string, string>
}

export interface ApplicationFormData {
  id: string
  clientId: string
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected"
  serviceType: ServiceType
  educationLevel?: EducationLevel

  // Personal Information
  personalInfo: PersonalInfo

  // Education History
  educationHistory: EducationHistory[]

  // Work Experience (for Masters/PhD)
  workExperience?: WorkExperience[]

  // Test Scores
  testScores?: TestScore[]

  // Program Preferences
  preferredCountries: string[]
  preferredInstitutions?: string[]
  preferredPrograms?: string[]
  intakePreference: string

  // Statement of Purpose
  statementOfPurpose?: string

  // Immigration Specific
  immigrationInfo?: {
    purposeOfTravel: string
    previousVisaRejections: boolean
    rejectionDetails?: string
    travelHistory?: string
    sponsor: "self" | "family" | "scholarship" | "employer"
    sponsorDetails?: string
  }

  // Required Documents Checklist
  requiredDocuments: {
    type: DocumentType
    required: boolean
    uploaded: boolean
    documentId?: string
  }[]

  // Admin Review
  adminReview?: {
    reviewedBy: string
    reviewedAt: string
    comments: string
    status: "pending" | "approved" | "needs_revision" | "rejected"
  }

  createdAt: string
  updatedAt: string
  submittedAt?: string
}
