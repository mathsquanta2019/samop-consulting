"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
  MailIcon,
  RefreshCwIcon,
  UserIcon,
  FolderIcon,
} from "@/components/icons"
import type { Document, DocumentStatus, DocumentType, Application } from "@/lib/types"
import {
  reviewDocument,
  viewDocument,
  downloadDocument,
  getApplications,
  requestDocumentReupload,
  requestAdditionalDocuments,
} from "@/lib/api"

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

const documentTypeLabels: Record<DocumentType, string> = {
  passport: "Passport",
  transcript: "Academic Transcript",
  diploma: "Diploma/Certificate",
  recommendation_letter: "Recommendation Letter",
  statement_of_purpose: "Statement of Purpose",
  cv_resume: "CV/Resume",
  financial_statement: "Financial Statement",
  english_proficiency: "English Proficiency",
  photo: "Passport Photo",
  birth_certificate: "Birth Certificate",
  marriage_certificate: "Marriage Certificate",
  police_clearance: "Police Clearance",
  medical_report: "Medical Report",
  employment_letter: "Employment Letter",
  other: "Other Document",
}

export function DocumentReviewManager({ documents, onDocumentUpdated }: DocumentReviewManagerProps) {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [newStatus, setNewStatus] = useState<DocumentStatus | "">("")
  const [feedback, setFeedback] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("pending")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingDoc, setViewingDoc] = useState<(Document & { previewUrl?: string }) | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [applications, setApplications] = useState<Application[]>([])

  // Request reupload dialog
  const [reuploadDialogOpen, setReuploadDialogOpen] = useState(false)
  const [reuploadDoc, setReuploadDoc] = useState<Document | null>(null)
  const [reuploadReason, setReuploadReason] = useState("")
  const [reuploadInstructions, setReuploadInstructions] = useState("")

  // Request additional documents dialog
  const [additionalDocsDialogOpen, setAdditionalDocsDialogOpen] = useState(false)
  const [additionalDocsAppId, setAdditionalDocsAppId] = useState("")
  const [additionalDocsClientId, setAdditionalDocsClientId] = useState("")
  const [selectedDocTypes, setSelectedDocTypes] = useState<DocumentType[]>([])
  const [additionalDocsMessage, setAdditionalDocsMessage] = useState("")

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    const result = await getApplications()
    if (result.success && result.data) {
      setApplications(result.data)
    }
  }

  // Get client and application info for a document
  const getDocumentContext = (doc: Document) => {
    const app = applications.find((a) => a.id === doc.applicationId)
    return {
      clientName: app ? `Client ${app.clientId.replace("usr_", "#")}` : "Unknown Client",
      applicationName: app ? `${app.serviceType.replace(/_/g, " ")} - ${app.country || "N/A"}` : "Unknown Application",
      applicationStatus: app?.status || "unknown",
    }
  }

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
      setSuccessMessage("Document reviewed successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
      onDocumentUpdated?.()
    }
    setIsSubmitting(false)
  }

  const handleRequestReupload = async () => {
    if (!reuploadDoc || !reuploadReason) return

    setIsSubmitting(true)
    const result = await requestDocumentReupload(reuploadDoc.id, {
      reason: reuploadReason,
      instructions: reuploadInstructions,
      requestedBy: "admin_001",
    })

    if (result.success) {
      setReuploadDialogOpen(false)
      setReuploadDoc(null)
      setReuploadReason("")
      setReuploadInstructions("")
      setSuccessMessage("Re-upload request sent to client!")
      setTimeout(() => setSuccessMessage(null), 3000)
      onDocumentUpdated?.()
    }
    setIsSubmitting(false)
  }

  const handleRequestAdditionalDocs = async () => {
    if (!additionalDocsAppId || !additionalDocsClientId || selectedDocTypes.length === 0) return

    setIsSubmitting(true)
    const result = await requestAdditionalDocuments({
      applicationId: additionalDocsAppId,
      clientId: additionalDocsClientId,
      documentTypes: selectedDocTypes,
      message: additionalDocsMessage,
      requestedBy: "admin_001",
    })

    if (result.success) {
      setAdditionalDocsDialogOpen(false)
      setAdditionalDocsAppId("")
      setAdditionalDocsClientId("")
      setSelectedDocTypes([])
      setAdditionalDocsMessage("")
      setSuccessMessage("Document request sent to client!")
      setTimeout(() => setSuccessMessage(null), 3000)
      onDocumentUpdated?.()
    }
    setIsSubmitting(false)
  }

  const handleView = async (doc: Document) => {
    const result = await viewDocument(doc.id)
    if (result.success && result.data) {
      setViewingDoc(result.data)
      setViewDialogOpen(true)
    }
  }

  const handleDownload = async (doc: Document) => {
    const result = await downloadDocument(doc.id)
    if (result.success && result.data) {
      const link = document.createElement("a")
      link.href = result.data.downloadUrl
      link.download = result.data.fileName
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
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

  // Get unique applications for the additional docs request
  const uniqueApps = applications.filter((app, index, self) => index === self.findIndex((a) => a.id === app.id))

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircleIcon className="h-5 w-5" />
          {successMessage}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={() => setAdditionalDocsDialogOpen(true)} className="bg-primary text-primary-foreground">
          <MailIcon className="h-4 w-4 mr-2" />
          Request Documents from Client
        </Button>
      </div>

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
                    const context = getDocumentContext(doc)
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
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <UserIcon className="h-3 w-3" />
                                {context.clientName}
                              </span>
                              <span className="flex items-center gap-1">
                                <FolderIcon className="h-3 w-3" />
                                {context.applicationName}
                              </span>
                              <Badge variant="outline" className="text-xs capitalize">
                                {context.applicationStatus.replace(/_/g, " ")}
                              </Badge>
                            </div>
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
                            <Button variant="ghost" size="icon" title="View" onClick={() => handleView(doc)}>
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Download" onClick={() => handleDownload(doc)}>
                              <DownloadIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Request Re-upload"
                              onClick={() => {
                                setReuploadDoc(doc)
                                setReuploadDialogOpen(true)
                              }}
                            >
                              <RefreshCwIcon className="h-4 w-4" />
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
            {selectedDoc && (
              <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                <p>
                  <strong>Client:</strong> {getDocumentContext(selectedDoc).clientName}
                </p>
                <p>
                  <strong>Application:</strong> {getDocumentContext(selectedDoc).applicationName}
                </p>
              </div>
            )}
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

      {/* Request Re-upload Dialog */}
      <Dialog open={reuploadDialogOpen} onOpenChange={setReuploadDialogOpen}>
        <DialogContent className="bg-card max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Document Re-upload</DialogTitle>
            <DialogDescription>Ask the client to re-upload: {reuploadDoc?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {reuploadDoc && (
              <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                <p>
                  <strong>Document:</strong> {reuploadDoc.name}
                </p>
                <p>
                  <strong>Type:</strong> {documentTypeLabels[reuploadDoc.type]}
                </p>
                <p>
                  <strong>Client:</strong> {getDocumentContext(reuploadDoc).clientName}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Reason for Re-upload *</Label>
              <Select value={reuploadReason} onValueChange={setReuploadReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blurry">Document is blurry/unclear</SelectItem>
                  <SelectItem value="incomplete">Document is incomplete</SelectItem>
                  <SelectItem value="expired">Document has expired</SelectItem>
                  <SelectItem value="wrong_document">Wrong document uploaded</SelectItem>
                  <SelectItem value="missing_pages">Missing pages</SelectItem>
                  <SelectItem value="wrong_format">Wrong file format</SelectItem>
                  <SelectItem value="other">Other reason</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Additional Instructions</Label>
              <Textarea
                value={reuploadInstructions}
                onChange={(e) => setReuploadInstructions(e.target.value)}
                placeholder="Provide specific instructions for the client..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setReuploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={handleRequestReupload}
                disabled={!reuploadReason || isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Additional Documents Dialog */}
      <Dialog open={additionalDocsDialogOpen} onOpenChange={setAdditionalDocsDialogOpen}>
        <DialogContent className="bg-card max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Additional Documents</DialogTitle>
            <DialogDescription>Ask a client to upload additional documents for their application.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Application *</Label>
              <Select
                value={additionalDocsAppId}
                onValueChange={(v) => {
                  setAdditionalDocsAppId(v)
                  const app = uniqueApps.find((a) => a.id === v)
                  if (app) setAdditionalDocsClientId(app.clientId)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an application" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueApps.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.serviceType.replace(/_/g, " ")} - {app.country || "N/A"} ({app.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select Documents to Request *</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {Object.entries(documentTypeLabels).map(([type, label]) => (
                  <div key={type} className="flex items-center gap-2">
                    <Checkbox
                      id={type}
                      checked={selectedDocTypes.includes(type as DocumentType)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedDocTypes([...selectedDocTypes, type as DocumentType])
                        } else {
                          setSelectedDocTypes(selectedDocTypes.filter((t) => t !== type))
                        }
                      }}
                    />
                    <label htmlFor={type} className="text-sm cursor-pointer">
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Message to Client</Label>
              <Textarea
                value={additionalDocsMessage}
                onChange={(e) => setAdditionalDocsMessage(e.target.value)}
                placeholder="Add any specific instructions or context..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setAdditionalDocsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={handleRequestAdditionalDocs}
                disabled={!additionalDocsAppId || selectedDocTypes.length === 0 || isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-card max-w-3xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
            <DialogDescription>{viewingDoc?.name}</DialogDescription>
          </DialogHeader>
          {viewingDoc && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted/50 rounded-lg text-sm grid grid-cols-2 gap-2">
                <p>
                  <strong>Client:</strong> {getDocumentContext(viewingDoc).clientName}
                </p>
                <p>
                  <strong>Application:</strong> {getDocumentContext(viewingDoc).applicationName}
                </p>
              </div>
              {/* Document Preview */}
              <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden border">
                {viewingDoc.fileUrl ? (
                  <img
                    src={viewingDoc.fileUrl || "/placeholder.svg"}
                    alt={viewingDoc.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <FileTextIcon className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Preview not available</p>
                    <p className="text-sm text-muted-foreground mt-1">Click download to view the document</p>
                  </div>
                )}
              </div>

              {/* Document Details */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">File Name</Label>
                  <p className="font-medium">{viewingDoc.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="capitalize">{viewingDoc.type.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Upload Date</Label>
                  <p>{new Date(viewingDoc.uploadedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge
                    className={statusConfig[viewingDoc.status].bgColor + " " + statusConfig[viewingDoc.status].color}
                  >
                    {statusConfig[viewingDoc.status].label}
                  </Badge>
                </div>
              </div>
              {viewingDoc.feedback && (
                <div>
                  <Label className="text-muted-foreground">Client Feedback</Label>
                  <p className="p-3 bg-muted rounded-lg mt-1">{viewingDoc.feedback}</p>
                </div>
              )}
              {viewingDoc.adminNotes && (
                <div>
                  <Label className="text-muted-foreground">Admin Notes (Internal)</Label>
                  <p className="p-3 bg-yellow-50 rounded-lg mt-1 text-yellow-800">{viewingDoc.adminNotes}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
                <Button
                  className="flex-1 bg-primary text-primary-foreground"
                  onClick={() => handleDownload(viewingDoc)}
                >
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
