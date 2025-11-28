"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, ShoppingCart, FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react"

const interventions = [
  {
    id: 1,
    type: "block",
    icon: ShoppingCart,
    title: "Blocked 'Buy Now' on Amazon",
    time: "10:15 AM",
    reason: "Detected High Stress (110bpm)",
    status: "success",
  },
  {
    id: 2,
    type: "nudge",
    icon: FileText,
    title: "Nudged Proposal on Upwork",
    time: "09:30 AM",
    reason: "Suggested increase from $200 to $350",
    status: "accepted",
  },
  {
    id: 3,
    type: "alert",
    icon: AlertTriangle,
    title: "High Stress Shopping Pattern",
    time: "Yesterday",
    reason: "3 purchases during elevated cortisol",
    status: "warning",
  },
  {
    id: 4,
    type: "nudge",
    icon: FileText,
    title: "Contract Review Reminder",
    time: "Yesterday",
    reason: "Low sleep detected, delayed signing",
    status: "pending",
  },
]

const statusConfig = {
  success: { color: "text-[#48BB78]", bg: "bg-[#48BB78]/10", icon: CheckCircle, label: "Blocked" },
  accepted: { color: "text-[#00D4AA]", bg: "bg-[#00D4AA]/10", icon: CheckCircle, label: "Accepted" },
  warning: { color: "text-[#ED8936]", bg: "bg-[#ED8936]/10", icon: AlertTriangle, label: "Alert" },
  pending: { color: "text-[#667EEA]", bg: "bg-[#667EEA]/10", icon: Clock, label: "Pending" },
}

export function InterventionPanel() {
  return (
    <Card className="border-[#E2E8F0] h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#1A2B3C] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#00D4AA]" />
            Browser Guard Log
          </CardTitle>
          <Badge variant="outline" className="text-[#00D4AA] border-[#00D4AA]/50 text-xs">
            4 today
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {interventions.map((item) => {
          const config = statusConfig[item.status as keyof typeof statusConfig]
          return (
            <div
              key={item.id}
              className="p-3 rounded-lg bg-[#F7FAFC] border border-[#E2E8F0] hover:border-[#00D4AA]/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${config.bg}`}>
                  <item.icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[#1A2B3C] truncate">{item.title}</p>
                    <span className="text-xs text-[#2D3748]/50 flex-shrink-0">{item.time}</span>
                  </div>
                  <p className="text-xs text-[#2D3748]/70 mt-0.5">{item.reason}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <config.icon className={`w-3 h-3 ${config.color}`} />
                    <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
