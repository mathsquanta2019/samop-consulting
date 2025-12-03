"use client"

import { useState } from "react"
import { useClient } from "../layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, ClockIcon, VideoIcon, AlertCircleIcon } from "@/components/icons"
import Link from "next/link"
import { cancelAppointment } from "@/lib/api"
import type { Appointment } from "@/lib/types"

export default function ClientAppointmentsPage() {
  const { profile } = useClient()
  const [appointments, setAppointments] = useState<Appointment[]>(profile?.appointments || [])
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [refundInfo, setRefundInfo] = useState<{ amount: number; percentage: number; message: string } | null>(null)

  if (!profile) return null

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    rescheduled: "bg-yellow-100 text-yellow-700",
  }

  const handleOpenCancelDialog = (apt: Appointment) => {
    setSelectedApt(apt)

    const appointmentDateTime = new Date(`${apt.date}T${apt.time}`)
    const now = new Date()
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    const appointmentFee = 100 // Base fee
    let percentage = 0
    let message = ""

    if (hoursUntilAppointment > 48) {
      percentage = 100
      message = "Full refund - Cancelling more than 48 hours in advance."
    } else if (hoursUntilAppointment > 24) {
      percentage = 50
      message = "50% refund - Cancelling between 24-48 hours in advance."
    } else {
      percentage = 0
      message = "No refund - Cancelling less than 24 hours before appointment."
    }

    setRefundInfo({
      amount: (appointmentFee * percentage) / 100,
      percentage,
      message,
    })
    setCancelDialogOpen(true)
  }

  const handleCancelAppointment = async () => {
    if (!selectedApt) return

    setIsSubmitting(true)
    const result = await cancelAppointment(selectedApt.id, cancelReason, "client")

    if (result.success) {
      setAppointments((prev) => prev.map((apt) => (apt.id === selectedApt.id ? { ...apt, status: "cancelled" } : apt)))
      setCancelDialogOpen(false)
      setSelectedApt(null)
      setCancelReason("")
      setRefundInfo(null)
    }
    setIsSubmitting(false)
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

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Cancellation & Refund Policy</p>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>
                  • More than 48 hours before: <strong>Full refund (100%)</strong>
                </li>
                <li>
                  • 24-48 hours before: <strong>Partial refund (50%)</strong>
                </li>
                <li>
                  • Less than 24 hours before: <strong>No refund</strong>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {appointments.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="py-12 text-center">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-card-foreground mb-2">No Appointments</h3>
            <p className="text-muted-foreground mb-4">You don't have any scheduled appointments.</p>
            <Button asChild>
              <Link href="/#book">Book Consultation</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {appointments.map((apt) => (
            <Card key={apt.id} className="bg-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <VideoIcon className="h-6 w-6 text-primary" />
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
                    <CalendarIcon className="h-4 w-4" />
                    {new Date(apt.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    {apt.time}
                  </div>
                </div>
                {apt.notes && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    <strong>Notes:</strong> {apt.notes}
                  </p>
                )}
                {apt.status === "scheduled" && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                      onClick={() => handleOpenCancelDialog(apt)}
                    >
                      Cancel Appointment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Cancel Appointment</DialogTitle>
            <DialogDescription>Are you sure you want to cancel this appointment?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {refundInfo && (
              <div
                className={`p-4 rounded-lg ${refundInfo.percentage === 100 ? "bg-green-50 border-green-200" : refundInfo.percentage === 50 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200"} border`}
              >
                <p
                  className={`font-medium ${refundInfo.percentage === 100 ? "text-green-800" : refundInfo.percentage === 50 ? "text-yellow-800" : "text-red-800"}`}
                >
                  Refund: ${refundInfo.amount.toFixed(2)} ({refundInfo.percentage}%)
                </p>
                <p
                  className={`text-sm mt-1 ${refundInfo.percentage === 100 ? "text-green-700" : refundInfo.percentage === 50 ? "text-yellow-700" : "text-red-700"}`}
                >
                  {refundInfo.message}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Reason for Cancellation (Optional)</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Let us know why you're cancelling..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setCancelDialogOpen(false)}>
                Keep Appointment
              </Button>
              <Button
                onClick={handleCancelAppointment}
                variant="destructive"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Cancelling..." : "Cancel Appointment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
