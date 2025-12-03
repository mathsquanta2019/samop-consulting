"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { uploadDocument, getDocumentQueue, downloadDocument, viewDocument } from "@/lib/api"

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadUploadQueue()
  }, [])

  const loadUploadQueue = async () => {
    const result = await getDocumentQueue(profile.id)
    if (result.success && result.data) {
      setUploadQueue(result.data)
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

    await uploadDocument({
      applicationId: selectedApp,
      clientId: profile.id,
      type: docType,
      name: selectedFile.name,
      file: selectedFile,
    })

    clearInterval(progressInterval)
    setUploadProgress(100)

    setTimeout(() => {
      setIsUploading(false)
      setIsDialogOpen(false)
      setSelectedFile(null)
      setDocType("")
      setSelectedApp("")
      setUploadProgress(0)
    }, 500)
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
      // In production, this would trigger a file download
      window.open(result.data.downloadUrl, "_blank")
    }
  }

  const documentsByStatus = {
    requires_update: profile.documents.filter((d) => d.status === "requires_update"),
    pending: profile.documents.filter((d) => d.status === "pending"),
    approved: profile.documents.filter((d) => d.status === "approved"),
    rejected: profile.documents.filter((d) => d.status === "rejected"),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
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
              <DialogDescription>Select the application and document type, then upload your file.</DialogDescription>
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
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileTextIcon className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <UploadIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to select or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
                    </>
                  )}
                </div>
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

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <Card className="bg-card border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-blue-600" />
              Upload Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadQueue.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-blue-50">
                  <FileTextIcon className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.fileName}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {item.documentType.replace(/_/g, " ")} • {item.status}
                    </p>
                  </div>
                  <div className="w-24">
                    <Progress value={item.progress} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = profile.documents.filter((d) => d.status === status).length
          const Icon = config.icon
          return (
            <Card key={status} className="bg-card">
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

      {/* Documents Requiring Action */}
      {documentsByStatus.requires_update.length > 0 && (
        <Card className="bg-card border-orange-200">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <AlertCircleIcon className="h-5 w-5 text-orange-600" />
              Action Required
            </CardTitle>
            <CardDescription>These documents need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documentsByStatus.requires_update.map((doc) => (
                <div key={doc.id} className="p-4 rounded-lg border-2 border-orange-200 bg-orange-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                        <FileTextIcon className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{doc.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {doc.type.replace(/_/g, " ")} • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                        {doc.feedback && (
                          <div className="mt-2 p-3 rounded-lg bg-white border border-orange-200">
                            <div className="flex items-start gap-2">
                              <MessageSquareIcon className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-orange-700">Admin Feedback:</p>
                                <p className="text-sm text-orange-800">{doc.feedback}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="bg-orange-600 text-white hover:bg-orange-700">
                        <UploadIcon className="mr-2 h-3 w-3" />
                        Re-upload
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Documents List */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">All Documents</CardTitle>
          <CardDescription>View status and download your uploaded documents</CardDescription>
        </CardHeader>
        <CardContent>
          {profile.documents.length === 0 ? (
            <div className="text-center py-12">
              <FileTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-card-foreground mb-2">No Documents</h3>
              <p className="text-muted-foreground">Upload your first document to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {profile.documents
                .filter((d) => d.status !== "requires_update")
                .map((doc) => {
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
                            {doc.type.replace(/_/g, " ")} • {new Date(doc.uploadedAt).toLocaleDateString()}
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
                        <Badge
                          variant="secondary"
                          className={`${config.bgColor} ${config.color.replace("text-", "text-")}`}
                        >
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
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-card max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Document Details</DialogTitle>
          </DialogHeader>
          {viewingDoc && (
            <div className="space-y-4 py-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <FileTextIcon className="h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground ml-4">Document Preview</p>
              </div>
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
                  <Label className="text-muted-foreground">Admin Feedback</Label>
                  <p className="p-3 bg-muted rounded-lg mt-1">{viewingDoc.feedback}</p>
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
