// ==========================================
// SAMOP CONSULTING - API FUNCTIONS
// ==========================================

import type {
  ApiResponse,
  AuthResponse,
  User,
  ClientProfile,
  Application,
  ApplicationStatus,
  Document,
  Appointment,
  ContactMessage,
  DashboardStats,
  OnboardingInvite,
  ServiceType,
  AvailabilitySchedule,
  AccessCode,
  AppointmentType,
  Payment,
  PaymentProvider,
  PaginatedResponse,
  ApplicationFormData,
  DocumentUploadQueue,
  ActivityLog,
  DocumentStatus,
} from "./types"

import {
  mockUsers,
  mockClientProfiles,
  mockApplications,
  mockDocuments,
  mockAppointments,
  mockContactMessages,
  mockDashboardStats,
  mockAvailability,
  mockAppointmentFees,
  mockAccessCodes,
  mockApplicationForms,
  mockDocumentQueue,
  mockActivityLogs,
} from "./mock-data"

// Helper function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ==========================================
// AUTHENTICATION APIs
// ==========================================

export async function loginUser(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
  await delay(500)
  const user = mockUsers.find((u) => u.email === email)
  if (user && password === "password123") {
    return {
      success: true,
      data: {
        user,
        token: "mock_jwt_token_" + user.id,
      },
    }
  }
  return {
    success: false,
    error: "Invalid email or password",
  }
}

