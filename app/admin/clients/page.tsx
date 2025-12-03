"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ClientsManager } from "@/components/admin/clients-manager"
import type { ClientProfile } from "@/lib/types"
import { getClients } from "@/lib/api"

export default function AdminClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<ClientProfile[]>([])
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

      const fetchClients = async () => {
        const clientsResult = await getClients()
        if (clientsResult.success && clientsResult.data) {
          setClients(clientsResult.data.items)
        }
        setIsLoading(false)
      }
      fetchClients()
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

  return <ClientsManager clients={clients} />
}
