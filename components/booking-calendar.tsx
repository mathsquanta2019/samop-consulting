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

  useEffect(() => {
    loadMonthAvailability()
  }, [currentMonth])

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

  const days = generateCalendarDays()
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card className="bg-card border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-card-foreground">Select Date</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center">
                  {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription className="text-sm">Hover over highlighted dates to see availability</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="h-8 flex items-center justify-center text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  {day.slice(0, 2)}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="aspect-square" />
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
                      "aspect-square w-full rounded-lg text-sm font-medium transition-all relative flex items-center justify-center",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                      isPast && "text-muted-foreground/30 cursor-not-allowed bg-transparent",
                      !isPast && !isSelected && !hasSlots && "hover:bg-muted text-foreground",
                      !isPast &&
                        hasSlots &&
                        !isSelected &&
                        "bg-primary/10 text-primary hover:bg-primary/20 font-semibold",
                      isSelected && "bg-primary text-primary-foreground shadow-md",
                      isToday && !isSelected && "ring-2 ring-primary/50",
                    )}
                  >
                    <span>{date.getDate()}</span>
                    {!isPast && hasSlots && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                    )}
                  </button>
                )

                if (!isPast && hasSlots) {
                  return (
                    <Tooltip key={date.toISOString()}>
                      <TooltipTrigger asChild>{dayButton}</TooltipTrigger>
                      <TooltipContent side="top" className="bg-foreground text-background">
                        <p className="font-semibold">
                          {slotsCount} slot{slotsCount !== 1 ? "s" : ""} available
                        </p>
                        <p className="text-xs opacity-80">
                          {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )
                }

                return dayButton
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-primary/10 flex items-center justify-center">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                </div>
                <span className="text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-primary" />
                <span className="text-muted-foreground">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded ring-2 ring-primary/50" />
                <span className="text-muted-foreground">Today</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card className="bg-card border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Available Times
            </CardTitle>
            <CardDescription>
              {selectedDay
                ? selectedDay.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                : "Select a date to see available times"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedDay ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 opacity-50" />
                </div>
                <p className="font-medium">No date selected</p>
                <p className="text-sm mt-1">Click on a highlighted date to view time slots</p>
              </div>
            ) : isLoadingSlots ? (
              <div className="text-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                <p className="mt-4 text-muted-foreground">Loading times...</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-medium">No slots available</p>
                <p className="text-sm mt-1">Please select another date</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-1">
                {availableSlots.map((slot) => {
                  const isSelected = selectedDate === slot.date && selectedTime === slot.time
                  return (
                    <Button
                      key={`${slot.date}-${slot.time}`}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "h-12 text-sm font-medium",
                        !slot.available && "opacity-40 cursor-not-allowed line-through",
                        isSelected && "ring-2 ring-primary ring-offset-2",
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
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">All times shown in Eastern Time (ET)</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
