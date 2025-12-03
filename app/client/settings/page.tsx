"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useClient } from "../layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Bell, Lock, Shield, CheckCircle } from "lucide-react"
import { changePassword, getNotificationPreferences, updateNotificationPreferences } from "@/lib/api"

export default function SettingsPage() {
  const { profile } = useClient()
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
    email: true,
    sms: true,
    statusUpdates: true,
    appointments: true,
    marketing: false,
  })
  const [notifSuccess, setNotifSuccess] = useState(false)

  useEffect(() => {
    loadNotificationPreferences()
  }, [])

  const loadNotificationPreferences = async () => {
    if (!profile) return
    const result = await getNotificationPreferences(profile.id)
    if (result.success && result.data) {
      setNotifications(result.data)
    }
  }

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
    const result = await changePassword(profile?.id || "", passwordData.currentPassword, passwordData.newPassword)

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

  const handleNotificationChange = async (key: keyof typeof notifications, value: boolean) => {
    const updated = { ...notifications, [key]: value }
    setNotifications(updated)

    const result = await updateNotificationPreferences(profile?.id || "", { [key]: value })
    if (result.success) {
      setNotifSuccess(true)
      setTimeout(() => setNotifSuccess(false), 2000)
    }
  }

  if (!profile) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      {/* Notifications */}
      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-card-foreground">Notifications</CardTitle>
              <CardDescription>Manage how you receive notifications.</CardDescription>
            </div>
          </div>
          {notifSuccess && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              Preferences saved
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-card-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) => handleNotificationChange("email", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-card-foreground">SMS Notifications</p>
              <p className="text-sm text-muted-foreground">Receive updates via text message</p>
            </div>
            <Switch
              checked={notifications.sms}
              onCheckedChange={(checked) => handleNotificationChange("sms", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-card-foreground">Application Status Updates</p>
              <p className="text-sm text-muted-foreground">Get notified when your application status changes</p>
            </div>
            <Switch
              checked={notifications.statusUpdates}
              onCheckedChange={(checked) => handleNotificationChange("statusUpdates", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-card-foreground">Appointment Reminders</p>
              <p className="text-sm text-muted-foreground">Get reminded about upcoming appointments</p>
            </div>
            <Switch
              checked={notifications.appointments}
              onCheckedChange={(checked) => handleNotificationChange("appointments", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-card-foreground">Marketing Communications</p>
              <p className="text-sm text-muted-foreground">Receive news about our services and promotions</p>
            </div>
            <Switch
              checked={notifications.marketing}
              onCheckedChange={(checked) => handleNotificationChange("marketing", checked)}
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
              <CardDescription>Update your password to keep your account secure.</CardDescription>
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
              <p className="text-muted-foreground">Your password has been updated successfully.</p>
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

      {/* Privacy */}
      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-card-foreground">Privacy & Data</CardTitle>
              <CardDescription>Manage your privacy settings and data.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-card-foreground">Download My Data</p>
              <p className="text-sm text-muted-foreground">Get a copy of your data in our system</p>
            </div>
            <Button variant="outline">Request Download</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">Delete Account</p>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
