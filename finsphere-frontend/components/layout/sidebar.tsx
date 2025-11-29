"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Brain,
  Network,
  Watch,
  Wallet,
  Shield,
  MessageCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useUser } from "@/contexts/UserContext"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/coach", icon: Brain, label: "AI Coach & Voice" },
  { href: "/graph", icon: Network, label: "Causal Graph" },
  { href: "/biometrics", icon: Watch, label: "Biometrics & Health" },
  { href: "/income", icon: Wallet, label: "Income & Smart Contracts" },
  { href: "/extension", icon: Shield, label: "Browser Extension Settings" },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { selectedUser } = useUser()

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  const displayName = selectedUser?.full_name || "Guest User"
  const initials = getInitials(displayName)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-[#1A2B3C] text-white transition-all duration-300 flex flex-col",
        collapsed ? "w-[72px]" : "w-[240px]",
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg teal-gradient flex items-center justify-center">
              <span className="text-[#1A2B3C] font-bold text-sm">F</span>
            </div>
            <span className="font-semibold text-lg gradient-text">FinSphere</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg teal-gradient flex items-center justify-center mx-auto">
            <span className="text-[#1A2B3C] font-bold text-sm">F</span>
          </div>
        )}
      </div>

      {/* User Profile Card */}
      <div className={cn("p-4 border-b border-white/10", collapsed && "flex justify-center")}>
        <div className={cn("flex items-center gap-3", collapsed && "flex-col")}>
          <Avatar className="w-10 h-10 ring-2 ring-[#00D4AA]">
            <AvatarImage src="/professional-woman-avatar.png" />
            <AvatarFallback className="bg-[#00D4AA] text-[#1A2B3C]">{initials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{displayName}</p>
              <Badge variant="outline" className="text-[10px] text-[#00D4AA] border-[#00D4AA]/50 mt-1">
                {selectedUser ? selectedUser.spending_personality : 'Select User'}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive ? "bg-[#00D4AA]/20 text-[#00D4AA]" : "text-white/70 hover:bg-white/5 hover:text-white",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-[#00D4AA]")} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {!collapsed && (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-white/70 hover:text-white hover:bg-white/5"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">Need help?</span>
          </Button>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full text-white/70 hover:text-white hover:bg-white/5",
            collapsed ? "justify-center px-2" : "justify-start gap-3",
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </Button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#00D4AA] rounded-full flex items-center justify-center shadow-lg hover:bg-[#00D4AA]/90 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-[#1A2B3C]" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-[#1A2B3C]" />
        )}
      </button>
    </aside>
  )
}
