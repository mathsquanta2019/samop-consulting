"use client"

import { useClient } from "../layout"
import { ApplicationsList } from "@/components/client/applications-list"

export default function ClientApplicationsPage() {
  const { profile } = useClient()

  if (!profile) return null

  return <ApplicationsList applications={profile.applications} />
}
