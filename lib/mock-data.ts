// ==========================================
// SAMOP CONSULTING - MOCK DATA
// ==========================================

import type {
  User,
  Service,
  Application,
  Document,
  Appointment,
  ContactMessage,
  ClientProfile,
  DashboardStats,
  Country,
  OnboardingInvite,
  ChatMessage,
  AvailabilitySchedule,
  AppointmentFee,
  AccessCode,
  Payment,
} from "./types"

const getFutureDate = (daysFromNow: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().split("T")[0]
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: "usr_001",
    email: "john.doe@email.com",
    firstName: "John",
    lastName: "Doe",
    phone: "+1 234 567 8901",
    role: "client",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-11-01T14:30:00Z",
  },
  {
    id: "usr_002",
    email: "jane.smith@email.com",
    firstName: "Jane",
    lastName: "Smith",
    phone: "+44 789 012 3456",
    role: "client",
    createdAt: "2024-02-20T09:00:00Z",
    updatedAt: "2024-10-15T11:00:00Z",
  },
  {
    id: "usr_003",
    email: "admin@samopconsulting.com",
    firstName: "Admin",
    lastName: "User",
    phone: "+1 555 000 0000",
    role: "admin",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2024-11-01T00:00:00Z",
  },
]

// Mock Services
export const mockServices: Service[] = [
  {
    id: "srv_001",
    name: "University Admission Consulting",
    type: "education",
    description: "Complete guidance for Bachelor's, Master's, and PhD admissions worldwide.",
    price: 500,
    currency: "USD",
  },
  {
    id: "srv_002",
    name: "Student Visa Processing",
    type: "immigration",
    description: "End-to-end visa application support with interview preparation.",
    price: 300,
    currency: "USD",
  },
  {
    id: "srv_003",
    name: "SEVIS Fee Registration",
    type: "sevis",
    description: "SEVIS I-901 fee payment assistance for US-bound students.",
    price: 50,
    currency: "USD",
  },
  {
    id: "srv_004",
    name: "Credential Evaluation",
    type: "credential_evaluation",
    description: "WES, ECE, and other credential evaluation services.",
    price: 150,
    currency: "USD",
  },
]

// Mock Applications
export const mockApplications: Application[] = [
  {
    id: "app_001",
    clientId: "usr_001",
    serviceType: "education",
    status: "under_review",
    country: "USA",
    institution: "MIT",
    program: "Computer Science",
    educationLevel: "masters",
    startDate: "2025-09-01",
    notes: "Strong candidate with excellent GRE scores.",
    createdAt: "2024-08-01T10:00:00Z",
    updatedAt: "2024-11-01T14:30:00Z",
  },
  {
    id: "app_002",
    clientId: "usr_001",
    serviceType: "immigration",
    status: "documents_required",
    country: "USA",
    notes: "Awaiting financial documents.",
    createdAt: "2024-09-15T09:00:00Z",
    updatedAt: "2024-10-20T11:00:00Z",
  },
  {
    id: "app_003",
    clientId: "usr_002",
    serviceType: "education",
    status: "approved",
    country: "UK",
    institution: "University of Oxford",
    program: "Business Administration",
    educationLevel: "phd",
    startDate: "2025-01-15",
    notes: "Admission confirmed. Visa process pending.",
    createdAt: "2024-05-10T08:00:00Z",
    updatedAt: "2024-10-01T16:00:00Z",
  },
]

// Mock Documents
export const mockDocuments: Document[] = [
  {
    id: "doc_001",
    applicationId: "app_001",
    clientId: "usr_001",
    type: "passport",
    name: "Passport_JohnDoe.pdf",
    url: "/documents/passport_johndoe.pdf",
    status: "approved",
    uploadedAt: "2024-08-05T10:00:00Z",
  },
  {
    id: "doc_002",
    applicationId: "app_001",
    clientId: "usr_001",
    type: "transcript",
    name: "Academic_Transcript.pdf",
    url: "/documents/transcript_johndoe.pdf",
    status: "approved",
    uploadedAt: "2024-08-06T11:00:00Z",
  },
  {
    id: "doc_003",
    applicationId: "app_001",
    clientId: "usr_001",
    type: "statement_of_purpose",
    name: "SOP_MIT.pdf",
    url: "/documents/sop_johndoe.pdf",
    status: "requires_update",
    feedback: "Please elaborate more on your research interests.",
    uploadedAt: "2024-08-10T09:00:00Z",
  },
  {
    id: "doc_004",
    applicationId: "app_002",
    clientId: "usr_001",
    type: "financial_statement",
    name: "Bank_Statement.pdf",
    url: "/documents/bank_johndoe.pdf",
    status: "pending",
    uploadedAt: "2024-10-01T14:00:00Z",
  },
]

