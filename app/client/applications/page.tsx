"use client"

import { useState, useEffect } from "react"
import { useClient } from "../layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  GraduationCapIcon,
  PlaneIcon,
  FileCheckIcon,
  GlobeIcon,
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
  UserIcon,
  EditIcon,
} from "@/components/icons"
import type { Application, ApplicationStatus, ServiceType, ApplicationFormData } from "@/lib/types"
import { getApplicationForms } from "@/lib/api"
import Link from "next/link"

const statusConfig: Record<
  ApplicationStatus | "draft" | "submitted" | "under_review" | "needs_revision" | "approved" | "rejected",
  { label: string; color: string; progress: number }
> = {
  draft: { label: "Draft", color: "bg-gray-500", progress: 5 },
  pending: { label: "Pending", color: "bg-yellow-500", progress: 10 },
  documents_required: { label: "Documents Required", color: "bg-orange-500", progress: 25 },
  under_review: { label: "Under Review", color: "bg-blue-500", progress: 50 },
  submitted: { label: "Submitted", color: "bg-indigo-500", progress: 70 },
  needs_revision: { label: "Needs Revision", color: "bg-orange-500", progress: 40 },
  interview_scheduled: { label: "Interview Scheduled", color: "bg-purple-500", progress: 80 },
  approved: { label: "Approved", color: "bg-green-500", progress: 95 },
  rejected: { label: "Rejected", color: "bg-red-500", progress: 100 },
  completed: { label: "Completed", color: "bg-green-600", progress: 100 },
}

const serviceIcons: Record<ServiceType, typeof GraduationCapIcon> = {
  education: GraduationCapIcon,
  immigration: PlaneIcon,
  sevis: FileCheckIcon,
  credential_evaluation: GlobeIcon,
}

