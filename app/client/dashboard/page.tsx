"use client"

import { useEffect, useState } from "react"
import { useClient } from "../layout"
import { DashboardOverview } from "@/components/client/dashboard-overview"
import { getClientProfile } from "@/lib/api"
import type { ClientProfile } from "@/lib/types"

export default function ClientDashboardPage() {
  const { user, profile: contextProfile } = useClient()
  const [profile, setProfile] = useState<ClientProfile | null>(contextProfile)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] Dashboard: user=", user, "contextProfile=", contextProfile)

    if (contextProfile) {
      console.log("[v0] Dashboard: Using context profile")
      setProfile(contextProfile)
      setIsLoading(false)
      return
    }

    if (user) {
      console.log("[v0] Dashboard: Loading profile for user:", user.id)
      getClientProfile(user.id).then((result) => {
        console.log("[v0] Dashboard: Profile result:", result)
        if (result.success && result.data) {
          setProfile(result.data)
        }
        setIsLoading(false)
      })
    } else {
      // No user means layout is handling redirect
      console.log("[v0] Dashboard: No user, waiting for redirect")
    }
  }, [user, contextProfile])

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

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Unable to load profile. Please try refreshing.</p>
      </div>
    )
  }

  return <DashboardOverview profile={profile} />
}
