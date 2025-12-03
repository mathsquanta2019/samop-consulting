import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { GraduationCap, Plane, FileCheck, Globe, ChevronRight } from "lucide-react"
import type { Application, ApplicationStatus, ServiceType } from "@/lib/types"

interface ApplicationsListProps {
  applications: Application[]
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string; progress: number }> = {
  pending: { label: "Pending", color: "bg-yellow-500", progress: 10 },
  documents_required: { label: "Documents Required", color: "bg-orange-500", progress: 25 },
  under_review: { label: "Under Review", color: "bg-blue-500", progress: 50 },
  submitted: { label: "Submitted", color: "bg-indigo-500", progress: 70 },
  interview_scheduled: { label: "Interview Scheduled", color: "bg-purple-500", progress: 80 },
  approved: { label: "Approved", color: "bg-green-500", progress: 95 },
  rejected: { label: "Rejected", color: "bg-red-500", progress: 100 },
  completed: { label: "Completed", color: "bg-green-600", progress: 100 },
}

const serviceIcons: Record<ServiceType, typeof GraduationCap> = {
  education: GraduationCap,
  immigration: Plane,
  sevis: FileCheck,
  credential_evaluation: Globe,
}

export function ApplicationsList({ applications }: ApplicationsListProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
        <p className="text-muted-foreground">Track and manage all your applications in one place.</p>
      </div>

      {applications.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
                    <Button variant="ghost" size="sm" className="text-secondary">
                      View Details <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
