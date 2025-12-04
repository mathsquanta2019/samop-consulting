"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  BuildingIcon,
  SmartphoneIcon,
  UploadIcon,
  CopyIcon,
} from "@/components/icons"
import {
  getConsultationServices,
  getMonthAvailability,
  getAvailableSlots,
  createAppointment,
  submitPaymentVerification,
  getBankDetails,
} from "@/lib/api"
import type { BookingSlot, PaymentRegion } from "@/lib/types"

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ConsultationService {
  id: string
  name: string
  description: string
  price: number
  duration: string
}

type Step = "service" | "calendar" | "time" | "details" | "payment" | "confirm"
type PaymentMethod = "credit_card" | "bank_transfer" | "mobile_money"

export function BookingModal({ open, onOpenChange }: BookingModalProps) {
  const [step, setStep] = useState<Step>("service")
  const [services, setServices] = useState<ConsultationService[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState("")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableDates, setAvailableDates] = useState<Map<string, number>>(new Map())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [timeSlots, setTimeSlots] = useState<BookingSlot[]>([])
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [appointmentId, setAppointmentId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
    date: "",
    time: "",
  })

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card")
  const [paymentRegion, setPaymentRegion] = useState<PaymentRegion>("us")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedService = services.find((s) => s.id === selectedServiceId)

  useEffect(() => {
    if (open) {
      loadServices()
    }
  }, [open])

  useEffect(() => {
    if (open && selectedServiceId) {
      loadAvailability()
    }
  }, [open, currentMonth, selectedServiceId])

  useEffect(() => {
    if (selectedDate) {
      loadSlots()
    }
  }, [selectedDate])

  const loadServices = async () => {
    const result = await getConsultationServices()
    if (result.success && result.data) {
      setServices(result.data)
    }
  }

  const loadAvailability = async () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth() + 1
    const result = await getMonthAvailability(year, month)
    if (result.success && result.data) {
      const dateMap = new Map<string, number>()
      result.data.forEach((item) => {
        if (item.available) {
          dateMap.set(item.date, item.slotsAvailable || 1)
        }
      })
      setAvailableDates(dateMap)
    }
  }

  const loadSlots = async () => {
    if (!selectedDate) return
    const result = await getAvailableSlots(selectedDate)
    if (result.success && result.data) {
      const slots: BookingSlot[] = result.data.map((time) => ({
        date: selectedDate,
        time,
        available: true,
      }))
      setTimeSlots(slots)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setStep("service")
      setSelectedServiceId("")
      setSelectedDate(null)
      setSelectedTime(null)
      setFormData({ name: "", email: "", phone: "", notes: "", date: "", time: "" })
      setPaymentMethod("credit_card")
      setPaymentRegion("us")
      setCardNumber("")
      setCardExpiry("")
      setCardCvc("")
      setTransactionId("")
      setReceiptFile(null)
      setBookingComplete(false)
      setAppointmentId(null)
    }, 300)
  }

  const handleSubmit = async () => {
    if (!selectedService || !formData.date || !formData.time) return

    setIsSubmitting(true)

    const appointmentResult = await createAppointment({
      clientName: formData.name,
      clientEmail: formData.email,
      clientPhone: formData.phone,
      serviceType: selectedService.name,
      date: formData.date,
      time: formData.time,
      notes: formData.notes,
      paymentMethod,
      paymentStatus: paymentMethod === "credit_card" ? "paid" : "pending_verification",
      amount: selectedService.price,
    })

    if (!appointmentResult.success || !appointmentResult.data) {
      setIsSubmitting(false)
      return
    }

    const newAppointmentId = appointmentResult.data.id
    setAppointmentId(newAppointmentId)

    if (paymentMethod === "bank_transfer" || paymentMethod === "mobile_money") {
      await submitPaymentVerification({
        appointmentId: newAppointmentId,
        clientEmail: formData.email,
        clientName: formData.name,
        paymentMethod,
        region: paymentRegion,
        amount: selectedService.price,
        currency: paymentRegion === "africa" ? "NGN" : "USD",
        transactionId: transactionId || undefined,
        receiptFile: receiptFile || undefined,
      })
    }

    setIsSubmitting(false)
    setBookingComplete(true)
    setStep("confirm")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReceiptFile(file)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    return { daysInMonth, startingDay }
  }

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth)

  const renderCalendar = () => {
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const isPast = dateObj < today
      const slotsCount = availableDates.get(dateKey) || 0
      const isAvailable = slotsCount > 0 && !isPast
      const isSelected = selectedDate === dateKey

      days.push(
        <TooltipProvider key={day}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                disabled={!isAvailable}
                onClick={() => {
                  setSelectedDate(dateKey)
                  setFormData((prev) => ({ ...prev, date: dateKey }))
                }}
                className={`h-10 w-10 rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : isAvailable
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "text-muted-foreground opacity-50 cursor-not-allowed"
                }`}
              >
                {day}
              </button>
            </TooltipTrigger>
            {isAvailable && (
              <TooltipContent>
                <p>
                  {slotsCount} slot{slotsCount > 1 ? "s" : ""} available
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>,
      )
    }
    return days
  }

  const canProceedToCalendar = !!selectedServiceId
  const canProceedToTime = !!selectedDate
  const canProceedToDetails = !!selectedTime
  const canProceedToPayment = formData.name && formData.email && formData.phone

  const bankDetails = getBankDetails(paymentRegion)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle className="text-xl font-bold">Book a Consultation</DialogTitle>
          <p className="text-sm text-muted-foreground">Schedule a meeting with our expert consultants.</p>
        </DialogHeader>

        {/* Step indicator */}
        <div className="px-6 py-3 border-b shrink-0">
          <div className="flex items-center justify-center gap-2">
            {["Service", "Date", "Time", "Details", "Payment"].map((label, index) => {
              const steps: Step[] = ["service", "calendar", "time", "details", "payment"]
              const currentIndex = steps.indexOf(step)
              const isComplete = index < currentIndex || step === "confirm"
              const isCurrent = index === currentIndex

              return (
                <div key={label} className="flex items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 ${
                      isComplete
                        ? "bg-primary border-primary text-primary-foreground"
                        : isCurrent
                          ? "border-primary text-primary"
                          : "border-muted-foreground/30 text-muted-foreground"
                    }`}
                  >
                    {isComplete ? <CheckCircleIcon className="h-4 w-4" /> : index + 1}
                  </div>
                  {index < 4 && (
                    <div className={`w-6 h-0.5 mx-1 ${index < currentIndex ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* Step 1: Service Selection */}
          {step === "service" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select a Service</Label>
                <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose consultation type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{service.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ${service.price} - {service.duration}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedService && (
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <h4 className="font-semibold">{selectedService.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                  <div className="flex gap-4 text-sm">
                    <span>
                      <strong>Price:</strong> ${selectedService.price}
                    </span>
                    <span>
                      <strong>Duration:</strong> {selectedService.duration}
                    </span>
                  </div>
                </div>
              )}

              <Button onClick={() => setStep("calendar")} disabled={!canProceedToCalendar} className="w-full">
                Continue to Select Date
              </Button>
            </div>
          )}

          {/* Step 2: Calendar */}
          {step === "calendar" && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={() => setStep("service")}>
                <ChevronLeftIcon className="mr-2 h-4 w-4" /> Back
              </Button>

              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <h3 className="font-semibold">
                  {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h3>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 place-items-center">{renderCalendar()}</div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span>Selected</span>
                </div>
              </div>

              <Button onClick={() => setStep("time")} disabled={!canProceedToTime} className="w-full">
                Continue to Select Time
              </Button>
            </div>
          )}

          {/* Step 3: Time Selection */}
          {step === "time" && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={() => setStep("calendar")}>
                <ChevronLeftIcon className="mr-2 h-4 w-4" /> Back
              </Button>

              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-primary" />
                <span>
                  Selected: <strong>{selectedDate}</strong>
                </span>
              </div>

              <div className="space-y-2">
                <Label>Available Time Slots</Label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedTime(slot.time)
                        setFormData((prev) => ({ ...prev, time: slot.time }))
                      }}
                      className="text-sm"
                    >
                      <ClockIcon className="mr-1 h-3 w-3" />
                      {slot.time}
                    </Button>
                  ))}
                </div>
                {timeSlots.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No time slots available for this date.
                  </p>
                )}
              </div>

              <Button onClick={() => setStep("details")} disabled={!canProceedToDetails} className="w-full">
                Continue to Your Details
              </Button>
            </div>
          )}

          {/* Step 4: Details */}
          {step === "details" && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={() => setStep("time")}>
                <ChevronLeftIcon className="mr-2 h-4 w-4" /> Back
              </Button>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any specific questions or topics you'd like to discuss..."
                    rows={3}
                  />
                </div>
              </div>

              <Button onClick={() => setStep("payment")} disabled={!canProceedToPayment} className="w-full">
                Continue to Payment
              </Button>
            </div>
          )}

          {/* Step 5: Payment */}
          {step === "payment" && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={() => setStep("details")}>
                <ChevronLeftIcon className="mr-2 h-4 w-4" /> Back
              </Button>

              {/* Booking Summary */}
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">Booking Summary</h4>
                <div className="space-y-1 text-sm">
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
                  <div className="flex justify-between font-semibold pt-2 border-t mt-2">
                    <span>Total</span>
                    <span>${selectedService?.price}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">
                      <div className="flex items-center gap-2">
                        <CreditCardIcon className="h-4 w-4" />
                        <span>Credit/Debit Card</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="bank_transfer">
                      <div className="flex items-center gap-2">
                        <BuildingIcon className="h-4 w-4" />
                        <span>Bank Transfer</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="mobile_money">
                      <div className="flex items-center gap-2">
                        <SmartphoneIcon className="h-4 w-4" />
                        <span>Mobile Money (M-Pesa, MTN, Airtel)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Region Selection for Bank Transfer / Mobile Money */}
              {(paymentMethod === "bank_transfer" || paymentMethod === "mobile_money") && (
                <div className="space-y-2">
                  <Label>Your Region</Label>
                  <Select value={paymentRegion} onValueChange={(v) => setPaymentRegion(v as PaymentRegion)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="africa">Africa</SelectItem>
                      <SelectItem value="international">International</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Credit Card Form */}
              {paymentMethod === "credit_card" && (
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCardIcon className="h-5 w-5 text-primary" />
                    <span className="font-medium">Card Details</span>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="cardExpiry">Expiry</Label>
                      <Input
                        id="cardExpiry"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="space-y-1">
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

              {/* Bank Transfer Form */}
              {paymentMethod === "bank_transfer" && (
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <BuildingIcon className="h-5 w-5 text-primary" />
                    <span className="font-medium">Bank Transfer Details</span>
                  </div>

                  <div className="space-y-2 text-sm bg-muted/50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Bank:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{bankDetails.bankName}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(bankDetails.bankName)}
                        >
                          <CopyIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Account:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{bankDetails.accountName}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(bankDetails.accountName)}
                        >
                          <CopyIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Account #:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium font-mono">{bankDetails.accountNumber}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(bankDetails.accountNumber)}
                        >
                          <CopyIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {bankDetails.routingNumber && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Routing #:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium font-mono">{bankDetails.routingNumber}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(bankDetails.routingNumber)}
                          >
                            <CopyIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {bankDetails.swiftCode && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">SWIFT:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium font-mono">{bankDetails.swiftCode}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(bankDetails.swiftCode)}
                          >
                            <CopyIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">{bankDetails.instructions}</p>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="transactionId">Transaction ID / Reference</Label>
                    <Input
                      id="transactionId"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter your transaction reference"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Upload Payment Receipt (Optional)</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadIcon className="mr-2 h-4 w-4" />
                      {receiptFile ? receiptFile.name : "Choose File"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Mobile Money Form */}
              {paymentMethod === "mobile_money" && (
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <SmartphoneIcon className="h-5 w-5 text-primary" />
                    <span className="font-medium">Mobile Money</span>
                  </div>

                  {bankDetails.mobileMoney && (
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-green-50 rounded border border-green-200">
                        <p className="font-medium text-green-700">M-Pesa (Kenya)</p>
                        <p className="font-mono">{bankDetails.mobileMoney.mpesa.number}</p>
                        <p className="text-xs text-muted-foreground">{bankDetails.mobileMoney.mpesa.name}</p>
                      </div>
                      <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                        <p className="font-medium text-yellow-700">MTN Mobile Money</p>
                        <p className="font-mono">{bankDetails.mobileMoney.mtn.number}</p>
                        <p className="text-xs text-muted-foreground">{bankDetails.mobileMoney.mtn.name}</p>
                      </div>
                      <div className="p-2 bg-red-50 rounded border border-red-200">
                        <p className="font-medium text-red-700">Airtel Money</p>
                        <p className="font-mono">{bankDetails.mobileMoney.airtel.number}</p>
                        <p className="text-xs text-muted-foreground">{bankDetails.mobileMoney.airtel.name}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label htmlFor="mobileTransactionId">Transaction ID</Label>
                    <Input
                      id="mobileTransactionId"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter transaction ID"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Upload Screenshot (Optional)</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadIcon className="mr-2 h-4 w-4" />
                      {receiptFile ? receiptFile.name : "Choose File"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? "Processing..."
                  : paymentMethod === "credit_card"
                    ? `Pay $${selectedService?.price} & Confirm`
                    : "Submit Booking"}
              </Button>
            </div>
          )}

          {/* Confirmation Step */}
          {step === "confirm" && bookingComplete && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold">
                {paymentMethod === "credit_card" ? "Booking Confirmed!" : "Booking Submitted!"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {paymentMethod === "credit_card"
                  ? "Your consultation has been booked. Check your email for confirmation."
                  : "Your booking is pending payment verification. You'll receive confirmation once verified."}
              </p>
              <div className="p-4 bg-muted/50 rounded-lg text-left text-sm space-y-1">
                <p>
                  <strong>Service:</strong> {selectedService?.name}
                </p>
                <p>
                  <strong>Date:</strong> {formData.date}
                </p>
                <p>
                  <strong>Time:</strong> {formData.time}
                </p>
                <p>
                  <strong>Reference:</strong> {appointmentId}
                </p>
              </div>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