export const mockAppointments: Appointment[] = [
  {
    id: "apt_001",
    clientId: "usr_001",
    clientName: "John Doe",
    clientEmail: "john.doe@email.com",
    clientPhone: "+1 234 567 8901",
    type: "consultation",
    status: "scheduled",
    date: getFutureDate(3),
    time: "10:00",
    duration: 60,
    notes: "Initial consultation for USA masters program.",
    createdAt: "2024-11-01T10:00:00Z",
  },
  {
    id: "apt_002",
    clientId: "usr_002",
    clientName: "Jane Smith",
    clientEmail: "jane.smith@email.com",
    clientPhone: "+44 789 012 3456",
    type: "visa_guidance",
    status: "scheduled",
    date: getFutureDate(5),
    time: "14:00",
    duration: 45,
    notes: "UK student visa guidance session.",
    createdAt: "2024-11-05T11:00:00Z",
  },
  {
    id: "apt_003",
    clientName: "Michael Brown",
    clientEmail: "michael.brown@email.com",
    clientPhone: "+49 170 123 4567",
    type: "consultation",
    status: "scheduled",
    date: getFutureDate(7),
    time: "09:00",
    duration: 30,
    notes: "New inquiry - interested in Germany PhD programs.",
    createdAt: "2024-11-10T08:00:00Z",
  },
]

// Mock Contact Messages
export const mockContactMessages: ContactMessage[] = [
  {
    id: "msg_001",
    name: "Sarah Williams",
    email: "sarah.w@email.com",
    phone: "+1 555 123 4567",
    subject: "Inquiry about Canada Study Permit",
    message: "I am interested in pursuing my Master's degree in Canada. Can you help with the study permit process?",
    isRead: false,
    createdAt: "2024-11-28T15:30:00Z",
  },
  {
    id: "msg_002",
    name: "David Chen",
    email: "david.chen@email.com",
    subject: "SEVIS Fee Payment Help",
    message: "I need assistance with paying my SEVIS fee. What documents do I need?",
    isRead: true,
    createdAt: "2024-11-27T10:00:00Z",
  },
]

// Mock Client Profiles
export const mockClientProfiles: ClientProfile[] = [
  {
    ...mockUsers[0],
    applications: mockApplications.filter((app) => app.clientId === "usr_001"),
    documents: mockDocuments.filter((doc) => doc.clientId === "usr_001"),
    appointments: mockAppointments.filter((apt) => apt.clientId === "usr_001"),
    nationality: "Nigerian",
    currentCountry: "Nigeria",
    dateOfBirth: "1995-05-15",
    address: "123 Main Street, Lagos, Nigeria",
  },
  {
    ...mockUsers[1],
    applications: mockApplications.filter((app) => app.clientId === "usr_002"),
    documents: mockDocuments.filter((doc) => doc.clientId === "usr_002"),
    appointments: mockAppointments.filter((apt) => apt.clientId === "usr_002"),
    nationality: "British",
    currentCountry: "United Kingdom",
    dateOfBirth: "1992-11-20",
    address: "45 Oxford Road, London, UK",
  },
]

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalClients: 156,
  activeApplications: 42,
  pendingDocuments: 18,
  upcomingAppointments: 12,
  completedThisMonth: 8,
  successRate: 98.5,
}

// Mock Countries
export const mockCountries: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
]

// Mock Onboarding Invites
export const mockOnboardingInvites: OnboardingInvite[] = [
  {
    id: "inv_001",
    email: "newclient@email.com",
    serviceTypes: ["education", "immigration"],
    token: "abc123xyz",
    expiresAt: "2024-12-15T23:59:59Z",
    isUsed: false,
    createdAt: "2024-11-28T10:00:00Z",
  },
]

// Mock Chat Messages
export const mockChatMessages: ChatMessage[] = [
  {
    id: "chat_001",
    senderId: "bot",
    senderType: "bot",
    message: "Hello! Welcome to SAMOP Consulting. How can I help you today?",
    timestamp: "2024-11-28T10:00:00Z",
  },
  {
    id: "chat_002",
    senderId: "usr_001",
    senderType: "client",
    message: "I want to check the status of my application.",
    timestamp: "2024-11-28T10:01:00Z",
  },
  {
    id: "chat_003",
    senderId: "bot",
    senderType: "bot",
    message: "I can help you with that! Your MIT application is currently under review. Would you like more details?",
    timestamp: "2024-11-28T10:01:30Z",
  },
]

