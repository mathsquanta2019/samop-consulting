"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Upload, CheckCircle, XCircle, Clock, AlertTriangle, Download } from "lucide-react"
import type { ClientProfile, DocumentType, DocumentStatus } from "@/lib/types"
import { uploadDocument } from "@/lib/api"

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
  { value: "other", label: "Other" },
]

const statusConfig: Record<DocumentStatus, { icon: typeof CheckCircle; color: string; label: string }> = {
  approved: { icon: CheckCircle, color: "text-green-500", label: "Approved" },
  rejected: { icon: XCircle, color: "text-red-500", label: "Rejected" },
  pending: { icon: Clock, color: "text-yellow-500", label: "Pending Review" },
  requires_update: { icon: AlertTriangle, color: "text-orange-500", label: "Update Required" },
}

export function DocumentsManager({ profile }: DocumentsManagerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [docType, setDocType] = useState<DocumentType | "">("")
  const [selectedApp, setSelectedApp] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !docType || !selectedApp) return

    setIsUploading(true)
    await uploadDocument({
      applicationId: selectedApp,
      clientId: profile.id,
      type: docType,
      name: selectedFile.name,
      file: selectedFile,
    })

    setIsUploading(false)
    setIsDialogOpen(false)
    setSelectedFile(null)
    setDocType("")
    setSelectedApp("")
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
              <Upload className="mr-2 h-4 w-4" />
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
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to select or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
                    </>
                  )}
                </div>
              </div>

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

      {/* Document Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = profile.documents.filter((d) => d.status === status).length
          const Icon = config.icon
          return (
            <Card key={status} className="bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${config.color}`} />
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

      {/* Documents List */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">All Documents</CardTitle>
          <CardDescription>View status and download your uploaded documents</CardDescription>
        </CardHeader>
        <CardContent>
          {profile.documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-card-foreground mb-2">No Documents</h3>
              <p className="text-muted-foreground">Upload your first document to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {profile.documents.map((doc) => {
                const config = statusConfig[doc.status]
                const Icon = config.icon

                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{doc.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {doc.type.replace(/_/g, " ")} • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                        {doc.feedback && <p className="text-sm text-orange-600 mt-1">Feedback: {doc.feedback}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className={`${
                          doc.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : doc.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : doc.status === "requires_update"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        <Icon className={`h-3 w-3 mr-1 ${config.color}`} />
                        {config.label}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
