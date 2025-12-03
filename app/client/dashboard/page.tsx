"use client"

import { useEffect, useState } from "react"
import { useClient } from "../layout"
import { DashboardOverview } from "@/components/client/dashboard-overview"
import { getClientProfile } from "@/lib/api"
import type { ClientProfile } from "@/lib/types"

export default function ClientDashboardPage() {
  const { user, profile: contextProfile } = useClient()
  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (contextProfile) {
      setProfile(contextProfile)
      setIsLoading(false)
      return
    }

    if (user) {
      getClientProfile(user.id).then((result) => {
        if (result.success && result.data) {
          setProfile(result.data)
        }
        setIsLoading(false)
      })
    }
  }, [user, contextProfile])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

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