export const mockAvailability: AvailabilitySchedule[] = [
  {
    id: "avl_001",
    date: getFutureDate(1),
    slots: [
      { start: "09:00", end: "12:00" },
      { start: "14:00", end: "17:00" },
    ],
    isRecurring: false,
    createdAt: "2024-11-01T10:00:00Z",
    updatedAt: "2024-11-01T10:00:00Z",
  },
  {
    id: "avl_002",
    date: getFutureDate(2),
    slots: [
      { start: "10:00", end: "13:00" },
      { start: "15:00", end: "18:00" },
    ],
    isRecurring: false,
    createdAt: "2024-11-01T10:00:00Z",
    updatedAt: "2024-11-01T10:00:00Z",
  },
  {
    id: "avl_003",
    date: getFutureDate(3),
    slots: [
      { start: "09:00", end: "11:00" },
      { start: "13:00", end: "16:00" },
    ],
    isRecurring: false,
    createdAt: "2024-11-01T10:00:00Z",
    updatedAt: "2024-11-01T10:00:00Z",
  },
  {
    id: "avl_004",
    date: getFutureDate(5),
    slots: [
      { start: "09:00", end: "12:00" },
      { start: "14:00", end: "18:00" },
    ],
    isRecurring: false,
    createdAt: "2024-11-01T10:00:00Z",
    updatedAt: "2024-11-01T10:00:00Z",
  },
  {
    id: "avl_005",
    date: getFutureDate(6),
    slots: [{ start: "10:00", end: "14:00" }],
    isRecurring: false,
    createdAt: "2024-11-01T10:00:00Z",
    updatedAt: "2024-11-01T10:00:00Z",
  },
  {
    id: "avl_006",
    date: getFutureDate(7),
    slots: [
      { start: "09:00", end: "12:00" },
      { start: "13:00", end: "17:00" },
    ],
    isRecurring: false,
    createdAt: "2024-11-01T10:00:00Z",
    updatedAt: "2024-11-01T10:00:00Z",
  },
  {
    id: "avl_007",
    date: getFutureDate(8),
    slots: [{ start: "11:00", end: "15:00" }],
    isRecurring: false,
    createdAt: "2024-11-01T10:00:00Z",
    updatedAt: "2024-11-01T10:00:00Z",
  },
  {
    id: "avl_008",
    date: getFutureDate(10),
    slots: [
      { start: "09:00", end: "13:00" },
      { start: "14:00", end: "18:00" },
    ],
    isRecurring: false,
    createdAt: "2024-11-01T10:00:00Z",
    updatedAt: "2024-11-01T10:00:00Z",
  },
]

// Default Weekly Availability Template
export const mockWeeklyAvailability = {
  monday: [
    { start: "09:00", end: "12:00" },
    { start: "14:00", end: "17:00" },
  ],
  tuesday: [
    { start: "09:00", end: "12:00" },
    { start: "14:00", end: "17:00" },
  ],
  wednesday: [
    { start: "10:00", end: "13:00" },
    { start: "15:00", end: "18:00" },
  ],
  thursday: [
    { start: "09:00", end: "12:00" },
    { start: "14:00", end: "17:00" },
  ],
  friday: [
    { start: "09:00", end: "12:00" },
    { start: "14:00", end: "16:00" },
  ],
  saturday: [],
  sunday: [],
}

export const mockAppointmentFees: AppointmentFee[] = [
  {
    id: "fee_001",
    serviceType: "consultation",
    amount: 50,
    currency: "USD",
    description: "Initial Consultation (60 mins)",
  },
  {
    id: "fee_002",
    serviceType: "document_review",
    amount: 75,
    currency: "USD",
    description: "Document Review Session (45 mins)",
  },
  {
    id: "fee_003",
    serviceType: "interview_prep",
    amount: 100,
    currency: "USD",
    description: "Interview Preparation (90 mins)",
  },
  {
    id: "fee_004",
    serviceType: "visa_guidance",
    amount: 60,
    currency: "USD",
    description: "Visa Guidance Session (60 mins)",
  },
]

export const mockAccessCodes: AccessCode[] = [
  {
    id: "ac_001",
    code: "SAMOP-FREE-2024",
    clientEmail: "vip.client@email.com",
    clientName: "VIP Client",
    serviceType: "consultation",
    isUsed: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "usr_003",
    createdAt: new Date().toISOString(),
  },
]

export const mockPayments: Payment[] = []
