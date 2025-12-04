"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CreditCardIcon,
  BuildingIcon,
  SmartphoneIcon,
  GlobeIcon,
} from "@/components/icons"
import {
  getPaymentGateways,
  createPaymentGateway,
  updatePaymentGateway,
  deletePaymentGateway,
  togglePaymentGatewayStatus,
} from "@/lib/api"
import type { PaymentGateway, PaymentGatewayType, PaymentGatewayRegion } from "@/lib/types"

const gatewayTypeIcons: Record<PaymentGatewayType, React.ReactNode> = {
  credit_card: <CreditCardIcon className="h-4 w-4" />,
  bank_transfer: <BuildingIcon className="h-4 w-4" />,
  mobile_money: <SmartphoneIcon className="h-4 w-4" />,
  paypal: <GlobeIcon className="h-4 w-4" />,
}

const gatewayTypeLabels: Record<PaymentGatewayType, string> = {
  credit_card: "Credit/Debit Card",
  bank_transfer: "Bank Transfer",
  mobile_money: "Mobile Money",
  paypal: "PayPal",
}

const regionLabels: Record<PaymentGatewayRegion, string> = {
  us: "United States",
  uk: "United Kingdom",
  eu: "Europe",
  africa: "Africa",
  asia: "Asia",
  global: "Global",
}

