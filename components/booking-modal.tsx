"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  BuildingIcon,
  SmartphoneIcon,
} from "@/components/icons"
import {
  getConsultationServices,
  getMonthAvailability,
  getAvailableSlots,
  validateAccessCode,
  createAppointment,
} from "@/lib/api"
import type { BookingSlot } from "@/lib/types"

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedService?: string
}

interface ConsultationService {
  id: string
  name: string
  description: string
  price: number
  duration: string
}

interface DayAvailability {
  date: string
  available: boolean
  slotsCount?: number
}

type Step = "service" | "calendar" | "time" | "details" | "payment" | "confirm"
type PaymentMethod = "credit_card" | "bank_transfer" | "paypal" | "mobile_money"

const paymentMethods = [
  {
    id: "credit_card" as PaymentMethod,
    name: "Credit/Debit Card",
    description: "Visa, Mastercard, Amex",
    icon: CreditCardIcon,
  },
  {
    id: "bank_transfer" as PaymentMethod,
    name: "Bank Transfer",
    description: "Direct bank payment",
    icon: BuildingIcon,
  },
  { id: "paypal" as PaymentMethod, name: "PayPal", description: "Pay with PayPal", icon: CreditCardIcon },
  {
    id: "mobile_money" as PaymentMethod,
    name: "Mobile Money",
    description: "M-Pesa, MTN, Airtel",
    icon: SmartphoneIcon,
  },
]

