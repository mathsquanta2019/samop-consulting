"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DataTable } from "@/components/ui/data-table"
import {
  UserPlusIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  SendIcon,
  CheckCircleIcon,
  ArrowUpDownIcon,
  MoreHorizontalIcon,
  EyeIcon,
  TrashIcon,
  EditIcon,
} from "@/components/icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import type { ClientProfile, ServiceType } from "@/lib/types"
import { createOnboardingInvite, deleteClient, updateClientProfile, sendEmailToClient } from "@/lib/api"

interface ClientsManagerProps {
  clients: ClientProfile[]
  onRefresh?: () => void
}

const serviceOptions: { value: ServiceType; label: string }[] = [
  { value: "education", label: "University Admissions" },
  { value: "immigration", label: "Immigration / Visa" },
  { value: "sevis", label: "SEVIS Registration" },
  { value: "credential_evaluation", label: "Credential Evaluation" },
]

export function ClientsManager({ clients, onRefresh }: ClientsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isInviteSent, setIsInviteSent] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // View/Edit Client Dialog
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editClient, setEditClient] = useState<ClientProfile | null>(null)
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    currentCountry: "",
  })
  const [editSuccess, setEditSuccess] = useState(false)

  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [emailClient, setEmailClient] = useState<ClientProfile | null>(null)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [emailSuccess, setEmailSuccess] = useState(false)

  // Delete Confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<ClientProfile | null>(null)
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  const handleSendInvite = async () => {
    if (!inviteEmail || selectedServices.length === 0) return

    setIsSubmitting(true)
    const result = await createOnboardingInvite({
      email: inviteEmail,
      serviceTypes: selectedServices,
    })

    if (result.success) {
      setIsInviteSent(true)
    }
    setIsSubmitting(false)
  }

  const resetInviteForm = () => {
    setInviteEmail("")
    setSelectedServices([])
    setIsInviteSent(false)
    setIsDialogOpen(false)
  }

  const handleOpenEditDialog = (client: ClientProfile) => {
    setEditClient(client)
    setEditForm({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      address: client.address || "",
      currentCountry: client.currentCountry,
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editClient) return
    setIsSubmitting(true)

    const result = await updateClientProfile(editClient.id, editForm)

    if (result.success) {
      setEditSuccess(true)
      setTimeout(() => {
        setIsEditDialogOpen(false)
        setEditClient(null)
        setEditSuccess(false)
        onRefresh?.()
      }, 1500)
    }
    setIsSubmitting(false)
  }

  const handleOpenEmailDialog = (client: ClientProfile) => {
    setEmailClient(client)
    setEmailSubject("")
    setEmailBody("")
    setIsEmailDialogOpen(true)
  }

  const handleSendEmail = async () => {
    if (!emailClient || !emailSubject || !emailBody) return
    setIsSubmitting(true)

    const result = await sendEmailToClient({
      clientId: emailClient.id,
      subject: emailSubject,
      body: emailBody,
    })

    if (result.success) {
      setEmailSuccess(true)
      setTimeout(() => {
        setIsEmailDialogOpen(false)
        setEmailClient(null)
        setEmailSubject("")
        setEmailBody("")
        setEmailSuccess(false)
      }, 2000)
    }
    setIsSubmitting(false)
  }

  const handleDeleteClient = async () => {
    if (!clientToDelete) return
    setIsSubmitting(true)

    const result = await deleteClient(clientToDelete.id)

    if (result.success) {
      setDeleteSuccess(true)
      setTimeout(() => {
        setIsDeleteDialogOpen(false)
        setClientToDelete(null)
        setDeleteSuccess(false)
        onRefresh?.()
      }, 1500)
    }
    setIsSubmitting(false)
  }

  const columns: ColumnDef<ClientProfile>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "firstName",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Client
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const client = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {client.firstName[0]}
                {client.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {client.firstName} {client.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{client.nationality}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MailIcon className="h-3 w-3" />
          {row.getValue("email")}
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <PhoneIcon className="h-3 w-3" />
          {row.getValue("phone")}
        </div>
      ),
    },
    {
      accessorKey: "currentCountry",
      header: "Location",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPinIcon className="h-3 w-3" />
          {row.getValue("currentCountry")}
        </div>
      ),
    },
    {
      id: "applications",
      header: "Applications",
      cell: ({ row }) => <Badge variant="secondary">{row.original.applications.length} Active</Badge>,
    },
    {
      id: "status",
      header: "Status",
      cell: () => (
        <Badge variant="default" className="bg-green-100 text-green-700">
          Active
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelectedClient(row.original)
                setIsViewDialogOpen(true)
              }}
            >
              <EyeIcon className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenEditDialog(row.original)}>
              <EditIcon className="mr-2 h-4 w-4" />
              Edit Client
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenEmailDialog(row.original)}>
              <MailIcon className="mr-2 h-4 w-4" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                setClientToDelete(row.original)
                setIsDeleteDialogOpen(true)
              }}
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete Client
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Client Management</h1>
          <p className="text-muted-foreground">View, manage, and onboard clients.</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetInviteForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground">
              <UserPlusIcon className="mr-2 h-4 w-4" />
              Onboard New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            {isInviteSent ? (
              <div className="text-center py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-6">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Invitation Sent!</h3>
                <p className="text-muted-foreground mb-6">
                  An onboarding invitation has been sent to <strong>{inviteEmail}</strong>
                </p>
                <Button onClick={resetInviteForm}>Close</Button>
              </div>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="text-card-foreground">Initiate Client Onboarding</DialogTitle>
                  <DialogDescription>
                    Send an invitation link to the client to complete their registration.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-email">Client Email</Label>
                    <Input
                      id="client-email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="client@example.com"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Services Required</Label>
                    {serviceOptions.map((service) => (
                      <div key={service.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={service.value}
                          checked={selectedServices.includes(service.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedServices([...selectedServices, service.value])
                            } else {
                              setSelectedServices(selectedServices.filter((s) => s !== service.value))
                            }
                          }}
                        />
                        <label htmlFor={service.value} className="text-sm font-medium leading-none cursor-pointer">
                          {service.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleSendInvite}
                    className="w-full bg-primary text-primary-foreground"
                    disabled={!inviteEmail || selectedServices.length === 0 || isSubmitting}
                  >
                    <SendIcon className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Sending..." : "Send Invitation"}
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card">
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={clients}
            searchPlaceholder="Search clients..."
            exportFilename="samop-clients"
            filterColumns={[
              {
                key: "currentCountry",
                label: "Country",
                options: [
                  { value: "Nigeria", label: "Nigeria" },
                  { value: "United Kingdom", label: "United Kingdom" },
                  { value: "United States", label: "United States" },
                ],
              },
            ]}
          />
        </CardContent>
      </Card>

      {/* View Client Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-card max-w-2xl">
          {selectedClient && (
            <>
              <DialogHeader>
                <DialogTitle className="text-card-foreground">
                  {selectedClient.firstName} {selectedClient.lastName}
                </DialogTitle>
                <DialogDescription>{selectedClient.email}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedClient.phone}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Nationality</Label>
                    <p className="font-medium">{selectedClient.nationality}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Current Country</Label>
                    <p className="font-medium">{selectedClient.currentCountry}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date of Birth</Label>
                    <p className="font-medium">{selectedClient.dateOfBirth || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Address</Label>
                  <p className="font-medium">{selectedClient.address || "N/A"}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{selectedClient.applications.length}</p>
                    <p className="text-sm text-muted-foreground">Applications</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedClient.documents.length}</p>
                    <p className="text-sm text-muted-foreground">Documents</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary">{selectedClient.appointments.length}</p>
                    <p className="text-sm text-muted-foreground">Appointments</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card max-w-lg">
          {editSuccess ? (
            <div className="py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Client Updated!</h3>
              <p className="text-muted-foreground">The client information has been saved successfully.</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-card-foreground">Edit Client</DialogTitle>
                <DialogDescription>Update client information.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Country</Label>
                  <Input
                    value={editForm.currentCountry}
                    onChange={(e) => setEditForm({ ...editForm, currentCountry: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-primary text-primary-foreground"
                    onClick={handleSaveEdit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="bg-card max-w-lg">
          {emailSuccess ? (
            <div className="py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Email Sent!</h3>
              <p className="text-muted-foreground">
                Your email has been sent to {emailClient?.firstName} {emailClient?.lastName}.
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-card-foreground">Send Email</DialogTitle>
                <DialogDescription>
                  Send an email to {emailClient?.firstName} {emailClient?.lastName} ({emailClient?.email})
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Email subject..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Write your message here..."
                    rows={6}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setIsEmailDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-primary text-primary-foreground"
                    onClick={handleSendEmail}
                    disabled={isSubmitting || !emailSubject || !emailBody}
                  >
                    <SendIcon className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Sending..." : "Send Email"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog - Added success state */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card">
          {deleteSuccess ? (
            <div className="py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Client Deleted</h3>
              <p className="text-muted-foreground">The client has been removed from the system.</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-card-foreground">Delete Client</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {clientToDelete?.firstName} {clientToDelete?.lastName}? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteClient} disabled={isSubmitting}>
                  {isSubmitting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
