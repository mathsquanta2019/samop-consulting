"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Copy, CheckCircle, Ticket, Send, Loader2 } from "lucide-react"
import { getAccessCodes, createAccessCode } from "@/lib/api"
import type { AccessCode } from "@/lib/types"

export default function AccessCodesPage() {
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    serviceType: "",
    expiresInDays: "7",
  })

  useEffect(() => {
    loadAccessCodes()
  }, [])

  const loadAccessCodes = async () => {
    const result = await getAccessCodes()
    if (result.success && result.data) {
      setAccessCodes(result.data)
    }
    setIsLoading(false)
  }

  const handleCreate = async () => {
    if (!formData.clientName || !formData.clientEmail || !formData.serviceType) return

    setIsCreating(true)
    const result = await createAccessCode({
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      serviceType: formData.serviceType,
      expiresInDays: Number.parseInt(formData.expiresInDays),
    })

    if (result.success && result.data) {
      setAccessCodes((prev) => [result.data!, ...prev])
      setIsDialogOpen(false)
      setFormData({ clientName: "", clientEmail: "", serviceType: "", expiresInDays: "7" })
    }
    setIsCreating(false)
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getStatusBadge = (code: AccessCode) => {
    if (code.isUsed) {
      return <Badge variant="secondary">Used</Badge>
    }
    if (new Date(code.expiresAt) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>
    }
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
  }

  const serviceTypeLabels: Record<string, string> = {
    consultation: "Initial Consultation",
    document_review: "Document Review",
    interview_prep: "Interview Preparation",
    visa_guidance: "Visa Guidance",
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Access Codes</h1>
          <p className="text-muted-foreground">Generate free booking codes for clients</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Generate Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Access Code</DialogTitle>
              <DialogDescription>
                Create a free booking code for a client. They can use this to book an appointment without payment.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type</Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(v) => setFormData({ ...formData, serviceType: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Initial Consultation</SelectItem>
                    <SelectItem value="document_review">Document Review</SelectItem>
                    <SelectItem value="interview_prep">Interview Preparation</SelectItem>
                    <SelectItem value="visa_guidance">Visa Guidance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresInDays">Expires In</Label>
                <Select
                  value={formData.expiresInDays}
                  onValueChange={(v) => setFormData({ ...formData, expiresInDays: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCreate}
                disabled={isCreating || !formData.clientName || !formData.clientEmail || !formData.serviceType}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Generate & Send to Client
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            All Access Codes
          </CardTitle>
          <CardDescription>Manage free booking codes for clients</CardDescription>
        </CardHeader>
        <CardContent>
          {accessCodes.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No access codes generated yet</p>
              <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setIsDialogOpen(true)}>
                Generate First Code
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{code.code}</code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{code.clientName}</p>
                          <p className="text-sm text-muted-foreground">{code.clientEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{serviceTypeLabels[code.serviceType] || code.serviceType}</TableCell>
                      <TableCell>{getStatusBadge(code)}</TableCell>
                      <TableCell>
                        {new Date(code.expiresAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(code.code)}
                          disabled={code.isUsed}
                        >
                          {copiedCode === code.code ? (
                            <>
                              <CheckCircle className="mr-1 h-4 w-4 text-green-600" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="mr-1 h-4 w-4" />
                              Copy
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
