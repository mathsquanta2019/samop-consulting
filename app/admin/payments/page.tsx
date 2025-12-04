"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  MoreHorizontalIcon,
  DownloadIcon,
  ArrowUpDownIcon,
} from "@/components/icons"
import type { PaymentVerification, PaymentVerificationStatus } from "@/lib/types"
import { getAllPaymentVerifications, verifyPayment } from "@/lib/api"

const statusColors: Record<PaymentVerificationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  verified: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
}

export default function PaymentVerificationsPage() {
  const [verifications, setVerifications] = useState<PaymentVerification[]>([])
  const [selectedVerification, setSelectedVerification] = useState<PaymentVerification | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    loadVerifications()
  }, [])

  const loadVerifications = async () => {
    const result = await getAllPaymentVerifications()
    if (result.success && result.data) {
      setVerifications(result.data)
    }
  }

  const handleVerify = async () => {
    if (!selectedVerification) return
    setIsSubmitting(true)
    const result = await verifyPayment(selectedVerification.id, {
      status: "verified",
      adminNotes,
      verifiedBy: "admin_001",
    })
    if (result.success) {
      setVerifications((prev) => prev.map((v) => (v.id === selectedVerification.id ? { ...v, status: "verified" } : v)))
      setSuccessMessage("Payment verified successfully!")
      setVerifyDialogOpen(false)
      setSelectedVerification(null)
      setAdminNotes("")
    }
    setIsSubmitting(false)
  }

  const handleReject = async () => {
    if (!selectedVerification) return
    setIsSubmitting(true)
    const result = await verifyPayment(selectedVerification.id, {
      status: "rejected",
      adminNotes,
      verifiedBy: "admin_001",
    })
    if (result.success) {
      setVerifications((prev) => prev.map((v) => (v.id === selectedVerification.id ? { ...v, status: "rejected" } : v)))
      setSuccessMessage("Payment rejected. Client will be notified.")
      setRejectDialogOpen(false)
      setSelectedVerification(null)
      setAdminNotes("")
    }
    setIsSubmitting(false)
  }

  const columns: ColumnDef<PaymentVerification>[] = [
    {
      accessorKey: "clientName",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Client
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.clientName}</p>
          <p className="text-xs text-muted-foreground">{row.original.clientEmail}</p>
        </div>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Method",
      cell: ({ row }) => <span className="capitalize">{row.getValue<string>("paymentMethod").replace(/_/g, " ")}</span>,
    },
    {
      accessorKey: "region",
      header: "Region",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.getValue<string>("region")}
        </Badge>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.currency === "NGN" ? "₦" : "$"}
          {row.original.amount}
        </span>
      ),
    },
    {
      accessorKey: "transactionId",
      header: "Transaction ID",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.transactionId || "-"}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue<PaymentVerificationStatus>("status")
        return <Badge className={statusColors[status]}>{status}</Badge>
      },
    },
    {
      accessorKey: "createdAt",
      header: "Submitted",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const verification = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedVerification(verification)
                  setViewDialogOpen(true)
                }}
              >
                <EyeIcon className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {verification.receiptUrl && (
                <DropdownMenuItem onClick={() => window.open(verification.receiptUrl, "_blank")}>
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  View Receipt
                </DropdownMenuItem>
              )}
              {verification.status === "pending" && (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedVerification(verification)
                      setVerifyDialogOpen(true)
                    }}
                    className="text-green-600"
                  >
                    <CheckCircleIcon className="mr-2 h-4 w-4" />
                    Verify Payment
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedVerification(verification)
                      setRejectDialogOpen(true)
                    }}
                    className="text-red-600"
                  >
                    <XCircleIcon className="mr-2 h-4 w-4" />
                    Reject Payment
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payment Verifications</h1>
        <p className="text-muted-foreground">Review and verify bank transfer and mobile money payments.</p>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
          <Button variant="ghost" size="sm" className="ml-2" onClick={() => setSuccessMessage("")}>
            Dismiss
          </Button>
        </div>
      )}

      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Pending Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={verifications}
            searchPlaceholder="Search by client name or email..."
            filterColumns={[
              {
                key: "status",
                label: "Status",
                options: [
                  { value: "pending", label: "Pending" },
                  { value: "verified", label: "Verified" },
                  { value: "rejected", label: "Rejected" },
                ],
              },
              {
                key: "paymentMethod",
                label: "Method",
                options: [
                  { value: "bank_transfer", label: "Bank Transfer" },
                  { value: "mobile_money", label: "Mobile Money" },
                ],
              },
            ]}
          />
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-card max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedVerification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Client Name</Label>
                  <p className="font-medium">{selectedVerification.clientName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p>{selectedVerification.clientEmail}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payment Method</Label>
                  <p className="capitalize">{selectedVerification.paymentMethod.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Region</Label>
                  <p className="capitalize">{selectedVerification.region}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="font-semibold">
                    {selectedVerification.currency === "NGN" ? "₦" : "$"}
                    {selectedVerification.amount}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={statusColors[selectedVerification.status]}>{selectedVerification.status}</Badge>
                </div>
                {selectedVerification.transactionId && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Transaction ID</Label>
                    <p className="font-mono bg-muted p-2 rounded">{selectedVerification.transactionId}</p>
                  </div>
                )}
                {selectedVerification.receiptUrl && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Receipt</Label>
                    <Button
                      variant="outline"
                      className="w-full mt-1 bg-transparent"
                      onClick={() => window.open(selectedVerification.receiptUrl, "_blank")}
                    >
                      <DownloadIcon className="mr-2 h-4 w-4" />
                      View/Download Receipt
                    </Button>
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Verify Payment Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Verify Payment</DialogTitle>
            <DialogDescription>
              Confirm that the payment has been received for {selectedVerification?.clientName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <p>
                <strong>Amount:</strong> {selectedVerification?.currency === "NGN" ? "₦" : "$"}
                {selectedVerification?.amount}
              </p>
              <p>
                <strong>Transaction ID:</strong> {selectedVerification?.transactionId || "Not provided"}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Admin Notes (Optional)</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any notes about this verification..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setVerifyDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleVerify} className="flex-1 bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                {isSubmitting ? "Verifying..." : "Confirm Verification"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Payment Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Reject the payment verification for {selectedVerification?.clientName}. The client will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason for Rejection *</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Explain why this payment is being rejected..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                variant="destructive"
                className="flex-1"
                disabled={isSubmitting || !adminNotes}
              >
                {isSubmitting ? "Rejecting..." : "Reject Payment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
