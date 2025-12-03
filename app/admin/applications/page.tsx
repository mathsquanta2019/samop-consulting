"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ApplicationsManager } from "@/components/admin/applications-manager"
import type { Application } from "@/lib/types"
import { getApplications } from "@/lib/api"

export default function AdminApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("samop_admin_token")
      const userStr = localStorage.getItem("samop_admin_user")

      if (!token || !userStr) {
        router.push("/admin/login")
        return
      }

      const user = JSON.parse(userStr)
      if (user.role !== "admin") {
        router.push("/admin/login")
        return
      }

      const fetchApps = async () => {
        const appsResult = await getApplications()
        if (appsResult.success && appsResult.data) {
          setApplications(appsResult.data)
        }
        setIsLoading(false)
      }
      fetchApps()
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return <ApplicationsManager applications={applications} />
}
