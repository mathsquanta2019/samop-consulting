"use client"

import type React from "react"

import { useState } from "react"
import { useAdmin } from "../layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, Lock, Building, Users, CheckCircle } from "lucide-react"
import { changePassword } from "@/lib/api"

export default function AdminSettingsPage() {
  const { admin } = useAdmin()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [notifications, setNotifications] = useState({
    newClients: true,
    newAppointments: true,
    newMessages: true,
    documentUploads: true,
    weeklyReport: true,
  })

  if (!admin) return null

  const initials = `${admin.firstName[0]}${admin.lastName[0]}`.toUpperCase()

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return
    }

    setIsSubmitting(true)
    const result = await changePassword(admin.id, passwordData.currentPassword, passwordData.newPassword)

    if (result.success) {
      setPasswordSuccess(true)
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setTimeout(() => {
        setIsChangingPassword(false)
        setPasswordSuccess(false)
      }, 2000)
    } else {
      setPasswordError(result.error || "Failed to change password")
    }
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Settings</h1>
        <p className="text-muted-foreground">Manage your admin account and system settings.</p>
      </div>

      {/* Admin Profile */}
      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-card-foreground">Admin Profile</CardTitle>
              <CardDescription>Your admin account information.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-card-foreground">
                {admin.firstName} {admin.lastName}
              </h3>
              <p className="text-muted-foreground">{admin.email}</p>
              <p className="text-sm text-muted-foreground mt-1">Administrator</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-card-foreground">Admin Notifications</CardTitle>
              <CardDescription>Configure your admin notification preferences.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-card-foreground">New Client Registrations</p>
              <p className="text-sm text-muted-foreground">Get notified when new clients sign up</p>
            </div>
            <Switch
              checked={notifications.newClients}
              onCheckedChange={(checked) => setNotifications({ ...notifications, newClients: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-card-foreground">New Appointments</p>
              <p className="text-sm text-muted-foreground">Get notified when clients book appointments</p>
            </div>
            <Switch
              checked={notifications.newAppointments}
              onCheckedChange={(checked) => setNotifications({ ...notifications, newAppointments: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-card-foreground">New Messages</p>
              <p className="text-sm text-muted-foreground">Get notified for new contact form submissions</p>
            </div>
            <Switch
              checked={notifications.newMessages}
              onCheckedChange={(checked) => setNotifications({ ...notifications, newMessages: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-card-foreground">Document Uploads</p>
              <p className="text-sm text-muted-foreground">Get notified when clients upload documents</p>
            </div>
            <Switch
              checked={notifications.documentUploads}
              onCheckedChange={(checked) => setNotifications({ ...notifications, documentUploads: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-card-foreground">Weekly Report</p>
              <p className="text-sm text-muted-foreground">Receive weekly summary of activities</p>
            </div>
            <Switch
              checked={notifications.weeklyReport}
              onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-card-foreground">Password & Security</CardTitle>
              <CardDescription>Update your admin password.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {passwordSuccess ? (
            <div className="text-center py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">Password Changed!</h3>
            </div>
          ) : isChangingPassword ? (
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              {passwordError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{passwordError}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsChangingPassword(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-card-foreground">Password</p>
                <p className="text-sm text-muted-foreground">Last changed: Never</p>
              </div>
              <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                Change Password
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Settings */}
      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-card-foreground">Business Settings</CardTitle>
              <CardDescription>Manage business information and preferences.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input defaultValue="SAMOP Consulting" />
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input defaultValue="info@samopconsulting.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input defaultValue="+1 (555) 000-0000" />
            </div>
            <div className="space-y-2">
              <Label>Default Appointment Duration</Label>
              <Input type="number" defaultValue="30" />
            </div>
          </div>
          <Button className="bg-primary text-primary-foreground">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  )
}
