"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  getAppointmentFees,
  getMonthAvailability,
  getAvailableSlots,
  validateAccessCode,
  createAppointment,
} from "@/lib/api"
import type { AppointmentFee, BookingSlot } from "@/lib/types"

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedService?: string
}

type Step = "calendar" | "time" | "details" | "payment" | "confirm"
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

  const [step, setStep] = useState<Step>("calendar")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [fees, setFees] = useState<AppointmentFee[]>([])
  const [monthAvailability, setMonthAvailability] = useState<{ date: string; available: boolean }[]>([])
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([])
  const [isLoadingMonth, setIsLoadingMonth] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [selectedFee, setSelectedFee] = useState<AppointmentFee | null>(null)
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
      loadFees()
      loadMonthAvailability()
    }
  }, [open, currentMonth])

  useEffect(() => {
    if (selectedDay) {
      loadSlots(selectedDay)
    }
  }, [selectedDay])

  const loadFees = async () => {
    const result = await getAppointmentFees()
    if (result.success && result.data) {
      setFees(result.data)
      if (!selectedFee && result.data.length > 0) {
        setSelectedFee(result.data[0])
        setFormData((prev) => ({ ...prev, service: result.data[0].serviceType }))
      }
    }
  }

  const loadMonthAvailability = async () => {
    setIsLoadingMonth(true)
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const result = await getMonthAvailability(year, month)
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
      const slots: BookingSlot[] = result.data.map((time: string) => ({
        date: dateStr,
        time,
        available: true,
      }))
      setAvailableSlots(slots)
    }
    setIsLoadingSlots(false)
  }

  const handleDayClick = (date: Date) => {
    if (isPastDate(date)) return
    const dateStr = date.toISOString().split("T")[0]
    const dayAvail = monthAvailability.find((a) => a.date === dateStr)
    if (!dayAvail?.available) return

    setSelectedDay(date)
    setFormData({ ...formData, date: dateStr, time: "" })
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

  const hasAvailability = (date: Date): boolean => {
    const dateStr = date.toISOString().split("T")[0]
    const dayAvail = monthAvailability.find((a) => a.date === dateStr)
    return dayAvail?.available || false
  }

  const canProceedToDetails = formData.date && formData.time

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
      serviceType: selectedFee?.serviceType || "consultation",
      notes: formData.notes,
      paymentMethod,
    })

    if (result.success) {
      setIsSuccess(true)
    }
    setIsSubmitting(false)
  }

  const handleClose = () => {
    setStep("calendar")
    setSelectedDay(null)
    setFormData({ name: "", email: "", phone: "", service: "", date: "", time: "", notes: "" })
    setIsSuccess(false)
    setAccessCode("")
    setHasValidCode(false)
    setPaymentMethod("credit_card")
    onOpenChange(false)
  }

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
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
      const isSelected = selectedDay?.toDateString() === date.toDateString()

      days.push(
        <div key={day} className="relative">
          <button
            type="button"
            onClick={() => handleDayClick(date)}
            disabled={isPast || !hasSlots}
            className={`h-10 w-10 rounded-lg text-sm font-medium transition-all ${
              isPast ? "text-muted-foreground/40 cursor-not-allowed" : ""
            } ${!isPast && !hasSlots ? "text-muted-foreground/60 cursor-not-allowed" : ""} ${
              !isPast && hasSlots ? "hover:bg-primary/10 cursor-pointer" : ""
            } ${isSelected ? "bg-primary text-primary-foreground hover:bg-primary" : ""} ${
              !isPast && hasSlots && !isSelected ? "text-foreground" : ""
            }`}
          >
            {day}
          </button>
          {!isPast && hasSlots && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-green-500"></div>
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
          <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1"></span>
          Green dots indicate available dates
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
        <Button variant="ghost" onClick={() => setSelectedDay(null)} className="mt-4">
          <ChevronLeftIcon className="mr-2 h-4 w-4" /> Back to Calendar
        </Button>
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

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {/* Service Selection */}
            <div className="space-y-3">
              <Label>Select Service</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fees.map((fee) => (
                  <Card
                    key={fee.id}
                    className={`cursor-pointer transition-all border-2 ${
                      selectedFee?.id === fee.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => {
                      setSelectedFee(fee)
                      setFormData({ ...formData, service: fee.serviceType })
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium capitalize truncate">{fee.serviceType.replace(/_/g, " ")}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{fee.description}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          ${fee.amount}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Calendar or Time Selection */}
            {step === "calendar" && (
              <div className="space-y-4">
                <Label>Select Date & Time</Label>
                {!selectedDay ? renderCalendar() : renderTimeSlots()}
              </div>
            )}

            {/* Proceed to Details */}
            {canProceedToDetails && step === "calendar" && (
              <Button onClick={() => setStep("details")} className="w-full">
                Continue to Details
              </Button>
            )}

            {/* Details Form */}
            {step === "details" && (
              <div className="space-y-4">
                <Button variant="ghost" onClick={() => setStep("calendar")}>
                  <ChevronLeftIcon className="mr-2 h-4 w-4" /> Back to Calendar
                </Button>

                <div className="p-4 rounded-lg bg-muted/50 mb-4">
                  <div className="flex items-center gap-4">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{formData.date}</p>
                      <p className="text-sm text-muted-foreground">at {formData.time}</p>
                    </div>
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

            {/* Payment Step */}
            {step === "payment" && (
              <div className="space-y-4">
                <Button variant="ghost" onClick={() => setStep("details")}>
                  <ChevronLeftIcon className="mr-2 h-4 w-4" /> Back to Details
                </Button>

                {/* Summary */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-3">Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service</span>
                      <span className="capitalize">{selectedFee?.serviceType.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date & Time</span>
                      <span>
                        {formData.date} at {formData.time}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-base pt-2 border-t">
                      <span>Total</span>
                      <span>${selectedFee?.amount || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <Label>Payment Method</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                    className="grid grid-cols-2 gap-3"
                  >
                    {paymentMethods.map((method) => (
                      <div key={method.id}>
                        <RadioGroupItem value={method.id} id={method.id} className="peer sr-only" />
                        <Label
                          htmlFor={method.id}
                          className="flex items-center gap-3 rounded-lg border-2 border-border p-4 cursor-pointer hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                        >
                          <method.icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{method.name}</p>
                            <p className="text-xs text-muted-foreground">{method.description}</p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Credit Card Form */}
                {paymentMethod === "credit_card" && (
                  <div className="space-y-4 p-4 rounded-lg border">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input
                          id="cvc"
                          placeholder="123"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bank Transfer Info */}
                {paymentMethod === "bank_transfer" && (
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <h4 className="font-medium mb-2">Bank Transfer Details</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Please transfer the payment to the following account:
                    </p>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Bank:</span> First National Bank
                      </p>
                      <p>
                        <span className="text-muted-foreground">Account:</span> 1234567890
                      </p>
                      <p>
                        <span className="text-muted-foreground">Reference:</span> SAMOP-{Date.now()}
                      </p>
                    </div>
                  </div>
                )}

                {/* PayPal Info */}
                {paymentMethod === "paypal" && (
                  <div className="p-4 rounded-lg border bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground">
                      You will be redirected to PayPal to complete the payment after confirming.
                    </p>
                  </div>
                )}

                {/* Mobile Money Info */}
                {paymentMethod === "mobile_money" && (
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <h4 className="font-medium mb-2">Mobile Money Payment</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      You will receive a payment prompt on your phone after confirming.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="mobileNumber">Mobile Money Number</Label>
                      <Input id="mobileNumber" placeholder="+254 700 000 000" />
                    </div>
                  </div>
                )}

                <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : `Pay $${selectedFee?.amount || 0} & Confirm Booking`}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
