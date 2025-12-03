// ==========================================
// SAMOP CONSULTING - MOCK API FUNCTIONS
// ==========================================

import type {
  User,
  AuthResponse,
  Service,
  Application,
  Document,
  Appointment,
  ContactMessage,
  ClientProfile,
  DashboardStats,
  Country,
  OnboardingInvite,
  ApiResponse,
  PaginatedResponse,
  ServiceType,
  ApplicationStatus,
  AvailabilitySchedule,
  TimeSlot,
  BookingSlot,
  AppointmentFee,
  AccessCode,
  Payment,
  PaymentProvider,
} from "./types"

import {
  mockUsers,
  mockServices,
  mockApplications,
  mockDocuments,
  mockAppointments,
  mockContactMessages,
  mockClientProfiles,
  mockDashboardStats,
  mockCountries,
  mockOnboardingInvites,
  mockAvailability,
  mockWeeklyAvailability,
  mockAppointmentFees,
  mockAccessCodes,
} from "./mock-data"

// Simulate API delay
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
  return { success: false, error: "Invalid credentials" }
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

export async function getCurrentUser(token: string): Promise<ApiResponse<User>> {
  await delay(300)
  const userId = token.replace("mock_jwt_token_", "")
  const user = mockUsers.find((u) => u.id === userId)
  if (user) {
    return { success: true, data: user }
  }
  return { success: false, error: "User not found" }
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

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<ApiResponse<null>> {
  await delay(500)
  if (currentPassword === "password123") {
    return { success: true, data: null, message: "Password changed successfully!" }
  }
  return { success: false, error: "Current password is incorrect" }
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
      notes: notes || application.notes,
      updatedAt: new Date().toISOString(),
    }
    return { success: true, data: updated }
  }
  return { success: false, error: "Application not found" }
}

