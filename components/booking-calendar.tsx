"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getAvailableBookingSlots, getAvailability } from "@/lib/api"
import type { BookingSlot, AvailabilitySchedule } from "@/lib/types"
import { cn } from "@/lib/utils"

interface BookingCalendarProps {
  onSelectSlot: (date: string, time: string) => void
  selectedDate?: string
  selectedTime?: string
}

export function BookingCalendar({ onSelectSlot, selectedDate, selectedTime }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [monthAvailability, setMonthAvailability] = useState<AvailabilitySchedule[]>([])
  const [isLoadingMonth, setIsLoadingMonth] = useState(true)

  const today = useMemo(() => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return t
  }, [])

  // Load month availability for tooltips
  useEffect(() => {
    loadMonthAvailability()
  }, [currentMonth])

  // Load slots when a day is selected
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

  const handleDayClick = (date: Date) => {
    if (isPastDate(date)) return
    setSelectedDay(date)
  }

  const handleTimeSelect = (slot: BookingSlot) => {
    if (!slot.available) return
    onSelectSlot(slot.date, slot.time)
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

    // Count total 30-min slots from all time ranges
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

  // Calendar generation
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startingDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const days: (Date | null)[] = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add the days of the month
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

  const days = generateCalendarDays()
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <TooltipProvider>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card className="bg-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-card-foreground">Select Date</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => navigateMonth("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[140px] text-center">
                  {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => navigateMonth("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>Hover over a date to see available slots. Past dates are disabled.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="h-10 flex items-center justify-center text-xs font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="h-10" />
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
                    disabled={isPast}
                    className={cn(
                      "h-10 w-full rounded-lg text-sm font-medium transition-all relative",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      isPast && "text-muted-foreground/40 cursor-not-allowed",
                      !isPast && !isSelected && "hover:bg-accent",
                      !isPast && hasSlots && !isSelected && "bg-primary/10 text-primary font-semibold",
                      isSelected && "bg-primary text-primary-foreground",
                      isToday && !isSelected && "ring-2 ring-primary ring-offset-2",
                    )}
                  >
                    {date.getDate()}
                    {/* Availability indicator dot */}
                    {!isPast && hasSlots && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                )

                // Wrap with tooltip only for dates that have availability
                if (!isPast && hasSlots) {
                  return (
                    <Tooltip key={date.toISOString()}>
                      <TooltipTrigger asChild>{dayButton}</TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{slotsCount} slots available</p>
                        <p className="text-xs text-muted-foreground">
                          {date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )
                }

                return dayButton
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-primary/10 relative">
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                </div>
                <span className="text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-primary" />
                <span className="text-muted-foreground">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded border-2 border-primary" />
                <span className="text-muted-foreground">Today</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Available Times</CardTitle>
            <CardDescription>
              {selectedDay
                ? `Times for ${selectedDay.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`
                : "Select a date to see available times"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedDay ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a date to view available time slots</p>
              </div>
            ) : isLoadingSlots ? (
              <div className="text-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                <p className="mt-4 text-muted-foreground">Loading available times...</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No available slots for this date.</p>
                <p className="text-sm mt-2">Please select another date.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {availableSlots.map((slot) => {
                  const isSelected = selectedDate === slot.date && selectedTime === slot.time
                  return (
                    <Button
                      key={`${slot.date}-${slot.time}`}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "h-11",
                        !slot.available && "opacity-50 cursor-not-allowed line-through",
                        isSelected && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
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

            {selectedDay && availableSlots.length > 0 && (
              <div className="mt-4 pt-4 border-t flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-primary" />
                  <span className="text-muted-foreground">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded border border-border" />
                  <span className="text-muted-foreground">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-muted opacity-50" />
                  <span className="text-muted-foreground">Booked</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
