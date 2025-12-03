import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileTextIcon, CheckCircleIcon, AlertCircleIcon, CalendarIcon } from "@/components/icons"
import type { ClientProfile, ApplicationStatus } from "@/lib/types"

interface DashboardOverviewProps {
  profile: ClientProfile
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

export function DashboardOverview({ profile }: DashboardOverviewProps) {
  const totalApplications = profile.applications.length
  const pendingDocuments = profile.documents.filter(
    (d) => d.status === "pending" || d.status === "requires_update",
  ).length
  const approvedDocs = profile.documents.filter((d) => d.status === "approved").length
  const upcomingAppointments = profile.appointments.filter((a) => a.status === "scheduled").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {profile.firstName}!</h1>
        <p className="text-muted-foreground">Here's an overview of your application status and pending tasks.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Applications</CardTitle>
            <FileTextIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{totalApplications}</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Documents Approved</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {approvedDocs}/{profile.documents.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Actions</CardTitle>
            <AlertCircleIcon className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{pendingDocuments}</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Appointments</CardTitle>
            <CalendarIcon className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{upcomingAppointments}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Application Progress</CardTitle>
          <CardDescription>Track the status of your applications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {profile.applications.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No active applications. Contact us to get started!</p>
          ) : (
            profile.applications.map((app) => {
              const config = statusConfig[app.status]
              return (
                <div key={app.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-card-foreground">
                        {app.institution || app.country} - {app.program || app.serviceType}
                      </h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {app.serviceType.replace("_", " ")} • {app.country}
                      </p>
                    </div>
                    <Badge variant="secondary" className={`${config.color} text-white`}>
                      {config.label}
                    </Badge>
                  </div>
                  <Progress value={config.progress} className="h-2" />
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Recent Documents</CardTitle>
          <CardDescription>Your recently uploaded documents</CardDescription>
        </CardHeader>
        <CardContent>
          {profile.documents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-4">
              {profile.documents.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <FileTextIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{doc.type.replace("_", " ")}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      doc.status === "approved" ? "default" : doc.status === "rejected" ? "destructive" : "secondary"
                    }
                  >
                    {doc.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
