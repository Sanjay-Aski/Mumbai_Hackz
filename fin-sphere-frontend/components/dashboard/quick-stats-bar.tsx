"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Vault, Calendar, TrendingUp } from "lucide-react"

const stats = [
  {
    label: "Monthly Income",
    value: "$4,280",
    icon: DollarSign,
    change: "+12%",
    positive: true,
  },
  {
    label: "Famine Fund Vault",
    value: "$1,200",
    icon: Vault,
    subtext: "Locked via Smart Contract",
    positive: true,
  },
  {
    label: "Runway",
    value: "73 days",
    icon: Calendar,
    subtext: "At current burn rate",
    positive: true,
  },
  {
    label: "Savings Rate",
    value: "28%",
    icon: TrendingUp,
    change: "+3%",
    positive: true,
  },
]

export function QuickStatsBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="card-hover border-[#E2E8F0]">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#2D3748]/70 font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-[#1A2B3C] mt-1">{stat.value}</p>
                {stat.change && (
                  <span className={`text-xs font-medium ${stat.positive ? "text-[#48BB78]" : "text-[#FF4D4D]"}`}>
                    {stat.change} this month
                  </span>
                )}
                {stat.subtext && <p className="text-xs text-[#2D3748]/50 mt-0.5">{stat.subtext}</p>}
              </div>
              <div className="p-2 rounded-lg bg-[#00D4AA]/10">
                <stat.icon className="w-5 h-5 text-[#00D4AA]" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
