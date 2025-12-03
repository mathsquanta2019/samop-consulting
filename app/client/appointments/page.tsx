"use client"

import { useClient } from "../layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Video } from "lucide-react"
import Link from "next/link"

export default function ClientAppointmentsPage() {
  const { profile } = useClient()

  if (!profile) return null

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    rescheduled: "bg-yellow-100 text-yellow-700",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground">View and manage your scheduled appointments.</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground">
          <Link href="/#book">Book New Appointment</Link>
        </Button>
      </div>

      {profile.appointments.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-card-foreground mb-2">No Appointments</h3>
            <p className="text-muted-foreground mb-4">You don't have any scheduled appointments.</p>
            <Button asChild>
              <Link href="/#book">Book Consultation</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {profile.appointments.map((apt) => (
            <Card key={apt.id} className="bg-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Video className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-card-foreground capitalize">{apt.type.replace(/_/g, " ")}</CardTitle>
                      <CardDescription>{apt.duration} minutes consultation</CardDescription>
                    </div>
                  </div>
                  <Badge className={statusColors[apt.status]}>{apt.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(apt.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {apt.time}
                  </div>
                </div>
                {apt.notes && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    <strong>Notes:</strong> {apt.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
