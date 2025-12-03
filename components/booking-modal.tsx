"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, ArrowLeft, Calendar, Clock } from "lucide-react"
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
        {isSuccess ? (
          <div className="text-center py-12 px-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl sm:text-3xl text-center">Booking Confirmed!</DialogTitle>
              <DialogDescription className="text-center mt-4 text-base">
                Your consultation has been scheduled for{" "}
                <strong className="text-foreground block mt-2 text-lg">
                  {formatDate(formData.date)} at {formData.time}
                </strong>
              </DialogDescription>
            </DialogHeader>
            <p className="text-muted-foreground mb-8">
              We've sent a confirmation email to <strong>{formData.clientEmail}</strong>. Our team will contact you
              shortly with further details.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleClose} size="lg">
                Close
              </Button>
              <Button onClick={handleBookAnother} size="lg">
                Book Another
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-primary text-primary-foreground p-6 sm:p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl sm:text-3xl text-primary-foreground">
                  {step === "calendar" ? "Book a Free Consultation" : "Complete Your Booking"}
                </DialogTitle>
                <DialogDescription className="text-primary-foreground/80 mt-2 text-base">
                  {step === "calendar" ? (
                    "Select your preferred date and time from our available slots."
                  ) : (
                    <span className="flex items-center gap-4 flex-wrap mt-2">
                      <span className="flex items-center gap-2 bg-primary-foreground/10 px-3 py-1.5 rounded-full">
                        <Calendar className="h-4 w-4" />
                        {formatDate(formData.date)}
                      </span>
                      <span className="flex items-center gap-2 bg-primary-foreground/10 px-3 py-1.5 rounded-full">
                        <Clock className="h-4 w-4" />
                        {formData.time}
                      </span>
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-6 sm:p-8">
              {step === "calendar" ? (
                <div>
                  <BookingCalendar
                    onSelectSlot={handleSlotSelect}
                    selectedDate={formData.date}
                    selectedTime={formData.time}
                  />

                  {formData.date && formData.time && (
                    <div className="mt-8 pt-6 border-t text-center">
                      <p className="text-muted-foreground mb-4">
                        You selected: <strong className="text-foreground">{formatDate(formData.date)}</strong> at{" "}
                        <strong className="text-foreground">{formData.time}</strong>
                      </p>
                      <Button onClick={() => setStep("details")} size="lg" className="min-w-[200px]">
                        Continue to Details
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        placeholder="John Doe"
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        placeholder="john@example.com"
                        required
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        placeholder="+1 234 567 8901"
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service">Service Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consultation">General Consultation</SelectItem>
                          <SelectItem value="document_review">Document Review</SelectItem>
                          <SelectItem value="interview_prep">Interview Preparation</SelectItem>
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
                      placeholder="Tell us about your goals, questions, or any specific topics you'd like to discuss..."
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-4 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setStep("calendar")} size="lg">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" size="lg" disabled={isSubmitting || !formData.type}>
                      {isSubmitting ? "Booking..." : "Confirm Booking"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
