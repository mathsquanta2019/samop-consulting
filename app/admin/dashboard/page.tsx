"use client"

import { useEffect, useState } from "react"
import { AdminOverview } from "@/components/admin/admin-overview"
import type { DashboardStats } from "@/lib/types"
import { getDashboardStats } from "@/lib/api"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getDashboardStats().then((result) => {
      if (result.success && result.data) {
        setStats(result.data)
      }
      setIsLoading(false)
    })
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Unable to load stats. Please try refreshing.</p>
      </div>
    )
  }

  return <AdminOverview stats={stats} />
}
