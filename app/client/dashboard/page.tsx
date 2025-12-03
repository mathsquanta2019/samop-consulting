"use client"

import { useEffect, useState } from "react"
import { useClient } from "../layout"
import { DashboardOverview } from "@/components/client/dashboard-overview"
import { getClientProfile } from "@/lib/api"
import type { ClientProfile } from "@/lib/types"

export default function ClientDashboardPage() {
  const { user, profile: contextProfile } = useClient()
  const [profile, setProfile] = useState<ClientProfile | null>(contextProfile)
  const [isLoading, setIsLoading] = useState(!contextProfile)

  useEffect(() => {
    // If we already have the profile from context, use it
    if (contextProfile) {
      setProfile(contextProfile)
      setIsLoading(false)
      return
    }

    // If we have a user but no profile, fetch it
    if (user && !profile) {
      getClientProfile(user.id).then((result) => {
        if (result.success && result.data) {
          setProfile(result.data)
        }
        setIsLoading(false)
      })
    }
  }, [user, contextProfile, profile])

  // Update profile when context changes
  useEffect(() => {
    if (contextProfile) {
      setProfile(contextProfile)
      setIsLoading(false)
    }
  }, [contextProfile])

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
