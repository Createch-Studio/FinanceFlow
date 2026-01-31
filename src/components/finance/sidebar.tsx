"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  TrendingUp,
  BarChart3,
  CheckSquare,
  Wallet,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/budget", label: "Budget", icon: PieChart },
  { href: "/assets", label: "Aset", icon: TrendingUp },
  { href: "/reports", label: "Laporan", icon: BarChart3 },
  { href: "/tasks", label: "Task Board", icon: CheckSquare },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r bg-card lg:block">
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
    </aside>
  )
}
