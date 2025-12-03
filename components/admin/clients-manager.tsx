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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DataTable } from "@/components/ui/data-table"
import { UserPlus, Mail, Phone, MapPin, Send, CheckCircle, ArrowUpDown, MoreHorizontal, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ClientProfile, ServiceType } from "@/lib/types"
import { createOnboardingInvite } from "@/lib/api"

interface ClientsManagerProps {
  clients: ClientProfile[]
}

const serviceOptions: { value: ServiceType; label: string }[] = [
  { value: "education", label: "University Admissions" },
  { value: "immigration", label: "Immigration / Visa" },
  { value: "sevis", label: "SEVIS Registration" },
  { value: "credential_evaluation", label: "Credential Evaluation" },
]

export function ClientsManager({ clients }: ClientsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isInviteSent, setIsInviteSent] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const columns: ColumnDef<ClientProfile>[] = [
    {
      accessorKey: "firstName",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Client
          <ArrowUpDown className="ml-2 h-4 w-4" />
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
          <Mail className="h-3 w-3" />
          {row.getValue("email")}
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-3 w-3" />
          {row.getValue("phone")}
        </div>
      ),
    },
    {
      accessorKey: "currentCountry",
      header: "Location",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
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
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
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
              <UserPlus className="mr-2 h-4 w-4" />
              Onboard New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            {isInviteSent ? (
              <div className="text-center py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
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
                    <Send className="mr-2 h-4 w-4" />
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
    </div>
  )
}
