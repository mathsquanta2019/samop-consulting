"use client"

import type React from "react"
import type { ClientProfile } from "@/lib/types"

interface ClientDashboardLayoutProps {
  children: React.ReactNode
  profile: ClientProfile
}

// This component is deprecated - use app/client/layout.tsx instead
export function ClientDashboardLayout({ children }: ClientDashboardLayoutProps) {
  return <>{children}</>
}
