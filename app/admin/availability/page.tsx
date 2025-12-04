"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PlusIcon, TrashIcon, ClockIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/icons"
import { getAvailability, setAvailability, getWeeklyAvailability, deleteAvailability } from "@/lib/api"
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
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleDateSelect = (date: Date) => {
    // Prevent selecting past dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return

    setSelectedDate(date)

    // Check if there's existing availability for this date
    const dateStr = date.toISOString().split("T")[0]
    const existing = availability.find((a) => a.date === dateStr)

    if (existing) {
      setSlots([...existing.slots])
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

    if (result.success && result.data) {
      // Immediately update local state
      setAvailabilityState((prev) => {
        const existingIndex = prev.findIndex((a) => a.date === dateStr)
        if (existingIndex !== -1) {
          const updated = [...prev]
          updated[existingIndex] = result.data!
          return updated
        }
        return [...prev, result.data!]
      })

      setIsSuccess(true)
      setTimeout(() => {
        setIsDialogOpen(false)
        setIsSuccess(false)
      }, 1500)
    }
    setIsSubmitting(false)
  }

  const handleDeleteAvailability = async () => {
    if (!selectedDate) return

    const dateStr = selectedDate.toISOString().split("T")[0]
    const existing = availability.find((a) => a.date === dateStr)
    if (!existing) return

    setIsDeleting(true)
    const result = await deleteAvailability(existing.id)

    if (result.success) {
      // Immediately update local state
      setAvailabilityState((prev) => prev.filter((a) => a.id !== existing.id))
      setIsDialogOpen(false)
    }
    setIsDeleting(false)
  }

  const getAvailabilityForDate = (date: Date | null | undefined): AvailabilitySchedule | undefined => {
    if (!date) return undefined
    const dateStr = date.toISOString().split("T")[0]
    return availability.find((a) => a.date === dateStr)
  }

  const hasAvailability = (date: Date | null | undefined) => {
    if (!date) return false
    return !!getAvailabilityForDate(date)
  }

  const getSlotCount = (date: Date | null | undefined): number => {
    if (!date) return 0
    const avl = getAvailabilityForDate(date)
    if (!avl) return 0
    // Calculate total 30-minute slots
    let total = 0
    for (const slot of avl.slots) {
      const [startH, startM] = slot.start.split(":").map(Number)
      const [endH, endM] = slot.end.split(":").map(Number)
      const startMins = startH * 60 + startM
      const endMins = endH * 60 + endM
      total += Math.floor((endMins - startMins) / 30)
    }
    return total
  }

  const isPastDate = (date: Date | null | undefined) => {
    if (!date) return true
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isToday = (date: Date | null | undefined) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    const days: (Date | null)[] = []

    // Add padding for days before the first of month
    for (let i = 0; i < startPadding; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d))
    }

    return days
  }

  const goToPreviousMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))
  }

  const calendarDays = generateCalendarDays()
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <TooltipProvider>
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
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <h3 className="font-semibold text-lg">
                  {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h3>
                <Button variant="outline" size="icon" onClick={goToNextMonth}>
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="h-10" />
                  }

                  const past = isPastDate(date)
                  const hasAvail = hasAvailability(date)
                  const slotCount = getSlotCount(date)
                  const today = isToday(date)
                  const isSelected = selectedDate?.toDateString() === date.toDateString()

                  return (
                    <Tooltip key={date.toISOString()}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => !past && handleDateSelect(date)}
                          disabled={past}
                          className={`
                            h-10 w-full rounded-md text-sm font-medium transition-colors relative
                            ${past ? "text-muted-foreground/50 cursor-not-allowed" : "hover:bg-accent cursor-pointer"}
                            ${today ? "ring-2 ring-primary ring-offset-1" : ""}
                            ${isSelected ? "bg-primary text-primary-foreground" : ""}
                            ${hasAvail && !isSelected ? "bg-green-500 text-white hover:bg-green-600" : ""}
                            ${!hasAvail && !past && !isSelected ? "bg-muted hover:bg-accent" : ""}
                          `}
                        >
                          {date.getDate()}
                          {hasAvail && !isSelected && (
                            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {past ? (
                          <p>Past date</p>
                        ) : hasAvail ? (
                          <p>{slotCount} slots available</p>
                        ) : (
                          <p>No availability set - Click to add</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm border-t pt-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-green-500" />
                  <span className="text-muted-foreground">Has availability</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-muted" />
                  <span className="text-muted-foreground">No availability</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded ring-2 ring-primary ring-offset-1" />
                  <span className="text-muted-foreground">Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-primary" />
                  <span className="text-muted-foreground">Selected</span>
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
                  <div
                    key={day}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <span className="capitalize font-medium">{day}</span>
                    <div className="flex items-center gap-2">
                      {weeklySchedule[day]?.length > 0 ? (
                        weeklySchedule[day].map((slot, i) => (
                          <Badge key={i} variant="secondary">
                            <ClockIcon className="mr-1 h-3 w-3" />
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
            {availability.filter((a) => !isPastDate(new Date(a.date))).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No availability set yet. Click on a date in the calendar to add availability.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availability
                  .filter((a) => !isPastDate(new Date(a.date)))
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .slice(0, 6)
                  .map((avl) => {
                    // Calculate slot count for this availability
                    let slotCount = 0
                    for (const slot of avl.slots) {
                      const [startH, startM] = slot.start.split(":").map(Number)
                      const [endH, endM] = slot.end.split(":").map(Number)
                      const startMins = startH * 60 + startM
                      const endMins = endH * 60 + endM
                      slotCount += Math.floor((endMins - startMins) / 30)
                    }

                    return (
                      <div
                        key={avl.id}
                        className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <p className="font-semibold text-card-foreground">
                            {new Date(avl.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {slotCount} slots
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-1">
                          {avl.slots.map((slot, i) => (
                            <Badge key={i} variant="secondary" className="mr-1">
                              {slot.start} - {slot.end}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                  })}
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
                  <CheckIcon className="h-8 w-8 text-green-600" />
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
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button variant="outline" onClick={addSlot} className="w-full bg-transparent">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Time Slot
                  </Button>

                  <div className="flex gap-2">
                    {getAvailabilityForDate(selectedDate!) && (
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAvailability}
                        disabled={isDeleting}
                        className="flex-1"
                      >
                        {isDeleting ? "Deleting..." : "Delete Availability"}
                      </Button>
                    )}
                    <Button
                      onClick={handleSaveAvailability}
                      className="flex-1 bg-primary text-primary-foreground"
                      disabled={slots.length === 0 || isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Availability"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
