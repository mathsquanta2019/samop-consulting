"use client"

import { useClient } from "../layout"
import { DocumentsManager } from "@/components/client/documents-manager"

export default function ClientDocumentsPage() {
  const { profile } = useClient()

  if (!profile) return null

  return <DocumentsManager profile={profile} />
}
