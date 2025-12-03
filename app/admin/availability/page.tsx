"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2, Clock, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { getAvailability, setAvailability, getWeeklyAvailability } from "@/lib/api"
import type { AvailabilitySchedule, TimeSlot } from "@/lib/types"

const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const

export default function AvailabilityPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [availability, setAvailabilityState] = useState<AvailabilitySchedule[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [slots, setSlots] = useState<TimeSlot[]>([{ start: "09:00", end: "12:00" }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [weeklySchedule, setWeeklySchedule] = useState<Record<string, TimeSlot[]>>({})
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  useEffect(() => {
    loadAvailability()
    loadWeeklySchedule()
  }, [])

  const loadAvailability = async () => {
    const result = await getAvailability()
    if (result.success && result.data) {
      setAvailabilityState(result.data)
    }
  }

  const loadWeeklySchedule = async () => {
    const result = await getWeeklyAvailability()
    if (result.success && result.data) {
      setWeeklySchedule(result.data)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    // Prevent selecting past dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return

    setSelectedDate(date)

    // Check if there's existing availability for this date
    const dateStr = date.toISOString().split("T")[0]
    const existing = availability.find((a) => a.date === dateStr)

    if (existing) {
      setSlots(existing.slots)
    } else {
      // Use default from weekly schedule
      const dayName = daysOfWeek[date.getDay()]
      const defaultSlots = weeklySchedule[dayName] || []
      setSlots(defaultSlots.length > 0 ? [...defaultSlots] : [{ start: "09:00", end: "12:00" }])
    }

    setIsDialogOpen(true)
  }

  const addSlot = () => {
    setSlots([...slots, { start: "14:00", end: "17:00" }])
  }

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index))
  }

  const updateSlot = (index: number, field: "start" | "end", value: string) => {
    const newSlots = [...slots]
    newSlots[index] = { ...newSlots[index], [field]: value }
    setSlots(newSlots)
  }

  const handleSaveAvailability = async () => {
    if (!selectedDate || slots.length === 0) return

    setIsSubmitting(true)
    const dateStr = selectedDate.toISOString().split("T")[0]
    const result = await setAvailability({ date: dateStr, slots })

    if (result.success) {
      setIsSuccess(true)
      await loadAvailability()
      setTimeout(() => {
        setIsDialogOpen(false)
        setIsSuccess(false)
      }, 1500)
    }
    setIsSubmitting(false)
  }

  const hasAvailability = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return availability.some((a) => a.date === dateStr)
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Availability Management</h1>
        <p className="text-muted-foreground">Set your available time slots for client appointments.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Select Date</CardTitle>
            <CardDescription>Click on a date to set or edit availability. Past dates are disabled.</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              className="rounded-md border"
              disabled={(date) => isPastDate(date)}
              modifiers={{
                available: (date) => hasAvailability(date) && !isPastDate(date),
              }}
              modifiersStyles={{
                available: {
                  backgroundColor: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                  borderRadius: "var(--radius)",
                },
              }}
              components={{
                IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                IconRight: () => <ChevronRight className="h-4 w-4" />,
              }}
            />
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-primary" />
                <span className="text-muted-foreground">Has availability</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-muted" />
                <span className="text-muted-foreground">No availability set</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Default Schedule */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Weekly Default Schedule</CardTitle>
            <CardDescription>Your default availability for each day of the week.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {daysOfWeek.map((day) => (
                <div key={day} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="capitalize font-medium">{day}</span>
                  <div className="flex items-center gap-2">
                    {weeklySchedule[day]?.length > 0 ? (
                      weeklySchedule[day].map((slot, i) => (
                        <Badge key={i} variant="secondary">
                          <Clock className="mr-1 h-3 w-3" />
                          {slot.start} - {slot.end}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">Not available</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Availability */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Upcoming Availability</CardTitle>
          <CardDescription>Your scheduled availability for the coming days.</CardDescription>
        </CardHeader>
        <CardContent>
          {availability.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No availability set yet. Click on a date in the calendar to add availability.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availability
                .filter((a) => !isPastDate(new Date(a.date)))
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(0, 6)
                .map((avl) => (
                  <div key={avl.id} className="p-4 rounded-lg border border-border">
                    <p className="font-semibold text-card-foreground">
                      {new Date(avl.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <div className="mt-2 space-y-1">
                      {avl.slots.map((slot, i) => (
                        <Badge key={i} variant="outline" className="mr-1">
                          {slot.start} - {slot.end}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Set Availability Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">Availability Saved!</h3>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-card-foreground">
                  Set Availability for{" "}
                  {selectedDate?.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </DialogTitle>
                <DialogDescription>Add your available time slots for this date.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {slots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Start Time</Label>
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(e) => updateSlot(index, "start", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">End Time</Label>
                        <Input
                          type="time"
                          value={slot.end}
                          onChange={(e) => updateSlot(index, "end", e.target.value)}
                        />
                      </div>
                    </div>
                    {slots.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive mt-5"
                        onClick={() => removeSlot(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <Button variant="outline" onClick={addSlot} className="w-full bg-transparent">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Time Slot
                </Button>

                <Button
                  onClick={handleSaveAvailability}
                  className="w-full bg-primary text-primary-foreground"
                  disabled={slots.length === 0 || isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Availability"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
