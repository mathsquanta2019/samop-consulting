"use client"

import { useClient } from "../layout"
import { DashboardOverview } from "@/components/client/dashboard-overview"

export default function ClientDashboardPage() {
  const { profile } = useClient()

  if (!profile) return null

  return <DashboardOverview profile={profile} />
}
