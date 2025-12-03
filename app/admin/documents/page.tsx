"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DocumentReviewManager } from "@/components/admin/document-review-manager"
import type { Document } from "@/lib/types"
import { getDocuments } from "@/lib/api"

export default function AdminDocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadDocuments = async () => {
    const result = await getDocuments()
    if (result.success && result.data) {
      setDocuments(result.data)
    }
    setIsLoading(false)
  }

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

      loadDocuments()
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Document Management</h1>
        <p className="text-muted-foreground">Review and approve client documents.</p>
      </div>

      <DocumentReviewManager documents={documents} onDocumentUpdated={loadDocuments} />
    </div>
  )
}
