"use client"

import type React from "react"
import { useEffect, useState, createContext, useContext } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  MessageSquare,
  Menu,
  LogOut,
  Settings,
  ChevronDown,
  Bell,
  Clock,
  Ticket,
} from "lucide-react"
import type { User } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AdminContextType {
  admin: User | null
}

const AdminContext = createContext<AdminContextType>({ admin: null })

export const useAdmin = () => useContext(AdminContext)

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/appointments", label: "Appointments", icon: Calendar },
  { href: "/admin/availability", label: "Availability", icon: Clock },
  { href: "/admin/access-codes", label: "Access Codes", icon: Ticket },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [admin, setAdmin] = useState<User | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    // Login page - just render it
    if (isLoginPage) {
      setIsReady(true)
      return
    }

    // Check authentication
    const token = localStorage.getItem("samop_admin_token")
    const userStr = localStorage.getItem("samop_admin_user")

    if (!token || !userStr) {
      window.location.href = "/admin/login"
      return
    }

    try {
      const user = JSON.parse(userStr) as User

      if (user.role !== "admin") {
        localStorage.removeItem("samop_admin_token")
        localStorage.removeItem("samop_admin_user")
        window.location.href = "/admin/login"
        return
      }

      // User is valid - set state and render
      setAdmin(user)
      setIsReady(true)
    } catch (e) {
      window.location.href = "/admin/login"
    }
  }, [isLoginPage])

  const handleLogout = () => {
    localStorage.removeItem("samop_admin_token")
    localStorage.removeItem("samop_admin_user")
    window.location.href = "/admin/login"
  }

  // Login page - render directly
  if (isLoginPage) {
    return <>{children}</>
  }

  // Not ready yet - show loading
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // No admin - redirect happening
  if (!admin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  const initials = `${admin.firstName[0]}${admin.lastName[0]}`.toUpperCase()

  return (
    <AdminContext.Provider value={{ admin }}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border bg-card">
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-sidebar">
                  <div className="p-4 border-b border-sidebar-border">
                    <Link href="/admin/dashboard" className="flex items-center gap-3">
                      <Image src="/images/logo.png" alt="SAMOP Consulting" width={40} height={40} className="rounded" />
                      <div>
                        <span className="font-serif font-semibold text-sidebar-foreground">SAMOP</span>
                        <p className="text-xs text-sidebar-foreground/70">Admin Portal</p>
                      </div>
                    </Link>
                  </div>
                  <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          pathname === item.href
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>

              <Link href="/admin/dashboard" className="flex items-center gap-3">
                <Image src="/images/logo.png" alt="SAMOP Consulting" width={40} height={40} className="rounded" />
                <div className="hidden sm:block">
                  <span className="font-serif font-semibold text-foreground">SAMOP Admin</span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-white flex items-center justify-center">
                  3
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium">{admin.firstName}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16 bg-sidebar border-r border-sidebar-border">
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    pathname === item.href
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-sidebar-border">
              <Link href="/" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground">
                ← Back to Website
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 lg:pl-64">
            <div className="p-4 lg:p-6">{children}</div>
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  )
}
