"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  FileTextIcon,
  UserIcon,
  GraduationCapIcon,
  MessageSquareIcon,
} from "@/components/icons"
import Link from "next/link"
import type { ApplicationFormData } from "@/lib/types"
import { getApplicationFormById, reviewApplicationForm } from "@/lib/api"

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-blue-100 text-blue-700",
  under_review: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  needs_revision: "bg-orange-100 text-orange-700",
}

export default function ApplicationReviewPage() {
  const searchParams = useSearchParams()
  const formId = searchParams.get("id")

  const [form, setForm] = useState<ApplicationFormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reviewComments, setReviewComments] = useState("")
  const [reviewStatus, setReviewStatus] = useState<"pending" | "approved" | "needs_revision" | "rejected">("pending")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (formId) {
      loadForm(formId)
    }
  }, [formId])

  const loadForm = async (id: string) => {
    setIsLoading(true)
    const result = await getApplicationFormById(id)
    if (result.success && result.data) {
      setForm(result.data)
      if (result.data.adminReview) {
        setReviewComments(result.data.adminReview.comments || "")
        setReviewStatus(result.data.adminReview.status)
      }
    }
    setIsLoading(false)
  }

  const handleSubmitReview = async () => {
    if (!form?.id) return
    setIsSubmitting(true)
    const result = await reviewApplicationForm(form.id, {
      status: reviewStatus,
      comments: reviewComments,
      reviewedBy: "Admin User",
    })
    if (result.success && result.data) {
      setForm(result.data)
    }
    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading application...</p>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Application not found.</p>
        <Link href="/admin/applications">
          <Button variant="outline" className="mt-4 bg-transparent">
            <ChevronLeftIcon className="mr-2 h-4 w-4" />
            Back to Applications
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/applications">
            <Button variant="ghost" size="icon">
              <ChevronLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Application Review</h1>
            <p className="text-muted-foreground">
              {form.personalInfo.firstName} {form.personalInfo.lastName} - {form.serviceType.toUpperCase()}
            </p>
          </div>
        </div>
        <Badge className={statusColors[form.status] || statusColors.draft}>
          {form.status.replace(/_/g, " ").toUpperCase()}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UserIcon className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground text-xs">Full Name</Label>
                      <p className="font-medium">
                        {form.personalInfo.firstName} {form.personalInfo.middleName} {form.personalInfo.lastName}
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
                      <p className="font-medium">{form.personalInfo.dateOfBirth}</p>
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
                      <p className="font-medium">
                        {form.personalInfo.address}, {form.personalInfo.city}, {form.personalInfo.state}{" "}
                        {form.personalInfo.postalCode}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education" className="space-y-4">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <GraduationCapIcon className="h-5 w-5" />
                    Education History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {form.educationHistory.length === 0 ? (
                    <p className="text-muted-foreground">No education records provided.</p>
                  ) : (
                    <div className="space-y-4">
                      {form.educationHistory.map((edu, index) => (
                        <div key={edu.id} className="p-4 rounded-lg border border-border">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{edu.institution}</p>
                              <p className="text-sm text-muted-foreground">{edu.fieldOfStudy}</p>
                            </div>
                            <Badge variant="secondary" className="capitalize">
                              {edu.level.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Country:</span> {edu.country}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Duration:</span> {edu.startDate} - {edu.endDate}
                            </div>
                            {edu.gpa && (
                              <div>
                                <span className="text-muted-foreground">GPA:</span> {edu.gpa}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {form.workExperience && form.workExperience.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Work Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {form.workExperience.map((work) => (
                        <div key={work.id} className="p-4 rounded-lg border border-border">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{work.position}</p>
                              <p className="text-sm text-muted-foreground">{work.companyName}</p>
                            </div>
                            {work.isCurrent && <Badge className="bg-green-100 text-green-700">Current</Badge>}
                          </div>
                          <div className="text-sm">
                            <p>
                              <span className="text-muted-foreground">Location:</span> {work.country}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Duration:</span> {work.startDate} -{" "}
                              {work.isCurrent ? "Present" : work.endDate}
                            </p>
                            {work.responsibilities && (
                              <p className="mt-2">
                                <span className="text-muted-foreground">Responsibilities:</span> {work.responsibilities}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {form.testScores && form.testScores.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Test Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {form.testScores.map((test, index) => (
                        <div key={index} className="p-4 rounded-lg border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="uppercase">
                              {test.testType}
                            </Badge>
                            <span className="text-2xl font-bold text-primary">{test.overallScore}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Taken: {test.datesTaken}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileTextIcon className="h-5 w-5" />
                    Required Documents
                  </CardTitle>
                  <CardDescription>Review and approve/reject uploaded documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {form.requiredDocuments.map((doc, index) => (
                      <div
                        key={doc.type}
                        className={`p-4 rounded-lg border ${
                          doc.uploaded ? "border-green-200 bg-green-50" : "border-border bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {doc.uploaded ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-600" />
                            ) : (
                              <ClockIcon className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div>
                              <p className="font-medium capitalize">{doc.type.replace(/_/g, " ")}</p>
                              <p className="text-xs text-muted-foreground">{doc.required ? "Required" : "Optional"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc.uploaded ? (
                              <>
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                                <Select defaultValue="pending">
                                  <SelectTrigger className="w-[120px] h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approve</SelectItem>
                                    <SelectItem value="rejected">Reject</SelectItem>
                                    <SelectItem value="requires_update">Request Update</SelectItem>
                                  </SelectContent>
                                </Select>
                              </>
                            ) : (
                              <Badge variant="secondary">Not Uploaded</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">Program Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Preferred Countries</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {form.preferredCountries.map((country) => (
                        <Badge key={country} variant="secondary">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {form.preferredInstitutions && form.preferredInstitutions.length > 0 && (
                    <div>
                      <Label className="text-muted-foreground text-xs">Preferred Institutions</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {form.preferredInstitutions.map((inst) => (
                          <Badge key={inst} variant="outline">
                            {inst}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {form.preferredPrograms && form.preferredPrograms.length > 0 && (
                    <div>
                      <Label className="text-muted-foreground text-xs">Preferred Programs</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {form.preferredPrograms.map((prog) => (
                          <Badge key={prog} variant="outline">
                            {prog}
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

        {/* Sidebar - Review Panel */}
        <div className="space-y-6">
          <Card className="bg-card sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareIcon className="h-5 w-5" />
                Admin Review
              </CardTitle>
              <CardDescription>Submit your review and feedback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Review Status</Label>
                <Select value={reviewStatus} onValueChange={(v) => setReviewStatus(v as typeof reviewStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="approved">Approve Application</SelectItem>
                    <SelectItem value="needs_revision">Request Revisions</SelectItem>
                    <SelectItem value="rejected">Reject Application</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Review Comments</Label>
                <Textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Add your review comments here..."
                  rows={6}
                />
              </div>

              <Button
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>

              {form.adminReview && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Previous Review</p>
                  <p className="text-sm">
                    <span className="font-medium">{form.adminReview.reviewedBy}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      on {new Date(form.adminReview.reviewedAt).toLocaleDateString()}
                    </span>
                  </p>
                  <Badge className={statusColors[form.adminReview.status] || ""}>
                    {form.adminReview.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <MailIcon className="mr-2 h-4 w-4" />
                Send Email to Client
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Schedule Meeting
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FileTextIcon className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Import icons that were used
import { MailIcon, CalendarIcon } from "@/components/icons"
