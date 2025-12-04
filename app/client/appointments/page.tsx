"use client"

import { useState } from "react"
import { useClient } from "../layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, ClockIcon, VideoIcon, CheckCircleIcon, RefreshCwIcon } from "@/components/icons"
import { BookingModal } from "@/components/booking-modal"
import { cancelAppointment, requestReschedule } from "@/lib/api"
import type { Appointment } from "@/lib/types"

export default function ClientAppointmentsPage() {
  const { profile } = useClient()
  const [appointments, setAppointments] = useState<Appointment[]>(profile?.appointments || [])
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [proposedDate, setProposedDate] = useState("")
  const [proposedTime, setProposedTime] = useState("")
  const [rescheduleReason, setRescheduleReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [refundInfo, setRefundInfo] = useState<{ amount: number; percentage: number; message: string } | null>(null)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [cancelSuccess, setCancelSuccess] = useState(false)
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false)

  const handleOpenCancelDialog = (apt: Appointment) => {
    setSelectedApt(apt)
    setCancelReason("")
    setCancelSuccess(false)
    setCancelDialogOpen(true)
  }

  const handleOpenRescheduleDialog = (apt: Appointment) => {
    setSelectedApt(apt)
    setProposedDate("")
    setProposedTime("")
    setRescheduleReason("")
    setRescheduleSuccess(false)
    setRescheduleDialogOpen(true)
  }

  const handleRequestReschedule = async () => {
    if (!selectedApt || !proposedDate || !proposedTime) return

    setIsSubmitting(true)
    const result = await requestReschedule(selectedApt.id, proposedDate, proposedTime, rescheduleReason)

    if (result.success && result.data) {
      setAppointments((prev) => prev.map((apt) => (apt.id === selectedApt.id ? result.data! : apt)))
      setRescheduleSuccess(true)
      setTimeout(() => {
        setRescheduleDialogOpen(false)
        setSelectedApt(null)
        setProposedDate("")
        setProposedTime("")
        setRescheduleReason("")
        setRescheduleSuccess(false)
      }, 2500)
    }
    setIsSubmitting(false)
  }

  const handleBookingComplete = (newAppointment: Appointment) => {
    setAppointments((prev) => [...prev, newAppointment])
  }

  const handleCancelAppointment = async () => {
    if (!selectedApt || !cancelReason) return

    setIsSubmitting(true)
    const result = await cancelAppointment(selectedApt.id, cancelReason)

    if (result.success) {
      setAppointments((prev) => prev.filter((apt) => apt.id !== selectedApt.id))
      setCancelSuccess(true)
      setTimeout(() => {
        setCancelDialogOpen(false)
        setSelectedApt(null)
        setCancelReason("")
        setCancelSuccess(false)
      }, 2500)
    }
    setIsSubmitting(false)
  }

  if (!profile) return null

  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    rescheduled: "bg-yellow-100 text-yellow-700",
    pending_reschedule: "bg-orange-100 text-orange-700",
  }

  return (
    <div className="space-y-6">
      {/* ... existing header and policy card ... */}

      {appointments.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="py-12 text-center">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-card-foreground mb-2">No Appointments</h3>
            <p className="text-muted-foreground mb-4">You don't have any scheduled appointments.</p>
            <Button onClick={() => setBookingModalOpen(true)}>Book Consultation</Button>
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
                  <Badge className={statusColors[apt.status]}>{apt.status.replace(/_/g, " ")}</Badge>
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

                {apt.status === "pending_reschedule" && apt.rescheduleRequest && (
                  <div className="mt-4 p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <p className="text-sm font-medium text-orange-800">Reschedule Request Pending</p>
                    <p className="text-sm text-orange-700 mt-1">
                      Proposed: {new Date(apt.rescheduleRequest.proposedDate).toLocaleDateString()} at{" "}
                      {apt.rescheduleRequest.proposedTime}
                    </p>
                    {apt.rescheduleRequest.reason && (
                      <p className="text-sm text-orange-600 mt-1">Reason: {apt.rescheduleRequest.reason}</p>
                    )}
                  </div>
                )}

                {apt.rescheduleRequest?.status === "rejected" && (
                  <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm font-medium text-red-800">Reschedule Request Rejected</p>
                    {apt.rescheduleRequest.adminNotes && (
                      <p className="text-sm text-red-700 mt-1">Reason: {apt.rescheduleRequest.adminNotes}</p>
                    )}
                  </div>
                )}

                {apt.notes && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    <strong>Notes:</strong> {apt.notes}
                  </p>
                )}
                {apt.status === "scheduled" && (
                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Button
                      variant="outline"
                      className="bg-transparent"
                      onClick={() => handleOpenRescheduleDialog(apt)}
                    >
                      <RefreshCwIcon className="mr-2 h-4 w-4" />
                      Request Reschedule
                    </Button>
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

      {/* ... existing Cancel Dialog ... */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="bg-card">
          {cancelSuccess ? (
            <div className="py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-center text-card-foreground">Appointment Cancelled</DialogTitle>
                <DialogDescription className="text-center mt-2">
                  Your appointment has been cancelled successfully.
                </DialogDescription>
              </DialogHeader>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-card-foreground">Cancel Appointment</DialogTitle>
                <DialogDescription>Please provide a reason for cancelling your appointment.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Current appointment:</strong>{" "}
                    {selectedApt && new Date(selectedApt.date).toLocaleDateString()} at {selectedApt?.time}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Reason for Cancellation</Label>
                  <Textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Let us know why you need to cancel..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setCancelDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCancelAppointment}
                    className="flex-1 bg-primary text-primary-foreground"
                    disabled={!cancelReason || isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Cancel Appointment"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="bg-card">
          {rescheduleSuccess ? (
            <div className="py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-center text-card-foreground">Request Submitted</DialogTitle>
                <DialogDescription className="text-center mt-2">
                  Your reschedule request has been submitted. We will review and respond shortly.
                </DialogDescription>
              </DialogHeader>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-card-foreground">Request Reschedule</DialogTitle>
                <DialogDescription>
                  Propose a new date and time for your appointment. This request is subject to admin approval.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Current appointment:</strong>{" "}
                    {selectedApt && new Date(selectedApt.date).toLocaleDateString()} at {selectedApt?.time}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Proposed Date</Label>
                    <Input
                      type="date"
                      value={proposedDate}
                      onChange={(e) => setProposedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Proposed Time</Label>
                    <Input type="time" value={proposedTime} onChange={(e) => setProposedTime(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reason for Rescheduling (Optional)</Label>
                  <Textarea
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    placeholder="Let us know why you need to reschedule..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setRescheduleDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRequestReschedule}
                    className="flex-1 bg-primary text-primary-foreground"
                    disabled={!proposedDate || !proposedTime || isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <BookingModal open={bookingModalOpen} onOpenChange={setBookingModalOpen} />
    </div>
  )
}
