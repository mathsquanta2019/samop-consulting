"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CheckCircle, Calendar, Clock, ChevronLeft, ChevronRight, CreditCard, Ticket, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  getAvailableBookingSlots,
  getAvailability,
  getAppointmentFees,
  validateAccessCode,
  createAppointmentWithPayment,
  initiatePayment,
} from "@/lib/api"
import type { BookingSlot, AvailabilitySchedule, AppointmentFee, PaymentProvider } from "@/lib/types"
import { cn } from "@/lib/utils"

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "calendar" | "details" | "payment" | "success"

const serviceTypeLabels: Record<string, string> = {
  consultation: "Initial Consultation",
  document_review: "Document Review",
  interview_prep: "Interview Preparation",
  visa_guidance: "Visa Guidance",
}

export function BookingModal({ open, onOpenChange }: BookingModalProps) {
  const [step, setStep] = useState<Step>("calendar")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [monthAvailability, setMonthAvailability] = useState<AvailabilitySchedule[]>([])
  const [isLoadingMonth, setIsLoadingMonth] = useState(true)
  const [fees, setFees] = useState<AppointmentFee[]>([])
  const [selectedFee, setSelectedFee] = useState<AppointmentFee | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"payment" | "accessCode">("payment")
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>("stripe")
  const [accessCode, setAccessCode] = useState("")
  const [accessCodeError, setAccessCodeError] = useState("")
  const [accessCodeValid, setAccessCodeValid] = useState(false)

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    countryCode: "+1",
    type: "",
    date: "",
    time: "",
    notes: "",
  })

  const today = useMemo(() => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return t
  }, [])

  useEffect(() => {
    if (open) {
      loadMonthAvailability()
      loadFees()
    }
  }, [currentMonth, open])

  useEffect(() => {
    if (selectedDay) {
      loadSlots(selectedDay)
    }
  }, [selectedDay])

  useEffect(() => {
    if (formData.type) {
      const fee = fees.find((f) => f.serviceType === formData.type)
      setSelectedFee(fee || null)
    }
  }, [formData.type, fees])

  const loadFees = async () => {
    const result = await getAppointmentFees()
    if (result.success && result.data) {
      setFees(result.data)
    }
  }

  const loadMonthAvailability = async () => {
    setIsLoadingMonth(true)
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const startDate = new Date(year, month, 1).toISOString().split("T")[0]
    const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0]
    const result = await getAvailability(startDate, endDate)
    if (result.success && result.data) {
      setMonthAvailability(result.data)
    }
    setIsLoadingMonth(false)
  }

  const loadSlots = async (date: Date) => {
    setIsLoadingSlots(true)
    const dateStr = date.toISOString().split("T")[0]
    const result = await getAvailableBookingSlots(dateStr)
    if (result.success && result.data) {
      setAvailableSlots(result.data)
    } else {
      setAvailableSlots([])
    }
    setIsLoadingSlots(false)
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setStep("calendar")
      setSelectedDay(null)
      setAccessCode("")
      setAccessCodeError("")
      setAccessCodeValid(false)
      setFormData({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        countryCode: "+1",
        type: "",
        date: "",
        time: "",
        notes: "",
      })
    }, 300)
  }

  const handleDayClick = (date: Date) => {
    if (isPastDate(date)) return
    setSelectedDay(date)
    setFormData({ ...formData, date: date.toISOString().split("T")[0], time: "" })
  }

  const handleTimeSelect = (slot: BookingSlot) => {
    if (!slot.available) return
    setFormData({ ...formData, date: slot.date, time: slot.time })
  }

  const isPastDate = (date: Date) => {
    const check = new Date(date)
    check.setHours(0, 0, 0, 0)
    return check < today
  }

  const getAvailableSlotsCount = (date: Date): number => {
    const dateStr = date.toISOString().split("T")[0]
    const availability = monthAvailability.find((a) => a.date === dateStr)
    if (!availability) return 0
    let count = 0
    availability.slots.forEach((slot) => {
      const [startH, startM] = slot.start.split(":").map(Number)
      const [endH, endM] = slot.end.split(":").map(Number)
      const startMins = startH * 60 + startM
      const endMins = endH * 60 + endM
      count += Math.floor((endMins - startMins) / 30)
    })
    return count
  }

  const hasAvailability = (date: Date): boolean => {
    const dateStr = date.toISOString().split("T")[0]
    return monthAvailability.some((a) => a.date === dateStr)
  }

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startingDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    const days: (Date | null)[] = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    return days
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev)
      if (direction === "prev") {
        newMonth.setMonth(newMonth.getMonth() - 1)
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1)
      }
      return newMonth
    })
    setSelectedDay(null)
    setFormData((prev) => ({ ...prev, date: "", time: "" }))
  }

  const formatDateLong = (dateStr: string) => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleValidateAccessCode = async () => {
    if (!accessCode.trim()) {
      setAccessCodeError("Please enter an access code")
      return
    }
    setIsSubmitting(true)
    setAccessCodeError("")
    const result = await validateAccessCode(accessCode.trim())
    if (result.success && result.data) {
      setAccessCodeValid(true)
      setAccessCodeError("")
    } else {
      setAccessCodeError(result.error || "Invalid or expired access code")
      setAccessCodeValid(false)
    }
    setIsSubmitting(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (paymentMethod === "payment" && selectedFee) {
      // Initiate payment
      const paymentResult = await initiatePayment({
        appointmentId: "pending",
        amount: selectedFee.amount,
        currency: selectedFee.currency,
        provider: selectedProvider,
        email: formData.clientEmail,
      })

      if (paymentResult.success && paymentResult.data) {
        // In real implementation, redirect to payment URL
        // For mock, we'll simulate successful payment
        const result = await createAppointmentWithPayment({
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: `${formData.countryCode} ${formData.clientPhone}`,
          type: formData.type as any,
          date: formData.date,
          time: formData.time,
          duration: 60,
          notes: formData.notes,
          paymentReference: paymentResult.data.reference,
        })

        if (result.success) {
          setStep("success")
        }
      }
    } else if (paymentMethod === "accessCode" && accessCodeValid) {
      const result = await createAppointmentWithPayment({
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: `${formData.countryCode} ${formData.clientPhone}`,
        type: formData.type as any,
        date: formData.date,
        time: formData.time,
        duration: 60,
        notes: formData.notes,
        accessCode: accessCode,
      })

      if (result.success) {
        setStep("success")
      }
    }

    setIsSubmitting(false)
  }

  const days = generateCalendarDays()
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
  const monthYearStr = currentMonth.toLocaleDateString("en-US", { month: "short", year: "numeric" })

  const canProceedToDetails = formData.date && formData.time
  const canProceedToPayment = formData.clientName && formData.clientEmail && formData.clientPhone && formData.type
  const canSubmit =
    (paymentMethod === "payment" && selectedProvider) || (paymentMethod === "accessCode" && accessCodeValid)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0">
        {step === "success" ? (
          <div className="text-center py-12 px-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl text-center">Booking Confirmed!</DialogTitle>
              <DialogDescription className="text-center mt-4 text-base">
                Your consultation has been scheduled for
                <strong className="text-foreground block mt-2 text-lg">
                  {formatDateLong(formData.date)} at {formData.time} CST
                </strong>
              </DialogDescription>
            </DialogHeader>
            <p className="text-muted-foreground mb-8">
              A confirmation email has been sent to <strong>{formData.clientEmail}</strong>
            </p>
            <Button onClick={handleClose} size="lg">
              Close
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-5">
              <DialogHeader>
                <DialogTitle className="text-xl text-primary-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {step === "calendar" && "Select Date & Time"}
                  {step === "details" && "Your Details"}
                  {step === "payment" && "Payment"}
                </DialogTitle>
                <DialogDescription className="text-primary-foreground/80 mt-1 text-sm">
                  {step === "calendar" && "Choose an available slot for your consultation."}
                  {step === "details" && "Fill in your contact information."}
                  {step === "payment" && "Complete your booking with payment or access code."}
                </DialogDescription>
              </DialogHeader>

              {/* Progress indicator */}
              <div className="flex items-center gap-2 mt-4">
                {["calendar", "details", "payment"].map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        step === s || ["calendar", "details", "payment"].indexOf(step) > i
                          ? "bg-primary-foreground"
                          : "bg-primary-foreground/30",
                      )}
                    />
                    {i < 2 && (
                      <div
                        className={cn(
                          "h-0.5 w-8",
                          ["calendar", "details", "payment"].indexOf(step) > i
                            ? "bg-primary-foreground"
                            : "bg-primary-foreground/30",
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5">
              {step === "calendar" && (
                <TooltipProvider delayDuration={100}>
                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Calendar */}
                    <div className="border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth("prev")}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h3 className="font-semibold text-sm whitespace-nowrap">{monthYearStr}</h3>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth("next")}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-7 gap-1 mb-1">
                        {weekDays.map((day) => (
                          <div
                            key={day}
                            className="h-8 flex items-center justify-center text-[10px] font-medium text-muted-foreground uppercase"
                          >
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {days.map((date, index) => {
                          if (!date) {
                            return <div key={`empty-${index}`} className="h-9" />
                          }

                          const isPast = isPastDate(date)
                          const hasSlots = hasAvailability(date)
                          const slotsCount = getAvailableSlotsCount(date)
                          const isSelected = selectedDay && date.toDateString() === selectedDay.toDateString()
                          const isToday = date.toDateString() === today.toDateString()

                          const dayButton = (
                            <button
                              key={date.toISOString()}
                              onClick={() => !isPast && hasSlots && handleDayClick(date)}
                              disabled={isPast || !hasSlots}
                              className={cn(
                                "h-9 w-full rounded-md text-sm font-medium transition-all relative",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                isPast && "text-muted-foreground/30 cursor-not-allowed",
                                !isPast && !hasSlots && "text-muted-foreground/40 cursor-not-allowed",
                                !isPast &&
                                  hasSlots &&
                                  !isSelected &&
                                  "bg-secondary/30 text-foreground hover:bg-secondary/50 cursor-pointer",
                                isSelected && "bg-primary text-primary-foreground",
                                isToday && !isSelected && "ring-1 ring-primary",
                              )}
                            >
                              {date.getDate()}
                              {!isPast && hasSlots && !isSelected && (
                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-secondary" />
                              )}
                            </button>
                          )

                          if (!isPast && hasSlots) {
                            return (
                              <Tooltip key={date.toISOString()}>
                                <TooltipTrigger asChild>{dayButton}</TooltipTrigger>
                                <TooltipContent side="top" className="bg-foreground text-background px-2 py-1 text-xs">
                                  {slotsCount} slot{slotsCount !== 1 ? "s" : ""}
                                </TooltipContent>
                              </Tooltip>
                            )
                          }

                          return dayButton
                        })}
                      </div>

                      <div className="mt-3 pt-3 border-t flex items-center gap-4 text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2.5 w-2.5 rounded bg-secondary/40" />
                          <span className="text-muted-foreground">Available</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="h-2.5 w-2.5 rounded bg-primary" />
                          <span className="text-muted-foreground">Selected</span>
                        </div>
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div className="border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold text-sm">
                          {selectedDay
                            ? selectedDay.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })
                            : "Available Times"}
                        </h3>
                      </div>

                      {!selectedDay ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <Calendar className="h-10 w-10 text-muted-foreground/30 mb-3" />
                          <p className="text-muted-foreground text-sm">Select a date to view times</p>
                        </div>
                      ) : isLoadingSlots ? (
                        <div className="flex flex-col items-center justify-center py-10">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <p className="mt-3 text-muted-foreground text-sm">Loading...</p>
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <p className="text-muted-foreground text-sm">No slots available</p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-1">
                            {availableSlots.map((slot) => {
                              const isSelected = formData.date === slot.date && formData.time === slot.time
                              return (
                                <Button
                                  key={`${slot.date}-${slot.time}`}
                                  variant={isSelected ? "default" : "outline"}
                                  size="sm"
                                  className={cn(
                                    "h-9 text-xs",
                                    !slot.available && "opacity-40 cursor-not-allowed line-through",
                                  )}
                                  disabled={!slot.available}
                                  onClick={() => handleTimeSelect(slot)}
                                >
                                  {slot.time}
                                </Button>
                              )
                            })}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-3 text-center">
                            All times in Central Standard Time (CST)
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {canProceedToDetails && (
                    <div className="mt-5 pt-5 border-t flex justify-end">
                      <Button onClick={() => setStep("details")}>
                        Continue
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TooltipProvider>
              )}

              {step === "details" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDateLong(formData.date)}</span>
                    <span className="text-muted-foreground">at</span>
                    <span className="font-medium">{formData.time} CST</span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        placeholder="John Doe"
                        required
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
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="flex gap-2">
                        <Select
                          value={formData.countryCode}
                          onValueChange={(v) => setFormData({ ...formData, countryCode: v })}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+1">+1 (US)</SelectItem>
                            <SelectItem value="+44">+44 (UK)</SelectItem>
                            <SelectItem value="+234">+234 (NG)</SelectItem>
                            <SelectItem value="+49">+49 (DE)</SelectItem>
                            <SelectItem value="+33">+33 (FR)</SelectItem>
                            <SelectItem value="+61">+61 (AU)</SelectItem>
                            <SelectItem value="+64">+64 (NZ)</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.clientPhone}
                          onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                          placeholder="234 567 8901"
                          className="flex-1"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Service Type *</Label>
                      <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consultation">Initial Consultation</SelectItem>
                          <SelectItem value="document_review">Document Review</SelectItem>
                          <SelectItem value="interview_prep">Interview Preparation</SelectItem>
                          <SelectItem value="visa_guidance">Visa Guidance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any specific topics you'd like to discuss..."
                      rows={3}
                    />
                  </div>

                  <div className="pt-4 border-t flex items-center justify-between">
                    <Button variant="ghost" onClick={() => setStep("calendar")}>
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={() => setStep("payment")} disabled={!canProceedToPayment}>
                      Continue to Payment
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === "payment" && (
                <div className="space-y-5">
                  {selectedFee && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{serviceTypeLabels[formData.type]}</p>
                          <p className="text-sm text-muted-foreground">{selectedFee.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${selectedFee.amount}</p>
                          <p className="text-xs text-muted-foreground">{selectedFee.currency}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as "payment" | "accessCode")}
                    className="grid gap-3"
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors",
                        paymentMethod === "payment" && "border-primary bg-primary/5",
                      )}
                      onClick={() => setPaymentMethod("payment")}
                    >
                      <RadioGroupItem value="payment" id="payment" />
                      <Label htmlFor="payment" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span className="font-medium">Pay Now</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Secure payment via Stripe, PayPal, Paystack, or Flutterwave
                        </p>
                      </Label>
                    </div>

                    <div
                      className={cn(
                        "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors",
                        paymentMethod === "accessCode" && "border-primary bg-primary/5",
                      )}
                      onClick={() => setPaymentMethod("accessCode")}
                    >
                      <RadioGroupItem value="accessCode" id="accessCode" />
                      <Label htmlFor="accessCode" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4" />
                          <span className="font-medium">I Have an Access Code</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Use a code provided by SAMOP Consulting for free booking
                        </p>
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "payment" && (
                    <div className="space-y-3">
                      <Label>Select Payment Provider</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: "stripe", name: "Stripe", region: "USA/Global" },
                          { id: "paypal", name: "PayPal", region: "USA/Global" },
                          { id: "paystack", name: "Paystack", region: "Nigeria" },
                          { id: "flutterwave", name: "Flutterwave", region: "Nigeria" },
                        ].map((provider) => (
                          <button
                            key={provider.id}
                            type="button"
                            onClick={() => setSelectedProvider(provider.id as PaymentProvider)}
                            className={cn(
                              "p-3 border rounded-lg text-left transition-colors",
                              selectedProvider === provider.id && "border-primary bg-primary/5",
                            )}
                          >
                            <p className="font-medium text-sm">{provider.name}</p>
                            <p className="text-xs text-muted-foreground">{provider.region}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {paymentMethod === "accessCode" && (
                    <div className="space-y-3">
                      <Label htmlFor="accessCodeInput">Enter Access Code</Label>
                      <div className="flex gap-2">
                        <Input
                          id="accessCodeInput"
                          value={accessCode}
                          onChange={(e) => {
                            setAccessCode(e.target.value.toUpperCase())
                            setAccessCodeError("")
                            setAccessCodeValid(false)
                          }}
                          placeholder="SAMOP-XXXXXX"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleValidateAccessCode}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                        </Button>
                      </div>
                      {accessCodeError && <p className="text-sm text-destructive">{accessCodeError}</p>}
                      {accessCodeValid && (
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          Access code valid - Free booking!
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-4 border-t flex items-center justify-between">
                    <Button variant="ghost" onClick={() => setStep("details")}>
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : paymentMethod === "payment" ? (
                        <>
                          Pay ${selectedFee?.amount || 0}
                          <CreditCard className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        "Complete Booking"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
