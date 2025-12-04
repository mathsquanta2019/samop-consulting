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
  DashboardIcon,
  UsersIcon,
  FileTextIcon,
  CalendarIcon,
  MessageIcon,
  MenuIcon,
  LogOutIcon,
  SettingsIcon,
  ChevronDownIcon,
  BellIcon,
  ClockIcon,
  TicketIcon,
  FolderIcon,
  CreditCardIcon,
  BuildingIcon, // Added BuildingIcon for Payment Gateways
} from "@/components/icons"
import type { User } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AdminContextType {
  admin: User | null
}

const AdminContext = createContext<AdminContextType>({ admin: null })

export const useAdmin = () => useContext(AdminContext)

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/admin/clients", label: "Clients", icon: UsersIcon },
  { href: "/admin/applications", label: "Applications", icon: FileTextIcon },
  { href: "/admin/documents", label: "Documents", icon: FolderIcon },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarIcon },
  { href: "/admin/payments", label: "Payments", icon: CreditCardIcon },
  { href: "/admin/payment-gateways", label: "Payment Gateways", icon: BuildingIcon }, // Added Payment Gateways nav item
  { href: "/admin/availability", label: "Availability", icon: ClockIcon },
  { href: "/admin/access-codes", label: "Access Codes", icon: TicketIcon },
  { href: "/admin/messages", label: "Messages", icon: MessageIcon },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [admin, setAdmin] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false)
      return
    }

    const checkAuth = () => {
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

        setAdmin(user)
        setIsLoading(false)
      } catch (e) {
        window.location.href = "/admin/login"
      }
    }

    checkAuth()
  }, [isLoginPage])

  const handleLogout = () => {
    localStorage.removeItem("samop_admin_token")
    localStorage.removeItem("samop_admin_user")
    window.location.href = "/admin/login"
  }

  // Login page renders directly
  if (isLoginPage) {
    return <>{children}</>
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // No admin means redirect is happening
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
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header - always visible */}
        <header className="sticky top-0 z-50 h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <MenuIcon className="h-5 w-5" />
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
              <BellIcon className="h-5 w-5" />
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
                  <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="flex items-center cursor-pointer">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main container with sidebar and content */}
        <div className="flex flex-1">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 bg-sidebar border-r border-sidebar-border shrink-0">
            <nav className="p-4 space-y-2 sticky top-16">
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

              <div className="pt-4 mt-4 border-t border-sidebar-border">
                <Link href="/" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground">
                  ← Back to Website
                </Link>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </AdminContext.Provider>
  )
}
