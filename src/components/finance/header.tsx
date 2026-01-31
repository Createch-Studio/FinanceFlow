"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  TrendingUp,
  BarChart3,
  CheckSquare,
  Wallet,
  Menu,
  LogOut,
  User,
} from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/budget", label: "Budget", icon: PieChart },
  { href: "/assets", label: "Aset", icon: TrendingUp },
  { href: "/reports", label: "Laporan", icon: BarChart3 },
  { href: "/tasks", label: "Task Board", icon: CheckSquare },
]

interface DashboardHeaderProps {
  user: SupabaseUser
  profile: Profile | null
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 md:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">FinanceFlow</span>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="lg:hidden flex items-center gap-2">
        <Wallet className="h-5 w-5 text-primary" />
        <span className="font-semibold">FinanceFlow</span>
      </div>

      <div className="hidden lg:block" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden md:inline-block">
              {profile?.full_name || user.email}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