export function BookingModal({ open, onOpenChange, preselectedService }: BookingModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: preselectedService || "",
    date: "",
    time: "",
    notes: "",
  })

  const [step, setStep] = useState<Step>("service")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [services, setServices] = useState<ConsultationService[]>([])
  const [selectedService, setSelectedService] = useState<ConsultationService | null>(null)
  const [monthAvailability, setMonthAvailability] = useState<DayAvailability[]>([])
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(false)
  const [isLoadingMonth, setIsLoadingMonth] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [accessCode, setAccessCode] = useState("")
  const [accessCodeError, setAccessCodeError] = useState("")
  const [hasValidCode, setHasValidCode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")

  useEffect(() => {
    if (open) {
      loadServices()
    }
  }, [open])

  useEffect(() => {
    if (open && step === "calendar") {
      loadMonthAvailability()
    }
  }, [open, currentMonth, step])

  useEffect(() => {
    if (selectedDay) {
      loadSlots(selectedDay)
    }
  }, [selectedDay])

  useEffect(() => {
    if (preselectedService && services.length > 0 && !selectedService) {
      const found = services.find((s) => s.id === preselectedService)
      if (found) {
        setSelectedService(found)
        setFormData((prev) => ({ ...prev, service: found.id }))
        setStep("calendar")
      }
    }
  }, [preselectedService, services])

  const loadServices = async () => {
    setIsLoadingServices(true)
    const result = await getConsultationServices()
    if (result.success && result.data) {
      setServices(result.data)
    }
    setIsLoadingServices(false)
  }

  const loadMonthAvailability = async () => {
    setIsLoadingMonth(true)
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const result = await getMonthAvailability(year, month)
    if (result.success && result.data) {
      const availabilityWithCounts: DayAvailability[] = await Promise.all(
        result.data.map(async (day: { date: string; available: boolean }) => {
          if (day.available) {
            const slotsResult = await getAvailableSlots(day.date)
            return {
              ...day,
              slotsCount: slotsResult.success ? slotsResult.data?.length || 0 : 0,
            }
          }
          return { ...day, slotsCount: 0 }
        }),
      )
      setMonthAvailability(availabilityWithCounts)
    }
    setIsLoadingMonth(false)
  }

  const loadSlots = async (date: Date) => {
    setIsLoadingSlots(true)
    const dateStr = date.toISOString().split("T")[0]
    const result = await getAvailableSlots(dateStr)
    if (result.success && result.data) {
      const slots: BookingSlot[] = result.data.map((time: string) => ({
        date: dateStr,
        time,
        available: true,
      }))
      setAvailableSlots(slots)
    }
    setIsLoadingSlots(false)
  }

  const handleServiceSelect = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId)
    if (service) {
      setSelectedService(service)
      setFormData({ ...formData, service: service.id })
    }
  }

  const handleDayClick = (date: Date) => {
    if (isPastDate(date)) return
    const dateStr = date.toISOString().split("T")[0]
    const dayAvail = monthAvailability.find((a) => a.date === dateStr)
    if (!dayAvail?.available) return

    setSelectedDay(date)
    setFormData({ ...formData, date: dateStr, time: "" })
    setStep("time")
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

  const getDayAvailability = (date: Date): DayAvailability | undefined => {
    const dateStr = date.toISOString().split("T")[0]
    return monthAvailability.find((a) => a.date === dateStr)
  }

  const handleAccessCodeValidation = async () => {
    if (!accessCode) {
      setAccessCodeError("Please enter an access code")
      return
    }
    const result = await validateAccessCode(accessCode)
    if (result.success && result.data?.valid) {
      setHasValidCode(true)
      setAccessCodeError("")
    } else {
      setAccessCodeError("Invalid access code")
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const result = await createAppointment({
      clientName: formData.name,
      clientEmail: formData.email,
      clientPhone: formData.phone,
      date: formData.date,
      time: formData.time,
      serviceType: selectedService?.id || "consultation",
      notes: formData.notes,
      paymentMethod,
    })

    if (result.success) {
      setIsSuccess(true)
      setStep("confirm")
    }
    setIsSubmitting(false)
  }

  const handleClose = () => {
    setStep("service")
    setSelectedDay(null)
    setSelectedService(null)
    setFormData({ name: "", email: "", phone: "", service: "", date: "", time: "", notes: "" })
    setIsSuccess(false)
    setAccessCode("")
    setHasValidCode(false)
    setPaymentMethod("credit_card")
    setCardNumber("")
    setCardExpiry("")
    setCardCvc("")
    onOpenChange(false)
  }

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const renderStepIndicator = () => {
    const steps = [
      { key: "service", label: "Service" },
      { key: "calendar", label: "Date" },
      { key: "time", label: "Time" },
      { key: "details", label: "Details" },
      { key: "payment", label: "Payment" },
    ]
    const currentIndex = steps.findIndex((s) => s.key === step)

    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, idx) => (
          <div key={s.key} className="flex items-center">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                idx < currentIndex
                  ? "bg-primary text-primary-foreground"
                  : idx === currentIndex
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {idx < currentIndex ? <CheckCircleIcon className="h-4 w-4" /> : idx + 1}
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-1 ${idx < currentIndex ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>
    )
  }

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
      const dayAvail = getDayAvailability(date)
      const hasSlots = dayAvail?.available || false
      const slotsCount = dayAvail?.slotsCount || 0
      const isSelected = selectedDay?.toDateString() === date.toDateString()

      const dayButton = (
        <button
          type="button"
          onClick={() => handleDayClick(date)}
          disabled={isPast || !hasSlots}
          className={`h-10 w-10 rounded-lg text-sm font-medium transition-all relative ${
            isPast ? "text-muted-foreground/40 cursor-not-allowed" : ""
          } ${!isPast && !hasSlots ? "text-muted-foreground/60 cursor-not-allowed" : ""} ${
            !isPast && hasSlots ? "hover:bg-primary/10 cursor-pointer" : ""
          } ${isSelected ? "bg-primary text-primary-foreground hover:bg-primary" : ""} ${
            !isPast && hasSlots && !isSelected ? "text-foreground" : ""
          }`}
        >
          {day}
          {!isPast && hasSlots && (
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-green-500" />
          )}
        </button>
      )

      days.push(
        <div key={day} className="flex items-center justify-center">
          {!isPast && hasSlots ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>{dayButton}</TooltipTrigger>
                <TooltipContent>
                  <p>
                    {slotsCount} slot{slotsCount !== 1 ? "s" : ""} available
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            dayButton
          )}
        </div>,
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold">
            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h3>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="h-8 flex items-center justify-center font-medium">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{days}</div>
        {isLoadingMonth && <p className="text-center text-sm text-muted-foreground">Loading availability...</p>}
        <p className="text-xs text-muted-foreground text-center mt-2">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1" />
          Hover over green dots to see available slots
        </p>
      </div>
    )
  }

  const renderTimeSlots = () => {
    if (isLoadingSlots) {
      return <p className="text-center py-8 text-muted-foreground">Loading available times...</p>
    }

    if (availableSlots.length === 0) {
      return <p className="text-center py-8 text-muted-foreground">No available slots for this date.</p>
    }

    return (
      <div className="space-y-4">
        <h3 className="font-semibold">
          Available times for{" "}
          {selectedDay?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {availableSlots.map((slot, idx) => (
            <Button
              key={idx}
              variant={formData.time === slot.time ? "default" : "outline"}
              className={`${!slot.available ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={!slot.available}
              onClick={() => handleTimeSelect(slot)}
            >
              <ClockIcon className="mr-2 h-4 w-4" />
              {slot.time}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-6">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold mb-2">Booking Confirmed!</DialogTitle>
            <DialogDescription className="text-muted-foreground mb-6">
              Your appointment has been scheduled for{" "}
              <strong>
                {formData.date} at {formData.time}
              </strong>
              . A confirmation email will be sent to {formData.email}.
            </DialogDescription>
            <Button onClick={handleClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Book a Consultation</DialogTitle>
          <DialogDescription>Schedule a meeting with our expert consultants.</DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 pb-4">
            {/* Step 1: Service Selection */}
            {step === "service" && (
              <div className="space-y-4">
                <Label>Select a Service</Label>
                {isLoadingServices ? (
                  <p className="text-center py-4 text-muted-foreground">Loading services...</p>
                ) : (
                  <Select value={formData.service} onValueChange={handleServiceSelect}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a consultation service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{service.name}</span>
                            <span className="text-muted-foreground ml-2">${service.price}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {selectedService && (
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{selectedService.name}</h4>
                      <Badge variant="secondary">${selectedService.price}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                    <p className="text-sm">
                      <ClockIcon className="inline h-3 w-3 mr-1" />
                      {selectedService.duration}
                    </p>
                  </div>
                )}

                <Button onClick={() => setStep("calendar")} className="w-full" disabled={!selectedService}>
                  Continue to Select Date
                </Button>
              </div>
            )}

            {/* Step 2: Calendar Selection */}
            {step === "calendar" && (
              <div className="space-y-4">
                <Button variant="ghost" onClick={() => setStep("service")} className="mb-2">
                  <ChevronLeftIcon className="mr-2 h-4 w-4" /> Back to Services
                </Button>

                {selectedService && (
                  <div className="p-3 rounded-lg bg-muted/50 flex justify-between items-center">
                    <span className="font-medium">{selectedService.name}</span>
                    <Badge variant="secondary">${selectedService.price}</Badge>
                  </div>
                )}

                {renderCalendar()}
              </div>
            )}

            {/* Step 3: Time Selection */}
            {step === "time" && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStep("calendar")
                    setSelectedDay(null)
                  }}
                  className="mb-2"
                >
                  <ChevronLeftIcon className="mr-2 h-4 w-4" /> Back to Calendar
                </Button>

                {selectedService && (
                  <div className="p-3 rounded-lg bg-muted/50 flex justify-between items-center">
                    <span className="font-medium">{selectedService.name}</span>
                    <Badge variant="secondary">${selectedService.price}</Badge>
                  </div>
                )}

                {renderTimeSlots()}

                {formData.time && (
                  <Button onClick={() => setStep("details")} className="w-full">
                    Continue to Details
                  </Button>
                )}
              </div>
            )}

            {/* Step 4: Details Form */}
            {step === "details" && (
              <div className="space-y-4">
                <Button variant="ghost" onClick={() => setStep("time")}>
                  <ChevronLeftIcon className="mr-2 h-4 w-4" /> Back to Time Selection
                </Button>

                <div className="p-4 rounded-lg bg-muted/50 mb-4">
                  <div className="flex items-center gap-4">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{selectedService?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formData.date} at {formData.time}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-auto">
                      ${selectedService?.price}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        className="pl-10"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 234 567 8901"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any specific topics you'd like to discuss..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessCode">Access Code (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accessCode"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="Enter access code for discount"
                      disabled={hasValidCode}
                    />
                    {!hasValidCode ? (
                      <Button variant="outline" onClick={handleAccessCodeValidation}>
                        Apply
                      </Button>
                    ) : (
                      <Badge className="bg-green-100 text-green-700 h-10 px-3 flex items-center">Valid</Badge>
                    )}
                  </div>
                  {accessCodeError && <p className="text-sm text-red-500">{accessCodeError}</p>}
                </div>

                <Button
                  onClick={() => setStep("payment")}
                  className="w-full"
                  disabled={!formData.name || !formData.email || !formData.phone}
                >
                  Continue to Payment
                </Button>
              </div>
            )}

            {/* Step 5: Payment */}
            {step === "payment" && (
              <div className="space-y-4">
                <Button variant="ghost" onClick={() => setStep("details")}>
                  <ChevronLeftIcon className="mr-2 h-4 w-4" /> Back to Details
                </Button>

                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-3">Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service</span>
                      <span>{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date & Time</span>
                      <span>
                        {formData.date} at {formData.time}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span>{selectedService?.duration}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t">
                      <span>Total</span>
                      <span>${selectedService?.price}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          paymentMethod === method.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <method.icon className="h-5 w-5 mb-2 text-primary" />
                        <p className="font-medium text-sm">{method.name}</p>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === "credit_card" && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardExpiry">Expiry Date</Label>
                        <Input
                          id="cardExpiry"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardCvc">CVC</Label>
                        <Input
                          id="cardCvc"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "bank_transfer" && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-semibold mb-2">Bank Transfer Details</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Bank:</span> First National Bank
                      </p>
                      <p>
                        <span className="text-muted-foreground">Account:</span> SAMOP Consulting LLC
                      </p>
                      <p>
                        <span className="text-muted-foreground">Account #:</span> 1234567890
                      </p>
                      <p>
                        <span className="text-muted-foreground">Routing #:</span> 021000021
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Please include your email as payment reference. Your booking will be confirmed upon payment
                      verification.
                    </p>
                  </div>
                )}

                {paymentMethod === "mobile_money" && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-semibold mb-2">Mobile Money Payment</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Send payment to the following number and include your email as reference:
                    </p>
                    <p className="font-mono text-lg">+1 234 567 8901</p>
                  </div>
                )}

                <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : `Pay $${selectedService?.price} & Confirm Booking`}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