export default function ClientApplicationsPage() {
  const { profile } = useClient()
  const [applicationForms, setApplicationForms] = useState<ApplicationFormData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedForm, setSelectedForm] = useState<ApplicationFormData | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (profile) {
      loadApplicationForms()
    }
  }, [profile])

  const loadApplicationForms = async () => {
    if (!profile) return
    setIsLoading(false)
    const result = await getApplicationForms(profile.id)
    if (result.success && result.data) {
      setApplicationForms(result.data)
    }
    setIsLoading(false)
  }

  const handleViewDetails = (form: ApplicationFormData) => {
    setSelectedForm(form)
    setViewDialogOpen(true)
  }

  if (!profile) return null

  // Combine legacy applications with new application forms
  const allApplications = [
    ...profile.applications.map((app) => ({ type: "legacy" as const, data: app })),
    ...applicationForms.map((form) => ({ type: "form" as const, data: form })),
  ]

  const draftForms = applicationForms.filter((f) => f.status === "draft")
  const submittedForms = applicationForms.filter((f) => f.status !== "draft")

  const filteredApplications =
    activeTab === "all"
      ? allApplications
      : activeTab === "drafts"
        ? applicationForms.filter((f) => f.status === "draft").map((f) => ({ type: "form" as const, data: f }))
        : activeTab === "submitted"
          ? [
              ...profile.applications.map((app) => ({ type: "legacy" as const, data: app })),
              ...applicationForms.filter((f) => f.status !== "draft").map((f) => ({ type: "form" as const, data: f })),
            ]
          : allApplications

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
          <p className="text-muted-foreground">Track and manage all your applications in one place.</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground">
          <Link href="/client/apply">
            <EditIcon className="mr-2 h-4 w-4" />
            New Application
          </Link>
        </Button>
      </div>

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({allApplications.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({draftForms.length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({profile.applications.length + submittedForms.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <Card className="bg-card">
              <CardContent className="py-12 text-center">
                <ClockIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading applications...</p>
              </CardContent>
            </Card>
          ) : filteredApplications.length === 0 ? (
            <Card className="bg-card">
              <CardContent className="py-12 text-center">
                <GraduationCapIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground mb-4">Start your journey by creating a new application.</p>
                <Button asChild className="bg-primary text-primary-foreground">
                  <Link href="/client/apply">Start Application</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredApplications.map((item, index) => {
                if (item.type === "legacy") {
                  const app = item.data as Application
                  const config = statusConfig[app.status] || statusConfig.pending
                  const Icon = serviceIcons[app.serviceType]

                  return (
                    <Card key={`legacy-${app.id}`} className="bg-card hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-card-foreground">
                                {app.institution || `${app.serviceType.replace("_", " ")} Application`}
                              </CardTitle>
                              <CardDescription>
                                {app.program && `${app.program} • `}
                                {app.country}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary" className={`${config.color} text-white`}>
                            {config.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium text-card-foreground">{config.progress}%</span>
                          </div>
                          <Progress value={config.progress} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="text-sm text-muted-foreground">
                            Updated: {new Date(app.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                } else {
                  const form = item.data as ApplicationFormData
                  const config = statusConfig[form.status] || statusConfig.draft
                  const Icon = serviceIcons[form.serviceType]

                  return (
                    <Card key={`form-${form.id}`} className="bg-card hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-card-foreground capitalize">
                                {form.serviceType.replace("_", " ")} Application
                              </CardTitle>
                              <CardDescription>
                                {form.personalInfo.firstName} {form.personalInfo.lastName} •{" "}
                                {form.preferredCountries?.join(", ") || "No destination selected"}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary" className={`${config.color} text-white`}>
                            {config.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium text-card-foreground">{config.progress}%</span>
                          </div>
                          <Progress value={config.progress} className="h-2" />
                        </div>

                        {form.adminReview?.comments && (
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground">
                              <strong>Admin Notes:</strong> {form.adminReview.comments}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div className="text-sm text-muted-foreground">
                            {form.status === "draft" ? "Last saved" : "Submitted"}:{" "}
                            {new Date(form.updatedAt).toLocaleDateString()}
                          </div>
                          <div className="flex gap-2">
                            {form.status === "draft" && (
                              <Button asChild variant="outline" size="sm" className="bg-transparent">
                                <Link href={`/client/apply?edit=${form.id}`}>
                                  <EditIcon className="mr-1 h-4 w-4" />
                                  Continue
                                </Link>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-secondary"
                              onClick={() => handleViewDetails(form)}
                            >
                              View Details <ChevronRightIcon className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                }
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-card max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Application Details</DialogTitle>
          </DialogHeader>
          {selectedForm && (
            <div className="space-y-6 py-4">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-lg ${statusConfig[selectedForm.status]?.color || "bg-gray-500"} bg-opacity-10`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-card-foreground">Current Status</p>
                    <p className="text-2xl font-bold">
                      {statusConfig[selectedForm.status]?.label || selectedForm.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="text-2xl font-bold">{statusConfig[selectedForm.status]?.progress || 0}%</p>
                  </div>
                </div>
                <Progress value={statusConfig[selectedForm.status]?.progress || 0} className="h-2 mt-4" />
              </div>

              {/* Personal Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <UserIcon className="h-5 w-5" /> Personal Information
                </h3>
                <div className="grid gap-3 md:grid-cols-2 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Full Name</Label>
                    <p>
                      {selectedForm.personalInfo.firstName} {selectedForm.personalInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>{selectedForm.personalInfo.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p>{selectedForm.personalInfo.phone}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Nationality</Label>
                    <p>{selectedForm.personalInfo.nationality}</p>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileTextIcon className="h-5 w-5" /> Service Details
                </h3>
                <div className="grid gap-3 md:grid-cols-2 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Service Type</Label>
                    <p className="capitalize">{selectedForm.serviceType.replace("_", " ")}</p>
                  </div>
                  {selectedForm.educationLevel && (
                    <div>
                      <Label className="text-muted-foreground">Education Level</Label>
                      <p className="capitalize">{selectedForm.educationLevel}</p>
                    </div>
                  )}
                  {selectedForm.preferredCountries && selectedForm.preferredCountries.length > 0 && (
                    <div>
                      <Label className="text-muted-foreground">Preferred Countries</Label>
                      <p>{selectedForm.preferredCountries.join(", ")}</p>
                    </div>
                  )}
                  {selectedForm.intakePreference && (
                    <div>
                      <Label className="text-muted-foreground">Intake Preference</Label>
                      <p>{selectedForm.intakePreference}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Review */}
              {selectedForm.adminReview && (
                <div>
                  <h3 className="font-semibold mb-3">Admin Review</h3>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Reviewed by: {selectedForm.adminReview.reviewedBy}</span>
                      <span>{new Date(selectedForm.adminReview.reviewedAt).toLocaleDateString()}</span>
                    </div>
                    <p>{selectedForm.adminReview.comments}</p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ClockIcon className="h-5 w-5" /> Timeline
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Created: {new Date(selectedForm.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Last Updated: {new Date(selectedForm.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {selectedForm.submittedAt && (
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>Submitted: {new Date(selectedForm.submittedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <Button variant="outline" className="w-full bg-transparent" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
