"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  EyeIcon,
  DownloadIcon,
  MessageSquareIcon,
} from "@/components/icons"
import type { Document, DocumentStatus } from "@/lib/types"
import { reviewDocument } from "@/lib/api"

interface DocumentReviewManagerProps {
  documents: Document[]
  onDocumentUpdated?: () => void
}

const statusConfig: Record<
  DocumentStatus,
  { icon: typeof CheckCircleIcon; color: string; bgColor: string; label: string }
> = {
  approved: { icon: CheckCircleIcon, color: "text-green-600", bgColor: "bg-green-100", label: "Approved" },
  rejected: { icon: XCircleIcon, color: "text-red-600", bgColor: "bg-red-100", label: "Rejected" },
  pending: { icon: ClockIcon, color: "text-yellow-600", bgColor: "bg-yellow-100", label: "Pending" },
  requires_update: {
    icon: AlertCircleIcon,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    label: "Requires Update",
  },
}

export function DocumentReviewManager({ documents, onDocumentUpdated }: DocumentReviewManagerProps) {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [newStatus, setNewStatus] = useState<DocumentStatus | "">("")
  const [feedback, setFeedback] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("pending")

  const handleReview = async () => {
    if (!selectedDoc || !newStatus) return

    setIsSubmitting(true)
    const result = await reviewDocument(selectedDoc.id, {
      status: newStatus,
      feedback,
      adminNotes,
      reviewedBy: "Admin",
    })

    if (result.success) {
      setSelectedDoc(null)
      setNewStatus("")
      setFeedback("")
      setAdminNotes("")
      onDocumentUpdated?.()
    }
    setIsSubmitting(false)
  }

  const filterByStatus = (docs: Document[], tab: string) => {
    switch (tab) {
      case "pending":
        return docs.filter((d) => d.status === "pending")
      case "requires_update":
        return docs.filter((d) => d.status === "requires_update")
      case "approved":
        return docs.filter((d) => d.status === "approved")
      case "rejected":
        return docs.filter((d) => d.status === "rejected")
      default:
        return docs
    }
  }

  const stats = {
    pending: documents.filter((d) => d.status === "pending").length,
    requires_update: documents.filter((d) => d.status === "requires_update").length,
    approved: documents.filter((d) => d.status === "approved").length,
    rejected: documents.filter((d) => d.status === "rejected").length,
  }

  const filteredDocs = filterByStatus(documents, activeTab)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon
          const count = stats[status as DocumentStatus]
          return (
            <Card
              key={status}
              className={`bg-card cursor-pointer transition-colors ${activeTab === status ? "border-primary" : "hover:border-primary/50"}`}
              onClick={() => setActiveTab(status)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">{count}</p>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Document List */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Document Queue</CardTitle>
          <CardDescription>Review and approve client documents</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending" className="relative">
                Pending Review
                {stats.pending > 0 && (
                  <span className="ml-2 h-5 w-5 rounded-full bg-yellow-500 text-white text-xs flex items-center justify-center">
                    {stats.pending}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="requires_update">Requires Update</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {filteredDocs.length === 0 ? (
                <div className="text-center py-12">
                  <FileTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No documents in this category.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocs.map((doc) => {
                    const config = statusConfig[doc.status]
                    const Icon = config.icon
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                            <FileTextIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground">{doc.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {doc.type.replace(/_/g, " ")} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                            {doc.feedback && (
                              <div className="mt-2 flex items-start gap-2 text-sm">
                                <MessageSquareIcon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <span className="text-muted-foreground">{doc.feedback}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={`${config.bgColor} ${config.color}`}>
                            <Icon className={`h-3 w-3 mr-1 ${config.color}`} />
                            {config.label}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" title="View">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Download">
                              <DownloadIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedDoc(doc)
                                setNewStatus(doc.status)
                                setFeedback(doc.feedback || "")
                                setAdminNotes(doc.adminNotes || "")
                              }}
                            >
                              Review
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="bg-card max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Document</DialogTitle>
            <DialogDescription>{selectedDoc?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as DocumentStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approve</SelectItem>
                  <SelectItem value="requires_update">Request Update</SelectItem>
                  <SelectItem value="rejected">Reject</SelectItem>
                  <SelectItem value="pending">Keep Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Feedback for Client</Label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="This feedback will be visible to the client..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Provide clear instructions if requesting updates.</p>
            </div>

            <div className="space-y-2">
              <Label>Internal Notes (Admin Only)</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes not visible to client..."
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setSelectedDoc(null)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={handleReview}
                disabled={!newStatus || isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
