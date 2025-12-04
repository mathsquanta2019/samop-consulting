"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  getAppointmentFees,
  getAvailability,
  getAvailableSlots,
  validateAccessCode,
  createAppointmentWithPayment,
} from "@/lib/api"
import type { AppointmentFee, AvailabilitySchedule, BookingSlot } from "@/lib/types"

// Icons as inline SVGs to avoid lucide-react issues
const Calendar = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
)

const Clock = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const ChevronLeft = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
)

const ChevronRight = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
)

const Loader2 = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

const CheckCircle = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isClientPortal?: boolean
  clientInfo?: {
    name: string
    email: string
    phone: string
  }
}

type Step = "calendar" | "details" | "payment" | "confirmation"

const countryCodes = [
  { code: "+1", country: "US/CA" },
  { code: "+44", country: "UK" },
  { code: "+234", country: "NG" },
  { code: "+91", country: "IN" },
  { code: "+49", country: "DE" },
  { code: "+33", country: "FR" },
  { code: "+86", country: "CN" },
  { code: "+81", country: "JP" },
]

export function BookingModal({ open, onOpenChange, isClientPortal, clientInfo }: BookingModalProps) {
  const [step, setStep] = useState<Step>("calendar")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [fees, setFees] = useState<AppointmentFee[]>([])
  const [monthAvailability, setMonthAvailability] = useState<AvailabilitySchedule[]>([])
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([])
  const [isLoadingMonth, setIsLoadingMonth] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [selectedFee, setSelectedFee] = useState<AppointmentFee | null>(null)
  const [accessCode, setAccessCode] = useState("")
  const [accessCodeError, setAccessCodeError] = useState("")
  const [accessCodeValid, setAccessCodeValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    clientName: clientInfo?.name || "",
    clientEmail: clientInfo?.email || "",
    clientPhone: clientInfo?.phone || "",
    countryCode: "+1",
    type: "",
    date: "",
    time: "",
    notes: "",
  })

  useEffect(() => {
    if (open) {
      loadFees()
      loadMonthAvailability()
      // Pre-fill client info if available
      if (clientInfo) {
        setFormData((prev) => ({
          ...prev,
          clientName: clientInfo.name,
          clientEmail: clientInfo.email,
          clientPhone: clientInfo.phone,
        }))
      }
    }
  }, [open, currentMonth, clientInfo])

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
    const result = await getAvailableSlots(dateStr)
    if (result.success && result.data) {
      // Convert string[] to BookingSlot[]
      const bookingSlots: BookingSlot[] = result.data.map((time: string) => ({
        date: dateStr,
        time,
        available: true,
      }))
      setAvailableSlots(bookingSlots)
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
        clientName: clientInfo?.name || "",
        clientEmail: clientInfo?.email || "",
        clientPhone: clientInfo?.phone || "",
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

  const isPastDate = (date: Date): boolean => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
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

  const canProceedToDetails = formData.date && formData.time

  const handleAccessCodeValidation = async () => {
    if (!accessCode) {
      setAccessCodeError("Please enter an access code")
      return
    }
    const result = await validateAccessCode(accessCode)
    if (result.success) {
      setAccessCodeValid(true)
      setAccessCodeError("")
    } else {
      setAccessCodeError(result.error || "Invalid access code")
      setAccessCodeValid(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const result = await createAppointmentWithPayment({
      name: formData.clientName,
      email: formData.clientEmail,
      phone: `${formData.countryCode} ${formData.clientPhone}`,
      serviceType: formData.type,
      date: formData.date,
      time: formData.time,
      notes: formData.notes,
      paymentMethod: "stripe",
      accessCode: accessCodeValid ? accessCode : undefined,
    })

    if (result.success) {
      setStep("confirmation")
    }
    setIsSubmitting(false)
  }

  const formatDateLong = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Calendar rendering
  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isPast = isPastDate(date)
      const hasSlots = hasAvailability(date)
      const slotsCount = getAvailableSlotsCount(date)
      const isSelected = selectedDay?.toDateString() === date.toDateString()

      days.push(
        <TooltipProvider key={day}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => handleDayClick(date)}
                disabled={isPast || !hasSlots}
                className={cn(
                  "h-10 w-10 rounded-lg text-sm font-medium transition-all relative",
                  isPast && "text-muted-foreground/40 cursor-not-allowed",
                  !isPast && !hasSlots && "text-muted-foreground/60 cursor-not-allowed",
                  !isPast && hasSlots && "hover:bg-primary/10 cursor-pointer",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                  !isPast && hasSlots && !isSelected && "text-foreground",
                )}
              >
                {day}
                {!isPast && hasSlots && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-green-500" />
                )}
              </button>
            </TooltipTrigger>
            {!isPast && hasSlots && (
              <TooltipContent>
                <p>{slotsCount} slots available</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>,
      )
    }

    return days
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === "calendar" && "Book an Appointment"}
            {step === "details" && "Your Details"}
            {step === "payment" && "Payment"}
            {step === "confirmation" && "Booking Confirmed!"}
          </DialogTitle>
          <DialogDescription>
            {step === "calendar" && "Select a date and time for your consultation"}
            {step === "details" && "Enter your contact information"}
            {step === "payment" && "Complete your booking"}
            {step === "confirmation" && "Your appointment has been scheduled"}
          </DialogDescription>
        </DialogHeader>

        {step === "calendar" && (
          <TooltipProvider>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Calendar */}
              <div className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="font-semibold">
                    {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="h-8 flex items-center justify-center font-medium">
                      {d}
                    </div>
                  ))}
                </div>

                {isLoadingMonth ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
                )}
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
              <span className="font-medium">{formData.time}</span>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.countryCode}
                    onValueChange={(v) => setFormData({ ...formData, countryCode: v })}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countryCodes.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.code} ({c.country})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="123 456 7890"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Service Type *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {fees.map((fee) => (
                      <SelectItem key={fee.id} value={fee.serviceType}>
                        {fee.description} - ${fee.amount}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Anything you'd like us to know..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep("calendar")}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!formData.clientName || !formData.clientEmail || !formData.clientPhone || !formData.type}
                onClick={() => setStep("payment")}
              >
                Continue to Payment
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === "payment" && (
          <div className="space-y-5">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-3">Booking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{formatDateLong(formData.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span>{formData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service:</span>
                  <span>{selectedFee?.description}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total:</span>
                  <span>${selectedFee?.amount || 0}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Have an access code?</Label>
              <div className="flex gap-2">
                <Input
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value)
                    setAccessCodeError("")
                    setAccessCodeValid(false)
                  }}
                  placeholder="Enter access code"
                  className="flex-1"
                />
                <Button variant="outline" onClick={handleAccessCodeValidation}>
                  Apply
                </Button>
              </div>
              {accessCodeError && <p className="text-sm text-red-500">{accessCodeError}</p>}
              {accessCodeValid && <p className="text-sm text-green-600">Access code applied! Payment waived.</p>}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep("details")}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : accessCodeValid ? (
                  "Confirm Booking"
                ) : (
                  `Pay $${selectedFee?.amount || 0}`
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "confirmation" && (
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
            <p className="text-muted-foreground mb-6">
              Your appointment has been scheduled for {formatDateLong(formData.date)} at {formData.time}.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              A confirmation email has been sent to {formData.clientEmail}.
            </p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
