"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, ShoppingCart, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

const historyItems = [
  {
    id: 1,
    type: "block",
    site: "amazon.com",
    action: "Blocked checkout",
    reason: "HR 108bpm detected",
    outcome: "success",
    time: "10 min ago",
  },
  {
    id: 2,
    type: "nudge",
    site: "upwork.com",
    action: "Price suggestion",
    reason: "Proposed $200, suggested $350",
    outcome: "accepted",
    time: "2 hours ago",
  },
  {
    id: 3,
    type: "alert",
    site: "coinbase.com",
    action: "Trading warning",
    reason: "High volatility + stress detected",
    outcome: "dismissed",
    time: "Yesterday",
  },
  {
    id: 4,
    type: "block",
    site: "steam.com",
    action: "Purchase delayed",
    reason: "3rd gaming purchase this week",
    outcome: "override",
    time: "Yesterday",
  },
]

const outcomeConfig = {
  success: { icon: CheckCircle, color: "text-[#48BB78]", bg: "bg-[#48BB78]/10", label: "Blocked" },
  accepted: { icon: CheckCircle, color: "text-[#00D4AA]", bg: "bg-[#00D4AA]/10", label: "Accepted" },
  dismissed: { icon: XCircle, color: "text-[#2D3748]", bg: "bg-[#2D3748]/10", label: "Dismissed" },
  override: { icon: AlertTriangle, color: "text-[#ED8936]", bg: "bg-[#ED8936]/10", label: "Overridden" },
}

const typeIcons = {
  block: ShoppingCart,
  nudge: FileText,
  alert: AlertTriangle,
}

export function InterventionHistory() {
  return (
    <Card className="border-[#E2E8F0]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#1A2B3C] flex items-center gap-2">
            <History className="w-5 h-5 text-[#ED8936]" />
            Intervention History
          </CardTitle>
          <Badge variant="outline" className="text-[#2D3748] border-[#E2E8F0] text-xs">
            Last 48 hours
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {historyItems.map((item) => {
          const TypeIcon = typeIcons[item.type as keyof typeof typeIcons]
          const outcome = outcomeConfig[item.outcome as keyof typeof outcomeConfig]

          return (
            <div
              key={item.id}
              className="p-3 rounded-lg bg-[#F7FAFC] border border-[#E2E8F0] hover:border-[#00D4AA]/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TypeIcon className="w-4 h-4 text-[#667EEA]" />
                  <span className="text-sm font-medium text-[#1A2B3C]">{item.action}</span>
                </div>
                <span className="text-xs text-[#2D3748]/50">{item.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-[#2D3748]/70">{item.site}</p>
                  <p className="text-xs text-[#2D3748]/50">{item.reason}</p>
                </div>
                <Badge variant="outline" className={`${outcome.color} border-current text-xs`}>
                  <outcome.icon className="w-3 h-3 mr-1" />
                  {outcome.label}
                </Badge>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