export async function registerClient(data: {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  token?: string
}): Promise<ApiResponse<AuthResponse>> {
  await delay(500)
  const newUser: User = {
    id: "usr_" + Date.now(),
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    role: "client",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return {
    success: true,
    data: {
      user: newUser,
      token: "mock_jwt_token_" + newUser.id,
    },
  }
}

export async function logout(): Promise<ApiResponse<null>> {
  await delay(200)
  return { success: true }
}

// ==========================================
// CLIENT APIs
// ==========================================

export async function getClients(): Promise<ApiResponse<PaginatedResponse<ClientProfile>>> {
  await delay(400)
  return {
    success: true,
    data: {
      items: mockClientProfiles,
      total: mockClientProfiles.length,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    },
  }
}

export async function getClientById(id: string): Promise<ApiResponse<ClientProfile>> {
  await delay(300)
  const client = mockClientProfiles.find((c) => c.id === id)
  if (client) {
    return { success: true, data: client }
  }
  return { success: false, error: "Client not found" }
}

export async function getClientProfile(userId: string): Promise<ApiResponse<ClientProfile>> {
  await delay(300)
  const profile = mockClientProfiles.find((p) => p.id === userId)
  if (profile) {
    return { success: true, data: profile }
  }
  return { success: false, error: "Profile not found" }
}

export async function updateClientProfile(
  id: string,
  data: Partial<ClientProfile>,
): Promise<ApiResponse<ClientProfile>> {
  await delay(500)
  const profile = mockClientProfiles.find((p) => p.id === id)
  if (profile) {
    const updated = { ...profile, ...data, updatedAt: new Date().toISOString() }
    return { success: true, data: updated, message: "Profile updated successfully!" }
  }
  return { success: false, error: "Profile not found" }
}

export async function deleteClient(id: string): Promise<ApiResponse<null>> {
  await delay(400)
  const index = mockClientProfiles.findIndex((c) => c.id === id)
  if (index !== -1) {
    return { success: true, message: "Client deleted successfully" }
  }
  return { success: false, error: "Client not found" }
}

export async function createOnboardingInvite(data: {
  email: string
  serviceTypes: ServiceType[]
}): Promise<ApiResponse<OnboardingInvite>> {
  await delay(500)
  const invite: OnboardingInvite = {
    id: "inv_" + Date.now(),
    email: data.email,
    serviceTypes: data.serviceTypes,
    token: Math.random().toString(36).substring(2, 15),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isUsed: false,
    createdAt: new Date().toISOString(),
  }
  return { success: true, data: invite, message: "Invitation sent successfully!" }
}

// ==========================================
// APPLICATION APIs
// ==========================================

export async function getApplications(clientId?: string): Promise<ApiResponse<Application[]>> {
  await delay(400)
  let applications = mockApplications
  if (clientId) {
    applications = applications.filter((app) => app.clientId === clientId)
  }
  return { success: true, data: applications }
}

export async function getApplicationById(id: string): Promise<ApiResponse<Application>> {
  await delay(300)
  const application = mockApplications.find((app) => app.id === id)
  if (application) {
    return { success: true, data: application }
  }
  return { success: false, error: "Application not found" }
}

export async function createApplication(data: Partial<Application>): Promise<ApiResponse<Application>> {
  await delay(500)
  const newApp: Application = {
    id: "app_" + Date.now(),
    clientId: data.clientId || "",
    serviceType: data.serviceType || "education",
    status: "draft",
    country: data.country || "",
    institution: data.institution,
    program: data.program,
    educationLevel: data.educationLevel,
    startDate: data.startDate,
    notes: data.notes || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return { success: true, data: newApp, message: "Application created successfully!" }
}

export async function updateApplication(id: string, data: Partial<Application>): Promise<ApiResponse<Application>> {
  await delay(400)
  const application = mockApplications.find((app) => app.id === id)
  if (application) {
    const updated = { ...application, ...data, updatedAt: new Date().toISOString() }
    return { success: true, data: updated, message: "Application updated successfully!" }
  }
  return { success: false, error: "Application not found" }
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  notes?: string,
): Promise<ApiResponse<Application>> {
  await delay(400)
  const application = mockApplications.find((app) => app.id === id)
  if (application) {
    const updated = {
      ...application,
      status,
      adminNotes: notes || application.adminNotes,
      updatedAt: new Date().toISOString(),
    }
    return { success: true, data: updated, message: "Status updated successfully!" }
  }
  return { success: false, error: "Application not found" }
}

export async function deleteApplication(id: string): Promise<ApiResponse<null>> {
  await delay(400)
  const index = mockApplications.findIndex((app) => app.id === id)
  if (index !== -1) {
    return { success: true, message: "Application deleted successfully" }
  }
  return { success: false, error: "Application not found" }
}

// ==========================================
// DOCUMENT APIs
// ==========================================

export async function getDocuments(clientId?: string, applicationId?: string): Promise<ApiResponse<Document[]>> {
  await delay(400)
  let documents = mockDocuments
  if (clientId) {
    documents = documents.filter((doc) => doc.clientId === clientId)
  }
  if (applicationId) {
    documents = documents.filter((doc) => doc.applicationId === applicationId)
  }
  return { success: true, data: documents }
}

export async function getDocumentById(id: string): Promise<ApiResponse<Document>> {
  await delay(300)
  const document = mockDocuments.find((doc) => doc.id === id)
  if (document) {
    return { success: true, data: document }
  }
  return { success: false, error: "Document not found" }
}

export async function uploadDocument(data: {
  applicationId: string
  clientId: string
  type: Document["type"]
  name: string
  file: File
}): Promise<ApiResponse<Document>> {
  await delay(800)
  const newDoc: Document = {
    id: "doc_" + Date.now(),
    applicationId: data.applicationId,
    clientId: data.clientId,
    type: data.type,
    name: data.name,
    url: `/documents/${data.name}`,
    status: "pending",
    uploadedAt: new Date().toISOString(),
  }
  return { success: true, data: newDoc, message: "Document uploaded successfully!" }
}

export async function updateDocumentStatus(
  id: string,
  status: Document["status"],
  feedback?: string,
  adminNotes?: string,
): Promise<ApiResponse<Document>> {
  await delay(400)
  const document = mockDocuments.find((doc) => doc.id === id)
  if (document) {
    const updated = {
      ...document,
      status,
      feedback,
      adminNotes: adminNotes || document.adminNotes,
      reviewedAt: new Date().toISOString(),
    }
    return { success: true, data: updated, message: "Document status updated!" }
  }
  return { success: false, error: "Document not found" }
}

export async function deleteDocument(id: string): Promise<ApiResponse<null>> {
  await delay(400)
  const index = mockDocuments.findIndex((doc) => doc.id === id)
  if (index !== -1) {
    return { success: true, message: "Document deleted successfully" }
  }
  return { success: false, error: "Document not found" }
}

// Document Upload Queue
export async function getDocumentQueue(clientId: string): Promise<ApiResponse<DocumentUploadQueue[]>> {
  await delay(300)
  const queue = mockDocumentQueue.filter((q) => q.clientId === clientId)
  return { success: true, data: queue }
}

export async function addToDocumentQueue(data: {
  clientId: string
  applicationId: string
  fileName: string
  fileSize: number
  documentType: Document["type"]
}): Promise<ApiResponse<DocumentUploadQueue>> {
  await delay(200)
  const queueItem: DocumentUploadQueue = {
    id: "queue_" + Date.now(),
    clientId: data.clientId,
    applicationId: data.applicationId,
    fileName: data.fileName,
    fileSize: data.fileSize,
    documentType: data.documentType,
    status: "uploading",
    progress: 0,
    createdAt: new Date().toISOString(),
  }
  return { success: true, data: queueItem }
}

// Document Review
export async function reviewDocument(
  docId: string,
  data: {
    status: DocumentStatus
    feedback?: string
    adminNotes?: string
    reviewedBy: string
  },
): Promise<ApiResponse<Document>> {
  await delay(500)
  const doc = mockDocuments.find((d) => d.id === docId)
  if (!doc) {
    return { success: false, error: "Document not found" }
  }

  const updated = {
    ...doc,
    status: data.status,
    feedback: data.feedback,
    adminNotes: data.adminNotes,
  }

  const index = mockDocuments.findIndex((d) => d.id === docId)
  if (index !== -1) {
    mockDocuments[index] = updated
  }

  return { success: true, data: updated, message: "Document reviewed successfully!" }
}

// ==========================================
// APPOINTMENT APIs
// ==========================================

export async function getAppointments(clientId?: string): Promise<ApiResponse<Appointment[]>> {
  await delay(400)
  let appointments = mockAppointments
  if (clientId) {
    appointments = appointments.filter((apt) => apt.clientId === clientId)
  }
  return { success: true, data: appointments }
}

export async function getAppointmentById(id: string): Promise<ApiResponse<Appointment>> {
  await delay(300)
  const appointment = mockAppointments.find((apt) => apt.id === id)
  if (appointment) {
    return { success: true, data: appointment }
  }
  return { success: false, error: "Appointment not found" }
}

export async function createAppointment(data: Partial<Appointment>): Promise<ApiResponse<Appointment>> {
  await delay(500)
  const newApt: Appointment = {
    id: "apt_" + Date.now(),
    clientId: data.clientId,
    clientName: data.clientName || "",
    clientEmail: data.clientEmail || "",
    clientPhone: data.clientPhone || "",
    type: data.type || "consultation",
    status: "scheduled",
    date: data.date || "",
    time: data.time || "",
    duration: data.duration || 60,
    notes: data.notes,
    createdAt: new Date().toISOString(),
  }
  return { success: true, data: newApt, message: "Appointment created successfully!" }
}

export async function createAppointmentWithPayment(data: {
  name: string
  email: string
  phone: string
  serviceType: string
  date: string
  time: string
  notes?: string
  paymentMethod: "stripe" | "paypal" | "paystack" | "flutterwave"
  accessCode?: string
}): Promise<ApiResponse<Appointment & { paymentId?: string }>> {
  await delay(800)

  // Mock payment processing
  const paymentId = data.accessCode ? undefined : "pay_" + Date.now()

  const newApt: Appointment = {
    id: "apt_" + Date.now(),
    clientId: undefined,
    clientName: data.name,
    clientEmail: data.email,
    clientPhone: data.phone,
    type: data.serviceType as AppointmentType,
    status: "scheduled",
    date: data.date,
    time: data.time,
    duration: 60,
    notes: data.notes,
    createdAt: new Date().toISOString(),
  }

  return {
    success: true,
    data: { ...newApt, paymentId },
    message: data.accessCode
      ? "Appointment booked successfully with access code!"
      : "Payment processed and appointment booked successfully!",
  }
}

export async function updateAppointment(id: string, data: Partial<Appointment>): Promise<ApiResponse<Appointment>> {
  await delay(400)
  const appointment = mockAppointments.find((apt) => apt.id === id)
  if (appointment) {
    const updated = { ...appointment, ...data }
    return { success: true, data: updated, message: "Appointment updated successfully!" }
  }
  return { success: false, error: "Appointment not found" }
}

export async function updateAppointmentStatus(
  id: string,
  status: Appointment["status"],
): Promise<ApiResponse<Appointment>> {
  await delay(400)
  const appointment = mockAppointments.find((apt) => apt.id === id)
  if (appointment) {
    const updated = { ...appointment, status }
    return { success: true, data: updated, message: "Status updated!" }
  }
  return { success: false, error: "Appointment not found" }
}

export async function deleteAppointment(id: string): Promise<ApiResponse<null>> {
  await delay(400)
  const index = mockAppointments.findIndex((apt) => apt.id === id)
  if (index !== -1) {
    return { success: true, message: "Appointment deleted successfully" }
  }
  return { success: false, error: "Appointment not found" }
}

// Admin create appointment for client (no payment required)
export async function adminCreateAppointment(data: {
  clientId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  type: AppointmentType
  date: string
  time: string
  duration: number
  notes?: string
}): Promise<ApiResponse<Appointment>> {
  await delay(500)
  const newApt: Appointment = {
    id: "apt_" + Date.now(),
    ...data,
    status: "scheduled",
    createdAt: new Date().toISOString(),
  }
  return { success: true, data: newApt, message: "Appointment scheduled for client!" }
}

// ==========================================
// CONTACT MESSAGE APIs
// ==========================================

export async function getContactMessages(): Promise<ApiResponse<ContactMessage[]>> {
  await delay(400)
  return { success: true, data: mockContactMessages }
}

export async function getContactMessageById(id: string): Promise<ApiResponse<ContactMessage>> {
  await delay(300)
  const message = mockContactMessages.find((msg) => msg.id === id)
  if (message) {
    return { success: true, data: message }
  }
  return { success: false, error: "Message not found" }
}

export async function submitContactMessage(data: {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}): Promise<ApiResponse<ContactMessage>> {
  await delay(500)
  const newMessage: ContactMessage = {
    id: "msg_" + Date.now(),
    ...data,
    isRead: false,
    createdAt: new Date().toISOString(),
  }
  return { success: true, data: newMessage, message: "Message sent successfully!" }
}

export const submitContactForm = submitContactMessage

export async function markMessageAsRead(id: string): Promise<ApiResponse<ContactMessage>> {
  await delay(300)
  const message = mockContactMessages.find((msg) => msg.id === id)
  if (message) {
    const updated = { ...message, isRead: true }
    return { success: true, data: updated }
  }
  return { success: false, error: "Message not found" }
}

export async function replyToMessage(id: string, reply: string): Promise<ApiResponse<ContactMessage>> {
  await delay(500)
  const message = mockContactMessages.find((msg) => msg.id === id)
  if (message) {
    const updated = {
      ...message,
      reply,
      repliedAt: new Date().toISOString(),
      isRead: true,
    }
    return { success: true, data: updated, message: "Reply sent successfully!" }
  }
  return { success: false, error: "Message not found" }
}

export async function deleteContactMessage(id: string): Promise<ApiResponse<null>> {
  await delay(400)
  const index = mockContactMessages.findIndex((msg) => msg.id === id)
  if (index !== -1) {
    return { success: true, message: "Message deleted successfully" }
  }
  return { success: false, error: "Message not found" }
}

// ==========================================
// DASHBOARD APIs
// ==========================================

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  await delay(400)
  return { success: true, data: mockDashboardStats }
}

export async function getClientDashboardStats(clientId: string): Promise<
  ApiResponse<{
    activeApplications: number
    documentsApproved: number
    totalDocuments: number
    pendingActions: number
    upcomingAppointments: number
  }>
> {
  await delay(300)
  const profile = mockClientProfiles.find((p) => p.id === clientId)
  if (profile) {
    return {
      success: true,
      data: {
        activeApplications: profile.applications.length,
        documentsApproved: profile.documents.filter((d) => d.status === "approved").length,
        totalDocuments: profile.documents.length,
        pendingActions: profile.documents.filter((d) => d.status === "requires_update").length,
        upcomingAppointments: profile.appointments.filter((a) => a.status === "scheduled").length,
      },
    }
  }
  return { success: false, error: "Profile not found" }
}

// ==========================================
// AVAILABILITY APIs
// ==========================================

export async function getAvailability(
  startDate?: string,
  endDate?: string,
): Promise<ApiResponse<AvailabilitySchedule[]>> {
  await delay(400)
  let availability = mockAvailability
  if (startDate && endDate) {
    availability = availability.filter((a) => a.date >= startDate && a.date <= endDate)
  }
  return { success: true, data: availability }
}

export async function setAvailability(data: {
  date: string
  slots: { start: string; end: string }[]
}): Promise<ApiResponse<AvailabilitySchedule>> {
  await delay(500)
  const existing = mockAvailability.find((a) => a.date === data.date)
  if (existing) {
    const updated = { ...existing, slots: data.slots, updatedAt: new Date().toISOString() }
    return { success: true, data: updated, message: "Availability updated!" }
  }
  const newAvailability: AvailabilitySchedule = {
    id: "avl_" + Date.now(),
    date: data.date,
    slots: data.slots,
    isRecurring: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return { success: true, data: newAvailability, message: "Availability set!" }
}

export async function deleteAvailability(id: string): Promise<ApiResponse<null>> {
  await delay(400)
  return { success: true, message: "Availability deleted" }
}

export async function getAvailableSlots(date: string): Promise<ApiResponse<string[]>> {
  await delay(300)
  const availability = mockAvailability.find((a) => a.date === date)
  if (!availability) {
    return { success: true, data: [] }
  }
  const slots: string[] = []
  availability.slots.forEach((slot) => {
    let current = slot.start
    while (current < slot.end) {
      slots.push(current)
      const [hours, minutes] = current.split(":").map(Number)
      const nextMinutes = minutes + 30
      if (nextMinutes >= 60) {
        current = `${String(hours + 1).padStart(2, "0")}:00`
      } else {
        current = `${String(hours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}`
      }
    }
  })
  return { success: true, data: slots }
}

export const getAvailableBookingSlots = getAvailableSlots

export async function getWeeklyAvailability(): Promise<ApiResponse<AvailabilitySchedule[]>> {
  await delay(400)
  // Return availability for the next 4 weeks
  const today = new Date()
  const fourWeeksLater = new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000)
  const startDate = today.toISOString().split("T")[0]
  const endDate = fourWeeksLater.toISOString().split("T")[0]

  const availability = mockAvailability.filter((a) => a.date >= startDate && a.date <= endDate)
  return { success: true, data: availability }
}

// ==========================================
// ACCESS CODE APIs
// ==========================================

export async function getAccessCodes(): Promise<ApiResponse<AccessCode[]>> {
  await delay(400)
  return { success: true, data: mockAccessCodes }
}

export async function createAccessCode(data: {
  clientEmail: string
  clientName: string
  serviceType: AppointmentType
  expiresInDays?: number
}): Promise<ApiResponse<AccessCode>> {
  await delay(500)
  const code = `SAMOP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  const newCode: AccessCode = {
    id: "ac_" + Date.now(),
    code,
    clientEmail: data.clientEmail,
    clientName: data.clientName,
    serviceType: data.serviceType,
    isUsed: false,
    expiresAt: new Date(Date.now() + (data.expiresInDays || 7) * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin",
    createdAt: new Date().toISOString(),
  }
  return { success: true, data: newCode, message: "Access code created!" }
}

export async function validateAccessCode(code: string): Promise<ApiResponse<AccessCode>> {
  await delay(300)
  const accessCode = mockAccessCodes.find((ac) => ac.code === code && !ac.isUsed)
  if (accessCode && new Date(accessCode.expiresAt) > new Date()) {
    return { success: true, data: accessCode }
  }
  return { success: false, error: "Invalid or expired access code" }
}

export async function markAccessCodeAsUsed(code: string): Promise<ApiResponse<AccessCode>> {
  await delay(300)
  const accessCode = mockAccessCodes.find((ac) => ac.code === code)
  if (accessCode) {
    const updated = { ...accessCode, isUsed: true }
    return { success: true, data: updated }
  }
  return { success: false, error: "Access code not found" }
}

export async function deleteAccessCode(id: string): Promise<ApiResponse<null>> {
  await delay(400)
  return { success: true, message: "Access code deleted" }
}

// ==========================================
// PAYMENT APIs
// ==========================================

export async function getAppointmentFees(): Promise<ApiResponse<typeof mockAppointmentFees>> {
  await delay(300)
  return { success: true, data: mockAppointmentFees }
}

export async function initiatePayment(data: {
  appointmentId: string
  amount: number
  currency: string
  provider: PaymentProvider
}): Promise<ApiResponse<Payment>> {
  await delay(500)
  const payment: Payment = {
    id: "pay_" + Date.now(),
    appointmentId: data.appointmentId,
    amount: data.amount,
    currency: data.currency,
    provider: data.provider,
    status: "pending",
    reference: `REF-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  return { success: true, data: payment }
}

export async function verifyPayment(reference: string): Promise<ApiResponse<Payment>> {
  await delay(800)
  return {
    success: true,
    data: {
      id: "pay_" + Date.now(),
      appointmentId: "",
      amount: 50,
      currency: "USD",
      provider: "stripe",
      status: "completed",
      reference,
      createdAt: new Date().toISOString(),
    },
    message: "Payment verified!",
  }
}

// ==========================================
// APPLICATION FORM APIs
// ==========================================

export async function getApplicationForms(clientId?: string): Promise<ApiResponse<ApplicationFormData[]>> {
  await delay(400)
  let forms = mockApplicationForms
  if (clientId) {
    forms = forms.filter((f) => f.clientId === clientId)
  }
  return { success: true, data: forms }
}

export async function getApplicationFormById(id: string): Promise<ApiResponse<ApplicationFormData>> {
  await delay(300)
  const form = mockApplicationForms.find((f) => f.id === id)
  if (form) {
    return { success: true, data: form }
  }
  return { success: false, error: "Application form not found" }
}

export async function createApplicationForm(
  data: Partial<ApplicationFormData>,
): Promise<ApiResponse<ApplicationFormData>> {
  await delay(500)
  const newForm: ApplicationFormData = {
    id: "form_" + Date.now(),
    clientId: data.clientId || "",
    status: "draft",
    serviceType: data.serviceType || "education",
    educationLevel: data.educationLevel,
    personalInfo: data.personalInfo || {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "male",
      nationality: "",
      countryOfResidence: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      phone: "",
      email: "",
      maritalStatus: "single",
    },
    educationHistory: data.educationHistory || [],
    workExperience: data.workExperience || [],
    testScores: data.testScores || [],
    preferredCountries: data.preferredCountries || [],
    intakePreference: data.intakePreference || "",
    requiredDocuments: data.requiredDocuments || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return { success: true, data: newForm, message: "Application form created!" }
}

export async function updateApplicationForm(
  id: string,
  data: Partial<ApplicationFormData>,
): Promise<ApiResponse<ApplicationFormData>> {
  await delay(500)
  const form = mockApplicationForms.find((f) => f.id === id)
  if (form) {
    const updated = { ...form, ...data, updatedAt: new Date().toISOString() }
    return { success: true, data: updated, message: "Application form saved!" }
  }
  return { success: false, error: "Application form not found" }
}

export async function submitApplicationForm(id: string): Promise<ApiResponse<ApplicationFormData>> {
  await delay(500)
  const form = mockApplicationForms.find((f) => f.id === id)
  if (form) {
    const updated = {
      ...form,
      status: "submitted" as const,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return { success: true, data: updated, message: "Application submitted successfully!" }
  }
  return { success: false, error: "Application form not found" }
}

export async function reviewApplicationForm(
  id: string,
  review: {
    status: "pending" | "approved" | "needs_revision" | "rejected"
    comments: string
    reviewedBy: string
  },
): Promise<ApiResponse<ApplicationFormData>> {
  await delay(500)
  const form = mockApplicationForms.find((f) => f.id === id)
  if (form) {
    const updated = {
      ...form,
      adminReview: {
        ...review,
        reviewedAt: new Date().toISOString(),
      },
      status: review.status === "approved" ? "approved" : review.status === "rejected" ? "rejected" : "under_review",
      updatedAt: new Date().toISOString(),
    }
    return { success: true, data: updated as ApplicationFormData, message: "Review submitted!" }
  }
  return { success: false, error: "Application form not found" }
}

// ==========================================
// ACTIVITY LOG APIs
// ==========================================

export async function getActivityLogs(entityType?: string, entityId?: string): Promise<ApiResponse<ActivityLog[]>> {
  await delay(400)
  let logs = mockActivityLogs
  if (entityType) {
    logs = logs.filter((l) => l.entityType === entityType)
  }
  if (entityId) {
    logs = logs.filter((l) => l.entityId === entityId)
  }
  return { success: true, data: logs }
}

export async function createActivityLog(data: {
  entityType: "client" | "application" | "document" | "appointment"
  entityId: string
  action: string
  performedBy: string
  performedByRole: "client" | "admin"
  details?: string
}): Promise<ApiResponse<ActivityLog>> {
  await delay(200)
  const log: ActivityLog = {
    id: "log_" + Date.now(),
    ...data,
    createdAt: new Date().toISOString(),
  }
  return { success: true, data: log }
}

// ==========================================
// SETTINGS APIs
// ==========================================

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<ApiResponse<null>> {
  await delay(500)
  // Mock validation - in real app, verify current password
  if (currentPassword === "password123") {
    return { success: true, message: "Password changed successfully!" }
  }
  return { success: false, error: "Current password is incorrect" }
}

export async function getNotificationPreferences(userId: string): Promise<
  ApiResponse<{
    emailNotifications: boolean
    smsNotifications: boolean
    applicationUpdates: boolean
    documentReminders: boolean
    appointmentReminders: boolean
    marketingEmails: boolean
  }>
> {
  await delay(300)
  // Return default preferences
  return {
    success: true,
    data: {
      emailNotifications: true,
      smsNotifications: false,
      applicationUpdates: true,
      documentReminders: true,
      appointmentReminders: true,
      marketingEmails: false,
    },
  }
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<{
    emailNotifications: boolean
    smsNotifications: boolean
    applicationUpdates: boolean
    documentReminders: boolean
    appointmentReminders: boolean
    marketingEmails: boolean
  }>,
): Promise<ApiResponse<null>> {
  await delay(400)
  return { success: true, message: "Notification preferences updated!" }
}
