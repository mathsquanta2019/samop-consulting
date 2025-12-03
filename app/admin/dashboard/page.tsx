"use client"

import { useEffect, useState } from "react"
import { useAdmin } from "../layout"
import { AdminOverview } from "@/components/admin/admin-overview"
import type { DashboardStats } from "@/lib/types"
import { getDashboardStats } from "@/lib/api"

export default function AdminDashboardPage() {
  const { admin } = useAdmin()
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      const result = await getDashboardStats()
      if (result.success && result.data) {
        setStats(result.data)
      }
    }
    fetchStats()
  }, [])

  if (!admin || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return <AdminOverview stats={stats} />
}
