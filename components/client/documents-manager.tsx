"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  FileTextIcon,
  UploadIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  DownloadIcon,
  MessageSquareIcon,
  EyeIcon,
  BellIcon, // Add BellIcon for notifications
} from "@/components/icons"
import type { ClientProfile, DocumentType, DocumentStatus, DocumentUploadQueue, Document } from "@/lib/types"
import {
  uploadDocument,
  getDocumentQueue,
  downloadDocument,
  viewDocument,
  reuploadDocument,
  getClientDocuments,
} from "@/lib/api"

interface DocumentsManagerProps {
  profile: ClientProfile
}

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: "passport", label: "Passport" },
  { value: "transcript", label: "Academic Transcript" },
  { value: "diploma", label: "Diploma/Degree Certificate" },
  { value: "recommendation_letter", label: "Recommendation Letter" },
  { value: "statement_of_purpose", label: "Statement of Purpose" },
  { value: "cv_resume", label: "CV/Resume" },
  { value: "financial_statement", label: "Financial Statement" },
  { value: "english_proficiency", label: "English Proficiency (IELTS/TOEFL)" },
  { value: "photo", label: "Passport Photo" },
  { value: "birth_certificate", label: "Birth Certificate" },
  { value: "police_clearance", label: "Police Clearance" },
  { value: "medical_report", label: "Medical Report" },
  { value: "employment_letter", label: "Employment Letter" },
  { value: "other", label: "Other" },
]

const statusConfig: Record<
  DocumentStatus,
  { icon: typeof CheckCircleIcon; color: string; label: string; bgColor: string }
> = {
  approved: { icon: CheckCircleIcon, color: "text-green-600", label: "Approved", bgColor: "bg-green-100" },
  rejected: { icon: XCircleIcon, color: "text-red-600", label: "Rejected", bgColor: "bg-red-100" },
  pending: { icon: ClockIcon, color: "text-yellow-600", label: "Pending Review", bgColor: "bg-yellow-100" },
  requires_update: {
    icon: AlertCircleIcon,
    color: "text-orange-600",
    label: "Update Required",
    bgColor: "bg-orange-100",
  },
}

