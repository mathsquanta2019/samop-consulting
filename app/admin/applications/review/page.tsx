"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  FileTextIcon,
  UserIcon,
  GraduationCapIcon,
  BriefcaseIcon,
  GlobeIcon,
  MailIcon,
  CalendarIcon,
  ClockIcon,
  MessageSquareIcon,
  SendIcon,
} from "@/components/icons"
import type { ApplicationFormData, AppointmentType } from "@/lib/types"
import {
  getApplicationFormById,
  reviewApplicationForm,
  sendEmailToClient,
  adminCreateAppointment,
  getAvailableSlots,
  requestMoreInformation,
  requestDocuments,
} from "@/lib/api"

type ReviewAction = "approve" | "reject" | "request_revision" | "request_documents" | "request_info"

interface ReviewHistoryItem {
  id: string
  action: string
  status: string
  comments?: string
  details?: string[]
  reviewedBy: string
  reviewedAt: string
}

export default function ApplicationReviewPage() {
  const searchParams = useSearchParams()
  const applicationId = searchParams.get("id")

  const [form, setForm] = useState<ApplicationFormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reviewAction, setReviewAction] = useState<ReviewAction>("approve")
  const [reviewComments, setReviewComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Review history state
  const [reviewHistory, setReviewHistory] = useState<ReviewHistoryItem[]>([])

  // Dialog states
  const [infoDialogOpen, setInfoDialogOpen] = useState(false)
  const [docsDialogOpen, setDocsDialogOpen] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false)

  // Form states for dialogs
  const [selectedInfoFields, setSelectedInfoFields] = useState<string[]>([])
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([])
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [meetingDate, setMeetingDate] = useState("")
  const [meetingTime, setMeetingTime] = useState("")
  const [meetingType, setMeetingType] = useState<AppointmentType>("consultation")
  const [meetingNotes, setMeetingNotes] = useState("")
  const [availableSlots, setAvailableSlots] = useState<string[]>([])

  useEffect(() => {
    if (applicationId) {
      loadApplication()
    }
  }, [applicationId])

  const loadApplication = async () => {
    if (!applicationId) return
    setIsLoading(true)
    const result = await getApplicationFormById(applicationId)
    if (result.success && result.data) {
      setForm(result.data)
      // Load existing review history from form if available
      if (result.data.adminReview) {
        setReviewHistory([
          {
            id: "review_1",
            action: "review",
            status: result.data.status,
            comments: result.data.adminReview.comments,
            reviewedBy: result.data.adminReview.reviewedBy,
            reviewedAt: result.data.adminReview.reviewedAt,
          },
        ])
      }
    }
    setIsLoading(false)
  }

  const addToHistory = (action: string, status: string, comments?: string, details?: string[]) => {
    const newItem: ReviewHistoryItem = {
      id: `history_${Date.now()}`,
      action,
      status,
      comments,
      details,
      reviewedBy: "Admin User",
      reviewedAt: new Date().toISOString(),
    }
    setReviewHistory((prev) => [newItem, ...prev])
  }

  const handleReviewSubmit = async () => {
    if (!form || !reviewComments) return
    setIsSubmitting(true)

    const statusMap: Record<ReviewAction, string> = {
      approve: "approved",
      reject: "rejected",
      request_revision: "revision_requested",
      request_documents: "documents_required",
      request_info: "info_requested",
    }

    const result = await reviewApplicationForm(form.id, {
      status: statusMap[reviewAction] as ApplicationFormData["status"],
      comments: reviewComments,
      reviewedBy: "Admin User",
    })

    if (result.success) {
      addToHistory(reviewAction, statusMap[reviewAction], reviewComments)
      setSuccessMessage(`Application ${reviewAction.replace("_", " ")} successfully!`)
      setShowSuccess(true)
      setReviewComments("")
      setTimeout(() => setShowSuccess(false), 3000)
    }
    setIsSubmitting(false)
  }

  const handleRequestInfo = async () => {
    if (!form || selectedInfoFields.length === 0) return
    setIsSubmitting(true)

    const result = await requestMoreInformation(
      form.id,
      selectedInfoFields,
      "Please provide the requested information.",
    )

    if (result.success) {
      addToHistory("request_info", "info_requested", "Requested additional information", selectedInfoFields)
      setSuccessMessage("Information request sent to client!")
      setShowSuccess(true)
      setInfoDialogOpen(false)
      setSelectedInfoFields([])
      setTimeout(() => setShowSuccess(false), 3000)
    }
    setIsSubmitting(false)
  }

  const handleRequestDocs = async () => {
    if (!form || selectedDocTypes.length === 0) return
    setIsSubmitting(true)

    const result = await requestDocuments(form.id, selectedDocTypes, "Please upload the requested documents.")

    if (result.success) {
      addToHistory("request_documents", "documents_required", "Requested additional documents", selectedDocTypes)
      setSuccessMessage("Document request sent to client!")
      setShowSuccess(true)
      setDocsDialogOpen(false)
      setSelectedDocTypes([])
      setTimeout(() => setShowSuccess(false), 3000)
    }
    setIsSubmitting(false)
  }

  const handleSendEmail = async () => {
    if (!form || !emailSubject || !emailBody) return
    setIsSubmitting(true)

    const result = await sendEmailToClient({
      clientId: form.clientId,
      subject: emailSubject,
      body: emailBody,
    })

    if (result.success) {
      addToHistory("email_sent", form.status, `Email: ${emailSubject}`)
      setSuccessMessage("Email sent successfully!")
      setShowSuccess(true)
      setEmailDialogOpen(false)
      setEmailSubject("")
      setEmailBody("")
      setTimeout(() => setShowSuccess(false), 3000)
    }
    setIsSubmitting(false)
  }

  const handleDateChange = async (date: string) => {
    setMeetingDate(date)
    setMeetingTime("")
    if (date) {
      const result = await getAvailableSlots(date)
      if (result.success && result.data) {
        const times = result.data.filter((slot) => slot.available).map((slot) => slot.time)
        setAvailableSlots(times)
      }
    }
  }

  const handleScheduleMeeting = async () => {
    if (!form || !meetingDate || !meetingTime) return
    setIsSubmitting(true)

    const result = await adminCreateAppointment({
      clientId: form.clientId,
      clientName: `${form.personalInfo.firstName} ${form.personalInfo.lastName}`,
      clientEmail: form.personalInfo.email,
      clientPhone: form.personalInfo.phone,
      type: meetingType,
      date: meetingDate,
      time: meetingTime,
      duration: 60,
      notes: meetingNotes,
    })

    if (result.success) {
      addToHistory("meeting_scheduled", form.status, `Meeting scheduled: ${meetingDate} at ${meetingTime}`)
      setSuccessMessage("Meeting scheduled successfully!")
      setShowSuccess(true)
      setMeetingDialogOpen(false)
      setMeetingDate("")
      setMeetingTime("")
      setMeetingNotes("")
      setTimeout(() => setShowSuccess(false), 3000)
    }
    setIsSubmitting(false)
  }

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      case "submitted":
        return "bg-blue-100 text-blue-700"
      case "draft":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-yellow-100 text-yellow-700"
    }
  }

  const infoFieldOptions = [
    "Personal Details",
    "Contact Information",
    "Education Background",
    "Work Experience",
    "Test Scores",
    "Financial Information",
    "Visa History",
    "Travel History",
  ]

  const docTypeOptions = [
    "Passport",
    "Academic Transcripts",
    "Degree Certificate",
    "English Proficiency Test",
    "Financial Statement",
    "Recommendation Letters",
    "Statement of Purpose",
    "CV/Resume",
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Application not found.</p>
        <Button asChild variant="outline">
          <Link href="/admin/applications">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Applications
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircleIcon className="h-5 w-5" />
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/applications">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Application Review</h1>
            <p className="text-muted-foreground">
              {form.personalInfo.firstName} {form.personalInfo.lastName} - {form.serviceType.replace("_", " ")}
            </p>
          </div>
        </div>
        <Badge className={getStatusColor(form.status)}>{form.status.replace("_", " ")}</Badge>
      </div>

      <div className="flex gap-6">
        {/* Main Content Area - Takes remaining width */}
        <div className="flex-1 min-w-0">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="education" className="flex items-center gap-2">
                <GraduationCapIcon className="h-4 w-4" />
                Education
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileTextIcon className="h-4 w-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <GlobeIcon className="h-4 w-4" />
                Preferences
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-6 space-y-4">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground text-xs">Full Name</Label>
                    <p className="font-medium">
                      {form.personalInfo.firstName} {form.personalInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Email</Label>
                    <p className="font-medium">{form.personalInfo.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Phone</Label>
                    <p className="font-medium">{form.personalInfo.phone}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Date of Birth</Label>
                    <p className="font-medium">{form.personalInfo.dateOfBirth || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Nationality</Label>
                    <p className="font-medium">{form.personalInfo.nationality}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Country of Residence</Label>
                    <p className="font-medium">{form.personalInfo.countryOfResidence}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-muted-foreground text-xs">Address</Label>
                    <p className="font-medium">{form.personalInfo.address || "Not provided"}</p>
                  </div>
                </CardContent>
              </Card>

              {form.workExperience && form.workExperience.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BriefcaseIcon className="h-5 w-5" />
                      Work Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {form.workExperience.map((work, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{work.jobTitle}</p>
                            <p className="text-sm text-muted-foreground">{work.company}</p>
                          </div>
                          <Badge variant="outline">
                            {work.startDate} - {work.endDate || "Present"}
                          </Badge>
                        </div>
                        {work.description && <p className="text-sm mt-2">{work.description}</p>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="education" className="mt-6 space-y-4">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCapIcon className="h-5 w-5" />
                    Education Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="text-base px-4 py-1">
                    {form.educationLevel?.replace("_", " ") || "Not specified"}
                  </Badge>
                </CardContent>
              </Card>

              {form.educationHistory && form.educationHistory.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle>Education History</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {form.educationHistory.map((edu, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{edu.degree}</p>
                            <p className="text-sm text-muted-foreground">
                              {edu.institution}, {edu.country}
                            </p>
                            <p className="text-sm">Field: {edu.fieldOfStudy}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{edu.graduationYear}</Badge>
                            {edu.gpa && <p className="text-sm mt-1">GPA: {edu.gpa}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {form.testScores && form.testScores.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle>Test Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {form.testScores.map((test, index) => (
                        <div key={index} className="p-4 rounded-lg bg-muted/50">
                          <div className="flex justify-between items-center">
                            <p className="font-semibold">{test.testType}</p>
                            <Badge className="bg-primary text-primary-foreground">{test.score}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Date: {test.dateTaken}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileTextIcon className="h-5 w-5" />
                    Uploaded Documents
                  </CardTitle>
                  <CardDescription>Review all submitted documents</CardDescription>
                </CardHeader>
                <CardContent>
                  {form.documents && form.documents.length > 0 ? (
                    <div className="space-y-3">
                      {form.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <FileTextIcon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{doc.type.replace("_", " ")}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                doc.status === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : doc.status === "rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                              }
                            >
                              {doc.status}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No documents uploaded yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="mt-6 space-y-4">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GlobeIcon className="h-5 w-5" />
                    Destination Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {form.preferredCountries && form.preferredCountries.length > 0 && (
                    <div>
                      <Label className="text-muted-foreground text-xs">Preferred Countries</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {form.preferredCountries.map((country, index) => (
                          <Badge key={index} variant="secondary">
                            {country}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {form.preferredInstitutions && form.preferredInstitutions.length > 0 && (
                    <div>
                      <Label className="text-muted-foreground text-xs">Preferred Institutions</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {form.preferredInstitutions.map((inst, index) => (
                          <Badge key={index} variant="outline">
                            {inst}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground text-xs">Intake Preference</Label>
                    <p className="font-medium">{form.intakePreference || "Not specified"}</p>
                  </div>
                </CardContent>
              </Card>

              {form.statementOfPurpose && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Statement of Purpose</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{form.statementOfPurpose}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-80 shrink-0 space-y-4">
          {/* Review Actions Card - Sticky */}
          <Card className="bg-card sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquareIcon className="h-5 w-5" />
                Review Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm">Action</Label>
                <Select value={reviewAction} onValueChange={(v) => setReviewAction(v as ReviewAction)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        Approve
                      </div>
                    </SelectItem>
                    <SelectItem value="reject">
                      <div className="flex items-center gap-2">
                        <XCircleIcon className="h-4 w-4 text-red-600" />
                        Reject
                      </div>
                    </SelectItem>
                    <SelectItem value="request_revision">
                      <div className="flex items-center gap-2">
                        <AlertCircleIcon className="h-4 w-4 text-orange-600" />
                        Request Revisions
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Comments</Label>
                <Textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Add review comments..."
                  rows={3}
                  className="text-sm"
                />
              </div>

              <Button
                onClick={handleReviewSubmit}
                disabled={isSubmitting || !reviewComments}
                className="w-full bg-primary text-primary-foreground"
                size="sm"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>

              <div className="pt-3 border-t border-border grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs bg-transparent"
                  onClick={() => setInfoDialogOpen(true)}
                >
                  <MessageSquareIcon className="mr-1 h-3 w-3" />
                  Request Info
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs bg-transparent"
                  onClick={() => setDocsDialogOpen(true)}
                >
                  <FileTextIcon className="mr-1 h-3 w-3" />
                  Request Docs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs bg-transparent"
                  onClick={() => {
                    setEmailSubject(`Update on your ${form.serviceType} application`)
                    setEmailDialogOpen(true)
                  }}
                >
                  <MailIcon className="mr-1 h-3 w-3" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs bg-transparent"
                  onClick={() => setMeetingDialogOpen(true)}
                >
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  Meeting
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px] px-4 pb-4">
                {reviewHistory.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <ClockIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No activity yet</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />
                    <div className="space-y-4">
                      {reviewHistory.map((item) => (
                        <div key={item.id} className="relative pl-8">
                          <div
                            className={`absolute left-0 top-1 h-6 w-6 rounded-full flex items-center justify-center ${
                              item.action === "approve"
                                ? "bg-green-100"
                                : item.action === "reject"
                                  ? "bg-red-100"
                                  : item.action === "email_sent"
                                    ? "bg-blue-100"
                                    : item.action === "meeting_scheduled"
                                      ? "bg-purple-100"
                                      : "bg-yellow-100"
                            }`}
                          >
                            {item.action === "approve" && <CheckCircleIcon className="h-3 w-3 text-green-600" />}
                            {item.action === "reject" && <XCircleIcon className="h-3 w-3 text-red-600" />}
                            {item.action === "request_info" && (
                              <MessageSquareIcon className="h-3 w-3 text-yellow-600" />
                            )}
                            {item.action === "request_documents" && (
                              <FileTextIcon className="h-3 w-3 text-yellow-600" />
                            )}
                            {item.action === "email_sent" && <MailIcon className="h-3 w-3 text-blue-600" />}
                            {item.action === "meeting_scheduled" && (
                              <CalendarIcon className="h-3 w-3 text-purple-600" />
                            )}
                            {item.action === "review" && <ClockIcon className="h-3 w-3 text-yellow-600" />}
                          </div>

                          <div className="bg-muted/30 rounded-lg p-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-xs capitalize">{item.action.replace(/_/g, " ")}</span>
                              <Badge variant="outline" className="text-[10px] px-1 py-0">
                                {item.status.replace(/_/g, " ")}
                              </Badge>
                            </div>
                            {item.comments && (
                              <p className="text-xs text-muted-foreground mb-1 line-clamp-2">{item.comments}</p>
                            )}
                            {item.details && item.details.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-1">
                                {item.details.slice(0, 3).map((detail, i) => (
                                  <Badge key={i} variant="secondary" className="text-[10px] px-1 py-0">
                                    {detail}
                                  </Badge>
                                ))}
                                {item.details.length > 3 && (
                                  <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                    +{item.details.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(item.reviewedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Request Information Dialog */}
      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent className="bg-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Request Additional Information</DialogTitle>
            <DialogDescription>Select the information you need from the client.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              {infoFieldOptions.map((field) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={field}
                    checked={selectedInfoFields.includes(field)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedInfoFields([...selectedInfoFields, field])
                      } else {
                        setSelectedInfoFields(selectedInfoFields.filter((f) => f !== field))
                      }
                    }}
                  />
                  <label htmlFor={field} className="text-sm cursor-pointer">
                    {field}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setInfoDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={handleRequestInfo}
                disabled={selectedInfoFields.length === 0 || isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Documents Dialog */}
      <Dialog open={docsDialogOpen} onOpenChange={setDocsDialogOpen}>
        <DialogContent className="bg-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Request Additional Documents</DialogTitle>
            <DialogDescription>Select the documents you need from the client.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              {docTypeOptions.map((doc) => (
                <div key={doc} className="flex items-center space-x-2">
                  <Checkbox
                    id={doc}
                    checked={selectedDocTypes.includes(doc)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDocTypes([...selectedDocTypes, doc])
                      } else {
                        setSelectedDocTypes(selectedDocTypes.filter((d) => d !== doc))
                      }
                    }}
                  />
                  <label htmlFor={doc} className="text-sm cursor-pointer">
                    {doc}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setDocsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={handleRequestDocs}
                disabled={selectedDocTypes.length === 0 || isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="bg-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Email Client</DialogTitle>
            <DialogDescription>
              Send an email to {form.personalInfo.firstName} {form.personalInfo.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Write your message..."
                rows={6}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setEmailDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={handleSendEmail}
                disabled={!emailSubject || !emailBody || isSubmitting}
              >
                <SendIcon className="mr-2 h-4 w-4" />
                {isSubmitting ? "Sending..." : "Send Email"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Meeting Dialog */}
      <Dialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen}>
        <DialogContent className="bg-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Schedule Meeting</DialogTitle>
            <DialogDescription>Schedule a meeting with the client.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Meeting Type</Label>
              <Select value={meetingType} onValueChange={(v) => setMeetingType(v as AppointmentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="document_review">Document Review</SelectItem>
                  <SelectItem value="interview_prep">Interview Prep</SelectItem>
                  <SelectItem value="visa_guidance">Visa Guidance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={getTodayDate()}
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Select
                  value={meetingTime}
                  onValueChange={setMeetingTime}
                  disabled={!meetingDate || availableSlots.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !meetingDate ? "Select date first" : availableSlots.length === 0 ? "No slots" : "Select time"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                placeholder="Meeting agenda..."
                rows={2}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setMeetingDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={handleScheduleMeeting}
                disabled={!meetingDate || !meetingTime || isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {isSubmitting ? "Scheduling..." : "Schedule"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
