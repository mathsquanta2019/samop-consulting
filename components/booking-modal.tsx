"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, ArrowLeft, Calendar, Clock, ChevronLeft, ChevronRight, Mail, Phone, User } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getAvailableBookingSlots, getAvailability, createAppointment } from "@/lib/api"
import type { BookingSlot, AvailabilitySchedule } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useEffect, useMemo } from "react"

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookingModal({ open, onOpenChange }: BookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [step, setStep] = useState<"calendar" | "details">("calendar")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [monthAvailability, setMonthAvailability] = useState<AvailabilitySchedule[]>([])
  const [isLoadingMonth, setIsLoadingMonth] = useState(true)
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
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
    }
  }, [currentMonth, open])

  useEffect(() => {
    if (selectedDay) {
      loadSlots(selectedDay)
    }
  }, [selectedDay])

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
      setSelectedDay(null)
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

  const handleDayClick = (date: Date) => {
    if (isPastDate(date)) return
    setSelectedDay(date)
    setFormData({ ...formData, date: date.toISOString().split("T")[0], time: "" })
  }

  const handleTimeSelect = (slot: BookingSlot) => {
    if (!slot.available) return
    handleSlotSelect(slot.date, slot.time)
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

  const days = generateCalendarDays()
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0">
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
              We've sent a confirmation email to <strong>{formData.clientEmail}</strong>
            </p>
            <Button onClick={handleClose} size="lg">
              Close
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-6">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl text-primary-foreground flex items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  {step === "calendar" ? "Book a Free Consultation" : "Complete Your Booking"}
                </DialogTitle>
                <DialogDescription className="text-primary-foreground/80 mt-2">
                  {step === "calendar" ? (
                    "Select your preferred date and time from our available slots."
                  ) : (
                    <span className="flex items-center gap-3 flex-wrap mt-2">
                      <span className="flex items-center gap-2 bg-primary-foreground/10 px-3 py-1.5 rounded-full text-sm">
                        <Calendar className="h-4 w-4" />
                        {formatDate(formData.date)}
                      </span>
                      <span className="flex items-center gap-2 bg-primary-foreground/10 px-3 py-1.5 rounded-full text-sm">
                        <Clock className="h-4 w-4" />
                        {formData.time}
                      </span>
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-6">
              {step === "calendar" ? (
                <TooltipProvider delayDuration={100}>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Calendar Section */}
                    <div className="bg-muted/30 rounded-xl p-4 sm:p-5">
                      {/* Month Navigation */}
                      <div className="flex items-center justify-between mb-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth("prev")}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h3 className="font-semibold text-sm sm:text-base">
                          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </h3>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth("next")}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Weekday Headers */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map((day) => (
                          <div
                            key={day}
                            className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
                          >
                            {day.slice(0, 2)}
                          </div>
                        ))}
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {days.map((date, index) => {
                          if (!date) {
                            return <div key={`empty-${index}`} className="h-9 sm:h-10" />
                          }

                          const isPast = isPastDate(date)
                          const hasSlots = hasAvailability(date)
                          const slotsCount = getAvailableSlotsCount(date)
                          const isSelected = selectedDay && date.toDateString() === selectedDay.toDateString()
                          const isToday = date.toDateString() === today.toDateString()

                          const dayButton = (
                            <button
                              key={date.toISOString()}
                              onClick={() => handleDayClick(date)}
                              disabled={isPast || !hasSlots}
                              className={cn(
                                "h-9 sm:h-10 w-full rounded-lg text-sm font-medium transition-all relative",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                isPast && "text-muted-foreground/30 cursor-not-allowed",
                                !isPast && !hasSlots && "text-muted-foreground/50 cursor-not-allowed",
                                !isPast &&
                                  hasSlots &&
                                  !isSelected &&
                                  "bg-secondary/20 text-secondary-foreground hover:bg-secondary/40 cursor-pointer",
                                isSelected && "bg-primary text-primary-foreground shadow-md",
                                isToday && !isSelected && "ring-2 ring-primary/40",
                              )}
                            >
                              {date.getDate()}
                              {!isPast && hasSlots && !isSelected && (
                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-secondary" />
                              )}
                            </button>
                          )

                          if (!isPast && hasSlots) {
                            return (
                              <Tooltip key={date.toISOString()}>
                                <TooltipTrigger asChild>{dayButton}</TooltipTrigger>
                                <TooltipContent side="top" className="bg-primary text-primary-foreground px-3 py-2">
                                  <p className="font-semibold text-sm">
                                    {slotsCount} slot{slotsCount !== 1 ? "s" : ""} available
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            )
                          }

                          return dayButton
                        })}
                      </div>

                      {/* Legend */}
                      <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded bg-secondary/30" />
                          <span className="text-muted-foreground">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded bg-primary" />
                          <span className="text-muted-foreground">Selected</span>
                        </div>
                      </div>
                    </div>

                    {/* Time Slots Section */}
                    <div className="bg-muted/30 rounded-xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold text-sm sm:text-base">
                          {selectedDay
                            ? selectedDay.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })
                            : "Select a Date"}
                        </h3>
                      </div>

                      {!selectedDay ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Calendar className="h-7 w-7 text-muted-foreground/50" />
                          </div>
                          <p className="text-muted-foreground text-sm">
                            Select a highlighted date to view available times
                          </p>
                        </div>
                      ) : isLoadingSlots ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                          <p className="mt-4 text-muted-foreground text-sm">Loading times...</p>
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <p className="text-muted-foreground text-sm">No available slots for this date</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 max-h-[250px] overflow-y-auto">
                          {availableSlots.map((slot) => {
                            const isSelected = formData.date === slot.date && formData.time === slot.time
                            return (
                              <Button
                                key={`${slot.date}-${slot.time}`}
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                className={cn(
                                  "h-10 text-sm",
                                  !slot.available && "opacity-40 cursor-not-allowed line-through",
                                  isSelected && "ring-2 ring-offset-2 ring-primary",
                                )}
                                disabled={!slot.available}
                                onClick={() => handleTimeSelect(slot)}
                              >
                                {slot.time}
                              </Button>
                            )
                          })}
                        </div>
                      )}

                      {availableSlots.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-4 text-center">All times in Eastern Time (ET)</p>
                      )}
                    </div>
                  </div>

                  {/* Continue Button */}
                  {formData.date && formData.time && (
                    <div className="mt-6 pt-6 border-t text-center">
                      <Button onClick={() => setStep("details")} size="lg" className="min-w-[200px]">
                        Continue to Details
                      </Button>
                    </div>
                  )}
                </TooltipProvider>
              ) : (
                /* Details Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Full Name
                      </Label>
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
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Email Address
                      </Label>
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

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Phone Number
                      </Label>
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
                      <Label htmlFor="service">Service Type</Label>
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
                      placeholder="Tell us about your goals or questions..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
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
