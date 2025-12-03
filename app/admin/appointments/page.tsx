"use client"

import { useEffect, useState } from "react"
import { AppointmentsManager } from "@/components/admin/appointments-manager"
import type { Appointment } from "@/lib/types"
import { getAppointments } from "@/lib/api"

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchApts = async () => {
      const aptsResult = await getAppointments()
      if (aptsResult.success && aptsResult.data) {
        setAppointments(aptsResult.data)
      }
      setIsLoading(false)
    }
    fetchApts()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return <AppointmentsManager appointments={appointments} />
}
