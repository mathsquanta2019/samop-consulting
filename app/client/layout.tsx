"use client"

import type React from "react"
import { useEffect, useState, createContext, useContext, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
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
  FileText,
  FolderOpen,
  Calendar,
  Menu,
  LogOut,
  User,
  Settings,
  ChevronDown,
} from "lucide-react"
import type { ClientProfile } from "@/lib/types"
import { getClientProfile } from "@/lib/api"
import { cn } from "@/lib/utils"

interface ClientContextType {
  profile: ClientProfile | null
  isLoading: boolean
  refreshProfile: () => Promise<void>
}

const ClientContext = createContext<ClientContextType>({
  profile: null,
  isLoading: true,
  refreshProfile: async () => {},
})

export const useClient = () => useContext(ClientContext)

const navItems = [
  { href: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/client/applications", label: "Applications", icon: FileText },
  { href: "/client/documents", label: "Documents", icon: FolderOpen },
  { href: "/client/appointments", label: "Appointments", icon: Calendar },
]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isLoginPage = pathname === "/client/login"

  const refreshProfile = useCallback(async () => {
    try {
      const userStr = localStorage.getItem("samop_user")
      if (userStr) {
        const user = JSON.parse(userStr)
        const result = await getClientProfile(user.id)
        if (result.success && result.data) {
          setProfile(result.data)
        }
      }
    } catch (error) {
      console.error("Failed to refresh profile:", error)
    }
  }, [])

  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false)
      return
    }

    const token = localStorage.getItem("samop_token")
    const userStr = localStorage.getItem("samop_user")

    if (!token || !userStr) {
      window.location.href = "/client/login"
      return
    }

    try {
      const user = JSON.parse(userStr)

      if (user.role !== "client") {
        window.location.href = "/client/login"
        return
      }

      // Load profile in background, don't block rendering
      getClientProfile(user.id).then((result) => {
        if (result.success && result.data) {
          setProfile(result.data)
        }
        setIsLoading(false)
      })
    } catch (error) {
      window.location.href = "/client/login"
    }
  }, [isLoginPage])

  const handleLogout = () => {
    localStorage.removeItem("samop_token")
    localStorage.removeItem("samop_user")
    window.location.href = "/client/login"
  }

  // For login page, render children directly
  if (isLoginPage) {
    return <>{children}</>
  }

  // Show minimal loading state
  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const initials = profile ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase() : "U"

  return (
    <ClientContext.Provider value={{ profile, isLoading, refreshProfile }}>
      <div className="min-h-screen bg-background">
        {/* Header - Fixed */}
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
                    <Link href="/" className="flex items-center gap-3">
                      <Image src="/images/logo.png" alt="SAMOP Consulting" width={40} height={40} className="rounded" />
                      <span className="font-serif font-semibold text-sidebar-foreground">SAMOP</span>
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

              <Link href="/" className="flex items-center gap-3">
                <Image src="/images/logo.png" alt="SAMOP Consulting" width={40} height={40} className="rounded" />
                <span className="hidden sm:block font-serif font-semibold text-foreground">Client Portal</span>
              </Link>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium">{profile?.firstName || "User"}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/client/profile" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/client/settings" className="flex items-center cursor-pointer">
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
        </header>

        <div className="flex">
          {/* Desktop Sidebar - Fixed */}
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
    </ClientContext.Provider>
  )
}
