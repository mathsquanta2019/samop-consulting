"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, ArrowLeft } from "lucide-react"
import { BookingCalendar } from "@/components/booking-calendar"
import { createAppointment } from "@/lib/api"

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookingModal({ open, onOpenChange }: BookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [step, setStep] = useState<"calendar" | "details">("calendar")
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    type: "",
    date: "",
    time: "",
    notes: "",
  })

  const handleSlotSelect = (date: string, time: string) => {
    setFormData({ ...formData, date, time })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const result = await createAppointment({
      ...formData,
      type: formData.type as "consultation" | "document_review" | "interview_prep" | "visa_guidance",
      duration: 60,
    })

    if (result.success) {
      setIsSuccess(true)
    }
    setIsSubmitting(false)
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset after close animation
    setTimeout(() => {
      setIsSuccess(false)
      setStep("calendar")
      setFormData({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        type: "",
        date: "",
        time: "",
        notes: "",
      })
    }, 300)
  }

  const handleBookAnother = () => {
    setIsSuccess(false)
    setStep("calendar")
    setFormData({
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      type: "",
      date: "",
      time: "",
      notes: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
          <div className="text-center py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl text-center">Booking Confirmed!</DialogTitle>
              <DialogDescription className="text-center mt-2">
                We've received your appointment request for{" "}
                <strong className="text-foreground">
                  {new Date(formData.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </strong>{" "}
                at <strong className="text-foreground">{formData.time}</strong>. Our team will contact you shortly to
                confirm the details.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={handleBookAnother}>Book Another</Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{step === "calendar" ? "Book a Consultation" : "Complete Your Booking"}</DialogTitle>
              <DialogDescription>
                {step === "calendar"
                  ? "Select a date and time for your free consultation with our expert advisors."
                  : `Appointment for ${formData.date ? new Date(formData.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : ""} at ${formData.time}`}
              </DialogDescription>
            </DialogHeader>

            {step === "calendar" ? (
              <div className="mt-4">
                <BookingCalendar
                  onSelectSlot={handleSlotSelect}
                  selectedDate={formData.date}
                  selectedTime={formData.time}
                />

                {formData.date && formData.time && (
                  <div className="mt-6 text-center border-t pt-6">
                    <p className="text-muted-foreground mb-4">
                      Selected:{" "}
                      <strong className="text-foreground">
                        {new Date(formData.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </strong>{" "}
                      at <strong className="text-foreground">{formData.time}</strong>
                    </p>
                    <Button onClick={() => setStep("details")} size="lg">
                      Continue to Details
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      placeholder="+1 234 567 8901"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service">Service Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">General Consultation</SelectItem>
                        <SelectItem value="document_review">Document Review</SelectItem>
                        <SelectItem value="interview_prep">Interview Prep</SelectItem>
                        <SelectItem value="visa_guidance">Visa Guidance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Tell us about your goals and any specific questions..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setStep("calendar")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting || !formData.type}>
                    {isSubmitting ? "Booking..." : "Confirm Booking"}
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