export async function createApplication(data: Partial<Application>): Promise<ApiResponse<Application>> {
  await delay(500)
  const newApp: Application = {
    id: "app_" + Date.now(),
    clientId: data.clientId || "",
    serviceType: data.serviceType || "education",
    status: "pending",
    country: data.country || "",
    institution: data.institution,
    program: data.program,
    educationLevel: data.educationLevel,
    startDate: data.startDate,
    notes: data.notes || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return { success: true, data: newApp }
}

// ==========================================
// DOCUMENT APIs
// ==========================================

export async function getDocuments(applicationId?: string): Promise<ApiResponse<Document[]>> {
  await delay(400)
  let documents = mockDocuments
  if (applicationId) {
    documents = documents.filter((doc) => doc.applicationId === applicationId)
  }
  return { success: true, data: documents }
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
  return { success: true, data: newDoc }
}

export async function updateDocumentStatus(
  id: string,
  status: Document["status"],
  feedback?: string,
): Promise<ApiResponse<Document>> {
  await delay(400)
  const document = mockDocuments.find((doc) => doc.id === id)
  if (document) {
    const updated = { ...document, status, feedback }
    return { success: true, data: updated }
  }
  return { success: false, error: "Document not found" }
}

// ==========================================
// APPOINTMENT APIs
// ==========================================

export async function getAppointments(): Promise<ApiResponse<Appointment[]>> {
  await delay(400)
  return { success: true, data: mockAppointments }
}

export async function createAppointment(data: {
  clientName: string
  clientEmail: string
  clientPhone: string
  type: Appointment["type"]
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
  return { success: true, data: newApt, message: "Appointment booked successfully!" }
}

export async function updateAppointmentStatus(
  id: string,
  status: Appointment["status"],
): Promise<ApiResponse<Appointment>> {
  await delay(400)
  const appointment = mockAppointments.find((apt) => apt.id === id)
  if (appointment) {
    const updated = { ...appointment, status }
    return { success: true, data: updated }
  }
  return { success: false, error: "Appointment not found" }
}

// ==========================================
// CONTACT/MESSAGE APIs
// ==========================================

export async function getContactMessages(): Promise<ApiResponse<ContactMessage[]>> {
  await delay(400)
  return { success: true, data: mockContactMessages }
}

export async function submitContactForm(data: {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}): Promise<ApiResponse<ContactMessage>> {
  await delay(500)
  const newMsg: ContactMessage = {
    id: "msg_" + Date.now(),
    ...data,
    isRead: false,
    createdAt: new Date().toISOString(),
  }
  return { success: true, data: newMsg, message: "Message sent successfully!" }
}

export async function markMessageAsRead(id: string): Promise<ApiResponse<ContactMessage>> {
  await delay(300)
  const message = mockContactMessages.find((msg) => msg.id === id)
  if (message) {
    const updated = { ...message, isRead: true }
    return { success: true, data: updated }
  }
  return { success: false, error: "Message not found" }
}

// ==========================================
// SERVICE APIs
// ==========================================

export async function getServices(): Promise<ApiResponse<Service[]>> {
  await delay(300)
  return { success: true, data: mockServices }
}

// ==========================================
// DASHBOARD APIs
// ==========================================

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  await delay(400)
  return { success: true, data: mockDashboardStats }
}

// ==========================================
// ONBOARDING APIs
// ==========================================

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

export async function validateInviteToken(token: string): Promise<ApiResponse<OnboardingInvite>> {
  await delay(300)
  const invite = mockOnboardingInvites.find((inv) => inv.token === token && !inv.isUsed)
  if (invite && new Date(invite.expiresAt) > new Date()) {
    return { success: true, data: invite }
  }
  return { success: false, error: "Invalid or expired invitation" }
}

// ==========================================
// COUNTRY/UTILITY APIs
// ==========================================

export async function getCountries(): Promise<ApiResponse<Country[]>> {
  await delay(200)
  return { success: true, data: mockCountries }
}

// ==========================================
// AVAILABILITY APIs
// ==========================================

export async function getAvailability(
  startDate?: string,
  endDate?: string,
): Promise<ApiResponse<AvailabilitySchedule[]>> {
  await delay(400)
  let availability = [...mockAvailability]

  if (startDate) {
    availability = availability.filter((a) => a.date >= startDate)
  }
  if (endDate) {
    availability = availability.filter((a) => a.date <= endDate)
  }

  return { success: true, data: availability }
}

export async function getAvailabilityForDate(date: string): Promise<ApiResponse<AvailabilitySchedule | null>> {
  await delay(300)
  const availability = mockAvailability.find((a) => a.date === date)
  return { success: true, data: availability || null }
}

export async function setAvailability(data: {
  date: string
  slots: TimeSlot[]
}): Promise<ApiResponse<AvailabilitySchedule>> {
  await delay(500)
  const newAvailability: AvailabilitySchedule = {
    id: "avl_" + Date.now(),
    date: data.date,
    slots: data.slots,
    isRecurring: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return { success: true, data: newAvailability, message: "Availability updated successfully!" }
}

export async function deleteAvailability(id: string): Promise<ApiResponse<null>> {
  await delay(300)
  return { success: true, data: null, message: "Availability deleted successfully!" }
}

export async function getWeeklyAvailability(): Promise<ApiResponse<typeof mockWeeklyAvailability>> {
  await delay(300)
  return { success: true, data: mockWeeklyAvailability }
}

export async function updateWeeklyAvailability(
  data: typeof mockWeeklyAvailability,
): Promise<ApiResponse<typeof mockWeeklyAvailability>> {
  await delay(500)
  return { success: true, data, message: "Weekly schedule updated successfully!" }
}

export async function getAvailableBookingSlots(date: string): Promise<ApiResponse<BookingSlot[]>> {
  await delay(400)
  const availability = mockAvailability.find((a) => a.date === date)
  const bookedTimes = mockAppointments
    .filter((apt) => apt.date === date && apt.status === "scheduled")
    .map((apt) => apt.time)

  const slots: BookingSlot[] = []

  if (availability) {
    availability.slots.forEach((slot) => {
      // Generate 30-min slots within each time range
      let current = slot.start
      while (current < slot.end) {
        slots.push({
          date,
          time: current,
          available: !bookedTimes.includes(current),
        })
        // Add 30 minutes
        const [hours, mins] = current.split(":").map(Number)
        const totalMins = hours * 60 + mins + 30
        current = `${String(Math.floor(totalMins / 60)).padStart(2, "0")}:${String(totalMins % 60).padStart(2, "0")}`
      }
    })
  }

  return { success: true, data: slots }
}

// ==========================================
// NOTIFICATION PREFERENCES APIs
// ==========================================

export async function getNotificationPreferences(userId: string): Promise<
  ApiResponse<{
    email: boolean
    sms: boolean
    statusUpdates: boolean
    appointments: boolean
    marketing: boolean
  }>
> {
  await delay(300)
  return {
    success: true,
    data: {
      email: true,
      sms: true,
      statusUpdates: true,
      appointments: true,
      marketing: false,
    },
  }
}

export async function updateNotificationPreferences(
  userId: string,
  prefs: {
    email?: boolean
    sms?: boolean
    statusUpdates?: boolean
    appointments?: boolean
    marketing?: boolean
  },
): Promise<ApiResponse<null>> {
  await delay(400)
  return { success: true, data: null, message: "Preferences updated successfully!" }
}

// ==========================================
// APPOINTMENT FEES APIs
// ==========================================

export async function getAppointmentFees(): Promise<ApiResponse<AppointmentFee[]>> {
  await delay(200)
  return { success: true, data: mockAppointmentFees }
}

export async function getAppointmentFee(serviceType: string): Promise<ApiResponse<AppointmentFee | null>> {
  await delay(200)
  const fee = mockAppointmentFees.find((f) => f.serviceType === serviceType)
  return { success: true, data: fee || null }
}

// ==========================================
// ACCESS CODE APIs
// ==========================================

export async function getAccessCodes(): Promise<ApiResponse<AccessCode[]>> {
  await delay(300)
  return { success: true, data: mockAccessCodes }
}

export async function createAccessCode(data: {
  clientEmail: string
  clientName: string
  serviceType: string
  expiresInDays: number
}): Promise<ApiResponse<AccessCode>> {
  await delay(500)
  const code: AccessCode = {
    id: "ac_" + Date.now(),
    code: "SAMOP-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    clientEmail: data.clientEmail,
    clientName: data.clientName,
    serviceType: data.serviceType as any,
    isUsed: false,
    expiresAt: new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin",
    createdAt: new Date().toISOString(),
  }
  mockAccessCodes.push(code)
  return { success: true, data: code, message: "Access code created and sent to client!" }
}

export async function validateAccessCode(code: string): Promise<ApiResponse<AccessCode | null>> {
  await delay(300)
  const accessCode = mockAccessCodes.find((ac) => ac.code === code && !ac.isUsed && new Date(ac.expiresAt) > new Date())
  if (accessCode) {
    return { success: true, data: accessCode }
  }
  return { success: false, error: "Invalid or expired access code" }
}

export async function markAccessCodeAsUsed(code: string): Promise<ApiResponse<null>> {
  await delay(300)
  const accessCode = mockAccessCodes.find((ac) => ac.code === code)
  if (accessCode) {
    accessCode.isUsed = true
    return { success: true, data: null }
  }
  return { success: false, error: "Access code not found" }
}

// ==========================================
// PAYMENT APIs
// ==========================================

export async function initiatePayment(data: {
  appointmentId: string
  amount: number
  currency: string
  provider: PaymentProvider
  email: string
}): Promise<ApiResponse<{ reference: string; paymentUrl: string }>> {
  await delay(500)
  const reference = "PAY-" + Date.now() + "-" + Math.random().toString(36).substring(2, 8).toUpperCase()

  // Mock payment URLs for different providers
  const paymentUrls: Record<PaymentProvider, string> = {
    paystack: `https://paystack.com/pay/${reference}`,
    flutterwave: `https://flutterwave.com/pay/${reference}`,
    paypal: `https://paypal.com/checkout/${reference}`,
    stripe: `https://checkout.stripe.com/${reference}`,
  }

  return {
    success: true,
    data: {
      reference,
      paymentUrl: paymentUrls[data.provider],
    },
  }
}

export async function verifyPayment(reference: string): Promise<ApiResponse<Payment>> {
  await delay(500)
  // Mock successful payment verification
  const payment: Payment = {
    id: "pmt_" + Date.now(),
    appointmentId: "apt_pending",
    amount: 50,
    currency: "USD",
    provider: "stripe",
    status: "completed",
    reference,
    createdAt: new Date().toISOString(),
  }
  return { success: true, data: payment }
}

export async function createAppointmentWithPayment(data: {
  clientName: string
  clientEmail: string
  clientPhone: string
  type: Appointment["type"]
  date: string
  time: string
  duration: number
  notes?: string
  paymentReference?: string
  accessCode?: string
}): Promise<ApiResponse<Appointment>> {
  await delay(500)
  const newApt: Appointment = {
    id: "apt_" + Date.now(),
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    clientPhone: data.clientPhone,
    type: data.type,
    date: data.date,
    time: data.time,
    duration: data.duration,
    notes: data.notes,
    status: "scheduled",
    createdAt: new Date().toISOString(),
  }

  // If access code was used, mark it as used
  if (data.accessCode) {
    const accessCodeResult = await markAccessCodeAsUsed(data.accessCode)
    if (!accessCodeResult.success) {
      return accessCodeResult
    }
  }

  return { success: true, data: newApt, message: "Appointment booked successfully!" }
}

export async function adminScheduleAppointment(data: {
  clientId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  type: Appointment["type"]
  date: string
  time: string
  duration: number
  notes?: string
  sendAccessCode: boolean
}): Promise<ApiResponse<{ appointment: Appointment; accessCode?: AccessCode }>> {
  await delay(500)
  const newApt: Appointment = {
    id: "apt_" + Date.now(),
    clientId: data.clientId,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    clientPhone: data.clientPhone,
    type: data.type,
    date: data.date,
    time: data.time,
    duration: data.duration,
    notes: data.notes,
    status: "scheduled",
    createdAt: new Date().toISOString(),
  }

  let accessCode: AccessCode | undefined
  if (data.sendAccessCode) {
    const result = await createAccessCode({
      clientEmail: data.clientEmail,
      clientName: data.clientName,
      serviceType: data.type,
      expiresInDays: 7,
    })
    if (result.success && result.data) {
      accessCode = result.data
    }
  }

  return {
    success: true,
    data: { appointment: newApt, accessCode },
    message: accessCode
      ? "Appointment scheduled and access code sent to client!"
      : "Appointment scheduled successfully!",
  }
}
