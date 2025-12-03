import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, Clock, Calendar, TrendingUp, CheckCircle, UserPlus } from "lucide-react"
import type { DashboardStats } from "@/lib/types"
import Link from "next/link"

interface AdminOverviewProps {
  stats: DashboardStats
}

export function AdminOverview({ stats }: AdminOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of all clients, applications, and activities.</p>
        </div>
        <Link href="/admin/clients">
          <Button className="bg-primary text-primary-foreground">
            <UserPlus className="mr-2 h-4 w-4" />
            Onboard New Client
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats.totalClients}</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Applications</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats.activeApplications}</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Documents</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats.pendingDocuments}</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats.upcomingAppointments}</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed (Month)</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats.completedThisMonth}</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/clients">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Users className="h-5 w-5 text-primary" />
                Manage Clients
              </CardTitle>
              <CardDescription>View all clients, initiate onboarding, and manage profiles</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="bg-card hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/applications">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <FileText className="h-5 w-5 text-blue-500" />
                Review Applications
              </CardTitle>
              <CardDescription>Update status, review documents, and manage processes</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="bg-card hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/appointments">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Calendar className="h-5 w-5 text-secondary" />
                View Appointments
              </CardTitle>
              <CardDescription>Manage scheduled consultations and meetings</CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>

      {/* Recent Activity Placeholder */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Recent Activity</CardTitle>
          <CardDescription>Latest updates across all clients and applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "New appointment booked", client: "Michael Brown", time: "2 hours ago", type: "appointment" },
              { action: "Document uploaded", client: "John Doe", time: "4 hours ago", type: "document" },
              { action: "Application status updated", client: "Jane Smith", time: "1 day ago", type: "status" },
              { action: "New contact message", client: "Sarah Williams", time: "1 day ago", type: "message" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div
                  className={`h-2 w-2 rounded-full ${
                    activity.type === "appointment"
                      ? "bg-secondary"
                      : activity.type === "document"
                        ? "bg-blue-500"
                        : activity.type === "status"
                          ? "bg-green-500"
                          : "bg-orange-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.client}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
