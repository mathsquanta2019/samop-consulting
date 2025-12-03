"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ClientPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("samop_token")
    if (token) {
      router.replace("/client/dashboard")
    } else {
      router.replace("/client/login")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