export function DocumentsManager({ profile }: DocumentsManagerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [docType, setDocType] = useState<DocumentType | "">("")
  const [selectedApp, setSelectedApp] = useState<string>("")
  const [uploadQueue, setUploadQueue] = useState<DocumentUploadQueue[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null)
  const [reuploadDialogOpen, setReuploadDialogOpen] = useState(false)
  const [reuploadingDoc, setReuploadingDoc] = useState<Document | null>(null)
  const [reuploadFile, setReuploadFile] = useState<File | null>(null)
  const [isReuploading, setIsReuploading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const reuploadInputRef = useRef<HTMLInputElement>(null)
  const [documents, setDocuments] = useState<Document[]>(profile.documents || [])

  useEffect(() => {
    loadUploadQueue()
    loadDocuments()
  }, [profile.id])

  const loadUploadQueue = async () => {
    const result = await getDocumentQueue(profile.id)
    if (result.success && result.data) {
      setUploadQueue(result.data)
    }
  }

  const loadDocuments = async () => {
    const result = await getClientDocuments(profile.id)
    if (result.success && result.data) {
      setDocuments(result.data)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !docType || !selectedApp) return

    setIsUploading(true)
    setUploadProgress(0)

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90))
    }, 200)

    const result = await uploadDocument({
      applicationId: selectedApp,
      clientId: profile.id,
      type: docType,
      name: selectedFile.name,
      file: selectedFile,
    })

    clearInterval(progressInterval)
    setUploadProgress(100)

    if (result.success && result.data) {
      setDocuments((prev) => [...prev, result.data!])
    }

    setTimeout(() => {
      setIsUploading(false)
      setIsDialogOpen(false)
      setSelectedFile(null)
      setDocType("")
      setSelectedApp("")
      setUploadProgress(0)
      setSuccessMessage("Document uploaded successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
    }, 500)
  }

  const handleReuploadClick = (doc: Document) => {
    setReuploadingDoc(doc)
    setReuploadDialogOpen(true)
  }

  const handleReuploadFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setReuploadFile(file)
    }
  }

  const handleReupload = async () => {
    if (!reuploadingDoc || !reuploadFile) return

    setIsReuploading(true)

    const result = await reuploadDocument({
      documentId: reuploadingDoc.id,
      clientId: profile.id,
      file: reuploadFile,
    })

    if (result.success && result.data) {
      setDocuments((prev) => prev.map((d) => (d.id === reuploadingDoc.id ? result.data! : d)))
      setSuccessMessage("Document re-uploaded successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
    }

    setIsReuploading(false)
    setReuploadDialogOpen(false)
    setReuploadingDoc(null)
    setReuploadFile(null)
  }

  const handleViewDocument = async (doc: Document) => {
    const result = await viewDocument(doc.id)
    if (result.success && result.data) {
      setViewingDoc(result.data)
      setViewDialogOpen(true)
    }
  }

  const handleDownloadDocument = async (doc: Document) => {
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

  const stats = {
    total: documents.length,
    approved: documents.filter((d) => d.status === "approved").length,
    pending: documents.filter((d) => d.status === "pending").length,
    requiresUpdate: documents.filter((d) => d.status === "requires_update").length,
  }

  const documentsNeedingAttention = documents.filter((d) => d.status === "requires_update" || d.status === "rejected")

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="p-4 rounded-lg bg-green-100 text-green-800 flex items-center gap-2">
          <CheckCircleIcon className="h-5 w-5" />
          {successMessage}
        </div>
      )}

      {documentsNeedingAttention.length > 0 && (
        <div className="p-4 rounded-lg bg-orange-100 border border-orange-300 text-orange-800">
          <div className="flex items-start gap-3">
            <BellIcon className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Action Required</p>
              <p className="text-sm mt-1">
                You have {documentsNeedingAttention.length} document(s) that require your attention. Please review the
                feedback and re-upload the documents as requested.
              </p>
              <div className="mt-2 space-y-1">
                {documentsNeedingAttention.map((doc) => (
                  <div key={doc.id} className="text-sm flex items-center gap-2">
                    <span className="font-medium">{doc.name}</span>
                    <Badge className={statusConfig[doc.status].bgColor + " " + statusConfig[doc.status].color}>
                      {statusConfig[doc.status].label}
                    </Badge>
                    {doc.feedback && <span className="text-orange-700">- {doc.feedback}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileTextIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <ClockIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <AlertCircleIcon className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{stats.requiresUpdate}</p>
                <p className="text-sm text-muted-foreground">Needs Update</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Button */}
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground">
              <UploadIcon className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>Upload a document for your application.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Application</Label>
                <Select value={selectedApp} onValueChange={setSelectedApp}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an application" />
                  </SelectTrigger>
                  <SelectContent>
                    {profile.applications.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.serviceType.replace(/_/g, " ")} - {app.country || "N/A"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={docType} onValueChange={(v) => setDocType(v as DocumentType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                </div>
                {selectedFile && <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>}
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">{uploadProgress}% uploaded</p>
                </div>
              )}

              <Button
                className="w-full bg-primary text-primary-foreground"
                onClick={handleUpload}
                disabled={!selectedFile || !docType || !selectedApp || isUploading}
              >
                {isUploading ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Document List */}
      <Card className="bg-card">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Your Documents</h3>
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No documents uploaded yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Upload your first document to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const config = statusConfig[doc.status]
                const Icon = config.icon
                const needsAttention = doc.status === "requires_update" || doc.status === "rejected"
                return (
                  <div
                    key={doc.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      needsAttention ? "border-orange-300 bg-orange-50/50" : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <FileTextIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{doc.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {doc.type.replace(/_/g, " ")} • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                        {doc.feedback && (
                          <div className="mt-2 flex items-start gap-2 text-sm">
                            <MessageSquareIcon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <span className={needsAttention ? "text-orange-700" : "text-muted-foreground"}>
                              {doc.feedback}
                            </span>
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
                        <Button variant="ghost" size="icon" title="View" onClick={() => handleViewDocument(doc)}>
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Download"
                          onClick={() => handleDownloadDocument(doc)}
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </Button>
                        {needsAttention ? (
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={() => handleReuploadClick(doc)}
                          >
                            Re-upload
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => handleReuploadClick(doc)}>
                            Re-upload
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Document Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-card max-w-3xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
            <DialogDescription>{viewingDoc?.name}</DialogDescription>
          </DialogHeader>
          {viewingDoc && (
            <div className="space-y-4">
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
                  </div>
                )}
              </div>
              {viewingDoc.feedback && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm font-medium text-orange-800">Admin Feedback:</p>
                  <p className="text-sm text-orange-700 mt-1">{viewingDoc.feedback}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
                <Button
                  className="flex-1 bg-primary text-primary-foreground"
                  onClick={() => handleDownloadDocument(viewingDoc)}
                >
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Re-upload Document Dialog */}
      <Dialog open={reuploadDialogOpen} onOpenChange={setReuploadDialogOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Re-upload Document</DialogTitle>
            <DialogDescription>Upload a new version of: {reuploadingDoc?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {reuploadingDoc?.feedback && (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm font-medium text-orange-800">Admin Feedback:</p>
                <p className="text-sm text-orange-700 mt-1">{reuploadingDoc.feedback}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Select New File</Label>
              <Input
                ref={reuploadInputRef}
                type="file"
                onChange={handleReuploadFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              {reuploadFile && <p className="text-sm text-muted-foreground">Selected: {reuploadFile.name}</p>}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => {
                  setReuploadDialogOpen(false)
                  setReuploadingDoc(null)
                  setReuploadFile(null)
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={handleReupload}
                disabled={!reuploadFile || isReuploading}
              >
                {isReuploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
