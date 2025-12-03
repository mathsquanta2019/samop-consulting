"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MessagesManager } from "@/components/admin/messages-manager"
import type { User, ContactMessage } from "@/lib/types"
import { getContactMessages } from "@/lib/api"

export default function AdminMessagesPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<User | null>(null)
  const [messages, setMessages] = useState<ContactMessage[]>([])
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

      setAdmin(user)

      const msgsResult = await getContactMessages()
      if (msgsResult.success && msgsResult.data) {
        setMessages(msgsResult.data)
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading || !admin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return <MessagesManager messages={messages} />
}