export default function PaymentGatewaysPage() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null)
  const [deletingGateway, setDeletingGateway] = useState<PaymentGateway | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    type: "bank_transfer" as PaymentGatewayType,
    region: "us" as PaymentGatewayRegion,
    isActive: true,
    bankName: "",
    accountName: "",
    accountNumber: "",
    routingNumber: "",
    swiftCode: "",
    iban: "",
    bankAddress: "",
    mobileProvider: "",
    mobileNumber: "",
    paypalEmail: "",
    processorName: "",
    merchantId: "",
    currency: "USD",
    instructions: "",
  })

  useEffect(() => {
    loadGateways()
  }, [])

  const loadGateways = async () => {
    setLoading(true)
    const response = await getPaymentGateways()
    if (response.success && response.data) {
      setGateways(response.data)
    }
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "bank_transfer",
      region: "us",
      isActive: true,
      bankName: "",
      accountName: "",
      accountNumber: "",
      routingNumber: "",
      swiftCode: "",
      iban: "",
      bankAddress: "",
      mobileProvider: "",
      mobileNumber: "",
      paypalEmail: "",
      processorName: "",
      merchantId: "",
      currency: "USD",
      instructions: "",
    })
  }

  const handleAdd = () => {
    resetForm()
    setEditingGateway(null)
    setShowDialog(true)
  }

  const handleEdit = (gateway: PaymentGateway) => {
    setFormData({
      name: gateway.name,
      type: gateway.type,
      region: gateway.region,
      isActive: gateway.isActive,
      bankName: gateway.bankName || "",
      accountName: gateway.accountName || "",
      accountNumber: gateway.accountNumber || "",
      routingNumber: gateway.routingNumber || "",
      swiftCode: gateway.swiftCode || "",
      iban: gateway.iban || "",
      bankAddress: gateway.bankAddress || "",
      mobileProvider: gateway.mobileProvider || "",
      mobileNumber: gateway.mobileNumber || "",
      paypalEmail: gateway.paypalEmail || "",
      processorName: gateway.processorName || "",
      merchantId: gateway.merchantId || "",
      currency: gateway.currency,
      instructions: gateway.instructions || "",
    })
    setEditingGateway(gateway)
    setShowDialog(true)
  }

  const handleSave = async () => {
    setSaving(true)

    const gatewayData = {
      name: formData.name,
      type: formData.type,
      region: formData.region,
      isActive: formData.isActive,
      currency: formData.currency,
      instructions: formData.instructions,
      ...(formData.type === "bank_transfer" && {
        bankName: formData.bankName,
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        routingNumber: formData.routingNumber,
        swiftCode: formData.swiftCode,
        iban: formData.iban,
        bankAddress: formData.bankAddress,
      }),
      ...(formData.type === "mobile_money" && {
        mobileProvider: formData.mobileProvider,
        mobileNumber: formData.mobileNumber,
        accountName: formData.accountName,
      }),
      ...(formData.type === "paypal" && {
        paypalEmail: formData.paypalEmail,
      }),
      ...(formData.type === "credit_card" && {
        processorName: formData.processorName,
        merchantId: formData.merchantId,
      }),
    }

    if (editingGateway) {
      await updatePaymentGateway(editingGateway.id, gatewayData)
    } else {
      await createPaymentGateway(gatewayData)
    }

    setSaving(false)
    setShowDialog(false)
    loadGateways()
  }

  const handleDelete = async () => {
    if (!deletingGateway) return
    await deletePaymentGateway(deletingGateway.id)
    setShowDeleteDialog(false)
    setDeletingGateway(null)
    loadGateways()
  }

  const handleToggleStatus = async (gateway: PaymentGateway) => {
    await togglePaymentGatewayStatus(gateway.id)
    loadGateways()
  }

  const renderTypeFields = () => {
    switch (formData.type) {
      case "bank_transfer":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bank Name *</Label>
                <Input
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="e.g., Chase Bank"
                />
              </div>
              <div className="space-y-2">
                <Label>Account Name *</Label>
                <Input
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="e.g., SAMOP Consulting LLC"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Number *</Label>
                <Input
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="e.g., 1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label>Routing Number / Sort Code</Label>
                <Input
                  value={formData.routingNumber}
                  onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                  placeholder="e.g., 021000021"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SWIFT/BIC Code</Label>
                <Input
                  value={formData.swiftCode}
                  onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                  placeholder="e.g., CHASUS33"
                />
              </div>
              <div className="space-y-2">
                <Label>IBAN</Label>
                <Input
                  value={formData.iban}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                  placeholder="e.g., GB29NWBK60161331926819"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bank Address</Label>
              <Textarea
                value={formData.bankAddress}
                onChange={(e) => setFormData({ ...formData, bankAddress: e.target.value })}
                placeholder="Full bank branch address"
                rows={2}
              />
            </div>
          </div>
        )

      case "mobile_money":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mobile Provider *</Label>
                <Select
                  value={formData.mobileProvider}
                  onValueChange={(value) => setFormData({ ...formData, mobileProvider: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                    <SelectItem value="MTN Mobile Money">MTN Mobile Money</SelectItem>
                    <SelectItem value="Airtel Money">Airtel Money</SelectItem>
                    <SelectItem value="Orange Money">Orange Money</SelectItem>
                    <SelectItem value="Tigo Cash">Tigo Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mobile Number *</Label>
                <Input
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  placeholder="e.g., +254712345678"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Account Name *</Label>
              <Input
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                placeholder="Registered name on mobile money"
              />
            </div>
          </div>
        )

      case "paypal":
        return (
          <div className="space-y-2">
            <Label>PayPal Email *</Label>
            <Input
              type="email"
              value={formData.paypalEmail}
              onChange={(e) => setFormData({ ...formData, paypalEmail: e.target.value })}
              placeholder="e.g., payments@company.com"
            />
          </div>
        )

      case "credit_card":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Processor Name *</Label>
                <Select
                  value={formData.processorName}
                  onValueChange={(value) => setFormData({ ...formData, processorName: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select processor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Stripe">Stripe</SelectItem>
                    <SelectItem value="Square">Square</SelectItem>
                    <SelectItem value="PayStack">PayStack</SelectItem>
                    <SelectItem value="Flutterwave">Flutterwave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Merchant ID</Label>
                <Input
                  value={formData.merchantId}
                  onChange={(e) => setFormData({ ...formData, merchantId: e.target.value })}
                  placeholder="e.g., acct_1234567890"
                />
              </div>
            </div>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Gateways</h1>
          <p className="text-muted-foreground">Manage payment methods and bank details for different regions</p>
        </div>
        <Button onClick={handleAdd}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Gateway
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Payment Gateways</CardTitle>
          <CardDescription>
            These payment options will be available to clients during booking based on their region
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gateways.map((gateway) => (
                <TableRow key={gateway.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {gatewayTypeIcons[gateway.type]}
                      {gateway.name}
                    </div>
                  </TableCell>
                  <TableCell>{gatewayTypeLabels[gateway.type]}</TableCell>
                  <TableCell>{regionLabels[gateway.region]}</TableCell>
                  <TableCell>{gateway.currency}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={gateway.isActive} onCheckedChange={() => handleToggleStatus(gateway)} />
                      <Badge variant={gateway.isActive ? "default" : "secondary"}>
                        {gateway.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(gateway)}>
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeletingGateway(gateway)
                          setShowDeleteDialog(true)
                        }}
                      >
                        <TrashIcon className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {gateways.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No payment gateways configured. Click "Add Gateway" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGateway ? "Edit Payment Gateway" : "Add Payment Gateway"}</DialogTitle>
            <DialogDescription>Configure payment method details for client transactions</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gateway Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., US Bank Transfer"
                />
              </div>
              <div className="space-y-2">
                <Label>Currency *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                    <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                    <SelectItem value="GHS">GHS - Ghanaian Cedi</SelectItem>
                    <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: PaymentGatewayType) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="credit_card">Credit/Debit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Region *</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value: PaymentGatewayRegion) => setFormData({ ...formData, region: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="eu">Europe</SelectItem>
                    <SelectItem value="africa">Africa</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="global">Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Payment Details</h4>
              {renderTypeFields()}
            </div>

            <div className="space-y-2">
              <Label>Payment Instructions</Label>
              <Textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Instructions for clients making payments..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>Gateway is active and available for payments</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.name}>
              {saving ? "Saving..." : editingGateway ? "Update Gateway" : "Create Gateway"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment Gateway</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingGateway?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Gateway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
