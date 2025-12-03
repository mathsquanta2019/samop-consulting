"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, AlertCircle, Shield } from "lucide-react"
import { loginUser } from "@/lib/api"

export default function AdminLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await loginUser(formData.email, formData.password)

      if (result.success && result.data) {
        if (result.data.user.role !== "admin") {
          setError("Access denied. Admin privileges required.")
          setIsLoading(false)
          return
        }

        localStorage.setItem("samop_admin_token", result.data.token)
        localStorage.setItem("samop_admin_user", JSON.stringify(result.data.user))

        // Use window.location for a full page navigation
        window.location.href = "/admin/dashboard"
      } else {
        setError(result.error || "Invalid credentials. Please try again.")
        setIsLoading(false)
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/images/logo.png" alt="SAMOP Consulting" width={60} height={60} className="rounded" />
            <div className="text-left">
              <span className="font-serif text-xl font-semibold text-primary-foreground">Samop Consulting</span>
              <p className="text-xs text-primary-foreground/70">Admin Portal</p>
            </div>
          </Link>
        </div>

        <Card className="bg-card">
          <CardHeader className="text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl text-card-foreground">Admin Access</CardTitle>
            <CardDescription>Sign in to the administration panel</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@samopconsulting.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In to Admin"}
              </Button>
            </form>

            <div className="mt-6 p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground text-center">
                <strong>Demo:</strong> Use email{" "}
                <code className="bg-background px-1 rounded">admin@samopconsulting.com</code> and password{" "}
                <code className="bg-background px-1 rounded">password123</code>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-primary-foreground/70">
          <Link href="/" className="hover:text-secondary">
            ← Back to Website
          </Link>
        </p>
      </div>
    </div>
  )
}
