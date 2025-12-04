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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !docType || !selectedApp) return

    setIsUploading(true)
    setUploadProgress(0)

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 10
      })
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
    setReuploadFile(null)
    setReuploadDialogOpen(true)
  }

  const handleReuploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReuploadFile(e.target.files[0])
    }
  }

  const handleReupload = async () => {
    if (!reuploadFile || !reuploadingDoc) return

    setIsReuploading(true)

    const result = await reuploadDocument({
      documentId: reuploadingDoc.id,
      clientId: profile.id,
      file: reuploadFile,
    })

    setIsReuploading(false)

    if (result.success && result.data) {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === reuploadingDoc.id
            ? {
                ...doc,
                status: "pending" as DocumentStatus,
                name: reuploadFile.name,
                uploadedAt: new Date().toISOString(),
              }
            : doc,
        ),
      )
      setReuploadDialogOpen(false)
      setReuploadingDoc(null)
      setReuploadFile(null)
      setSuccessMessage("Document re-uploaded successfully! It will be reviewed shortly.")
      setTimeout(() => setSuccessMessage(null), 3000)
    }
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

  const documentsByStatus = {
    pending: documents.filter((d) => d.status === "pending"),
    requires_update: documents.filter((d) => d.status === "requires_update"),
    approved: documents.filter((d) => d.status === "approved"),
    rejected: documents.filter((d) => d.status === "rejected"),
  }

  const totalDocuments = documents.length
  const approvedCount = documentsByStatus.approved.length
  const pendingCount = documentsByStatus.pending.length
  const requiresUpdateCount = documentsByStatus.requires_update.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Documents</h1>
          <p className="text-muted-foreground">Upload and manage your application documents.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground">
              <UploadIcon className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">Upload New Document</DialogTitle>
              <DialogDescription>Select a document type and upload your file.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Application</Label>
                <Select value={selectedApp} onValueChange={setSelectedApp}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select application" />
                  </SelectTrigger>
                  <SelectContent>
                    {profile.applications.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.institution || app.serviceType} - {app.country}
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
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                {selectedFile && <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>}
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <Button
                onClick={handleUpload}
                className="w-full bg-primary text-primary-foreground"
                disabled={!selectedFile || !docType || !selectedApp || isUploading}
              >
                {isUploading ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 rounded-lg bg-green-100 text-green-800 flex items-center gap-2">
          <CheckCircleIcon className="h-5 w-5" />
          {successMessage}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <FileTextIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{totalDocuments}</p>
                <p className="text-sm text-muted-foreground">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{approvedCount}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <ClockIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <AlertCircleIcon className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{requiresUpdateCount}</p>
                <p className="text-sm text-muted-foreground">Needs Update</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="py-12 text-center">
            <FileTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-card-foreground mb-2">No Documents Yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first document to get started with your application.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-primary text-primary-foreground">
              <UploadIcon className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => {
            const config = statusConfig[doc.status]
            const StatusIcon = config.icon

            return (
              <Card key={doc.id} className="bg-card">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bgColor}`}>
                        <StatusIcon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-card-foreground">{doc.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {doc.type.replace("_", " ")} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                        {doc.adminNotes && (
                          <div className="mt-2 flex items-start gap-2 text-sm">
                            <MessageSquareIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <p className="text-muted-foreground">{doc.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${config.bgColor} ${config.color}`}>{config.label}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => handleView(doc)}>
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)}>
                        <DownloadIcon className="h-4 w-4" />
                      </Button>
                      {(doc.status === "requires_update" || doc.status === "rejected") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent"
                          onClick={() => handleReuploadClick(doc)}
                        >
                          Re-upload
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Re-upload Dialog */}
      <Dialog open={reuploadDialogOpen} onOpenChange={setReuploadDialogOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Re-upload Document</DialogTitle>
            <DialogDescription>Upload a new version of "{reuploadingDoc?.name}".</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select New File</Label>
              <Input
                type="file"
                ref={reuploadInputRef}
                onChange={handleReuploadFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              {reuploadFile && <p className="text-sm text-muted-foreground">Selected: {reuploadFile.name}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setReuploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleReupload}
                className="flex-1 bg-primary text-primary-foreground"
                disabled={!reuploadFile || isReuploading}
              >
                {isReuploading ? "Uploading..." : "Re-upload"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-card max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">{viewingDoc?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {viewingDoc?.fileUrl ? (
              <div className="rounded-lg overflow-hidden border">
                <img src={viewingDoc.fileUrl || "/placeholder.svg"} alt={viewingDoc.name} className="w-full h-auto" />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                <div className="text-center">
                  <FileTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Preview not available</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 bg-transparent"
                    onClick={() => viewingDoc && handleDownload(viewingDoc)}
                  >
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Download to view
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
