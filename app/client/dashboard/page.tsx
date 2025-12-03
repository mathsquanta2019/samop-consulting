"use client"

import { useEffect, useState } from "react"
import { DashboardOverview } from "@/components/client/dashboard-overview"
import { getClientProfile } from "@/lib/api"
import type { ClientProfile } from "@/lib/types"

export default function ClientDashboardPage() {
  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userStr = localStorage.getItem("samop_user")
        if (!userStr) {
          setError("No user found")
          setIsLoading(false)
          return
        }

        const user = JSON.parse(userStr)
        const result = await getClientProfile(user.id)

        if (result.success && result.data) {
          setProfile(result.data)
        } else {
          setError(result.error || "Failed to load profile")
        }
      } catch (e) {
        setError("Error loading profile")
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
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

  if (error || !profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{error || "Unable to load profile. Please try refreshing."}</p>
      </div>
    )
  }

  return <DashboardOverview profile={profile} />
}
