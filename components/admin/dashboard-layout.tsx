"use client"

import type React from "react"
import type { User } from "@/lib/types"

interface AdminDashboardLayoutProps {
  children: React.ReactNode
  admin: User
}

// This component is deprecated - use app/admin/layout.tsx instead
export function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  return <>{children}</>
}
