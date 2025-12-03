"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  MapPinIcon,
} from "@/components/icons"
import type { Application, ApplicationStatus, ServiceType } from "@/lib/types"

interface ApplicationsListProps {
  applications: Application[]
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string; progress: number }> = {
  draft: { label: "Draft", color: "bg-gray-500", progress: 5 },
  pending: { label: "Pending", color: "bg-yellow-500", progress: 10 },
  documents_required: { label: "Documents Required", color: "bg-orange-500", progress: 25 },
  under_review: { label: "Under Review", color: "bg-blue-500", progress: 50 },
  submitted: { label: "Submitted", color: "bg-indigo-500", progress: 70 },
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

export function ApplicationsList({ applications }: ApplicationsListProps) {
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)

  const handleViewDetails = (app: Application) => {
    setSelectedApp(app)
    setViewDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
        <p className="text-muted-foreground">Track and manage all your applications in one place.</p>
      </div>

      {applications.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="py-12 text-center">
            <GraduationCapIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-card-foreground mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any active applications. Contact us to get started on your journey!
            </p>
            <Button asChild>
              <a href="/#book">Book Consultation</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {applications.map((app) => {
            const config = statusConfig[app.status]
            const Icon = serviceIcons[app.serviceType]

            return (
              <Card key={app.id} className="bg-card hover:shadow-md transition-shadow">
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
                          {app.educationLevel &&
                            `${app.educationLevel.charAt(0).toUpperCase() + app.educationLevel.slice(1)} • `}
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

                  {app.notes && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        <strong>Notes:</strong> {app.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-muted-foreground">
                      {app.startDate && <span>Target Start: {new Date(app.startDate).toLocaleDateString()}</span>}
                    </div>
                    <Button variant="ghost" size="sm" className="text-secondary" onClick={() => handleViewDetails(app)}>
                      View Details <ChevronRightIcon className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-card max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Application Details</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-6 py-4">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg ${statusConfig[selectedApp.status].color} bg-opacity-10`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-card-foreground">Current Status</p>
                    <p className="text-2xl font-bold">{statusConfig[selectedApp.status].label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="text-2xl font-bold">{statusConfig[selectedApp.status].progress}%</p>
                  </div>
                </div>
                <Progress value={statusConfig[selectedApp.status].progress} className="h-2 mt-4" />
              </div>

              {/* Application Info Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <FileTextIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label className="text-muted-foreground">Service Type</Label>
                    <p className="font-medium capitalize">{selectedApp.serviceType.replace("_", " ")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPinIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label className="text-muted-foreground">Country</Label>
                    <p className="font-medium">{selectedApp.country}</p>
                  </div>
                </div>
                {selectedApp.institution && (
                  <div className="flex items-start gap-3">
                    <GraduationCapIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <Label className="text-muted-foreground">Institution</Label>
                      <p className="font-medium">{selectedApp.institution}</p>
                    </div>
                  </div>
                )}
                {selectedApp.program && (
                  <div className="flex items-start gap-3">
                    <FileCheckIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <Label className="text-muted-foreground">Program</Label>
                      <p className="font-medium">{selectedApp.program}</p>
                    </div>
                  </div>
                )}
                {selectedApp.educationLevel && (
                  <div className="flex items-start gap-3">
                    <UserIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <Label className="text-muted-foreground">Education Level</Label>
                      <p className="font-medium capitalize">{selectedApp.educationLevel}</p>
                    </div>
                  </div>
                )}
                {selectedApp.startDate && (
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <Label className="text-muted-foreground">Target Start Date</Label>
                      <p className="font-medium">{new Date(selectedApp.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div>
                <Label className="text-muted-foreground">Timeline</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Created: {new Date(selectedApp.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Last Updated: {new Date(selectedApp.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedApp.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes from Consultant</Label>
                  <div className="mt-2 p-4 rounded-lg bg-muted">
                    <p>{selectedApp.notes}</p>
                  </div>
                </div>
              )}

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
