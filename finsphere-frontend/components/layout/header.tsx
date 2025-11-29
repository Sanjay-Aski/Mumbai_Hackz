"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Mic, Watch, Bell, Shield, Settings, User, LogOut } from "lucide-react"
import { useUser } from "@/contexts/UserContext"

export function Header() {
  const [browserGuard, setBrowserGuard] = useState(true)
  const [hasNotifications] = useState(true)
  const { selectedUser } = useUser()

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  const displayName = selectedUser?.full_name || "Guest User"
  const displayEmail = selectedUser?.email || "guest@finsphere.com"
  const initials = getInitials(displayName)

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left Section - Logo for mobile */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="w-8 h-8 rounded-lg teal-gradient flex items-center justify-center">
          <span className="text-[#1A2B3C] font-bold text-sm">F</span>
        </div>
        <span className="font-semibold gradient-text">FinSphere</span>
      </div>

      {/* Center Section - Quick Actions */}
      <div className="hidden md:flex items-center gap-3">
        <Button size="sm" className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-[#1A2B3C] font-medium gap-2">
          <Plus className="w-4 h-4" />
          Add Transaction
        </Button>
        <Button size="sm" variant="outline" className="gap-2 border-[#E2E8F0] bg-transparent">
          <Mic className="w-4 h-4" />
          Start Voice Therapy
        </Button>
        <Button size="sm" variant="outline" className="gap-2 border-[#E2E8F0] bg-transparent">
          <Watch className="w-4 h-4" />
          Connect Wearable
        </Button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Browser Guard Toggle */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F7FAFC] rounded-lg">
          <Shield className={`w-4 h-4 ${browserGuard ? "text-[#00D4AA]" : "text-[#2D3748]/50"}`} />
          <span className="text-xs font-medium text-[#2D3748]">Browser Guard</span>
          <Switch
            checked={browserGuard}
            onCheckedChange={setBrowserGuard}
            className="data-[state=checked]:bg-[#00D4AA]"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-[#2D3748]" />
          {hasNotifications && <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF4D4D] rounded-full" />}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/professional-woman-diverse.png" />
                <AvatarFallback className="bg-[#00D4AA] text-[#1A2B3C]">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">{displayEmail}</p>
                {selectedUser && (
                  <p className="text-xs text-blue-600">{selectedUser.profession} • {selectedUser.location}</p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-[#FF4D4D]">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
