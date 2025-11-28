"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Shield, ShoppingCart, FileText, TrendingUp } from "lucide-react"

const stats = [
  {
    label: "Purchases Blocked",
    value: "23",
    subtext: "This month",
    icon: ShoppingCart,
    color: "#FF4D4D",
    savings: "$1,847 saved",
  },
  {
    label: "Proposals Optimized",
    value: "8",
    subtext: "This month",
    icon: FileText,
    color: "#00D4AA",
    savings: "+$2,400 earned",
  },
  {
    label: "Stress Interventions",
    value: "45",
    subtext: "This month",
    icon: Shield,
    color: "#667EEA",
  },
  {
    label: "Protection Score",
    value: "94%",
    subtext: "Effectiveness",
    icon: TrendingUp,
    color: "#48BB78",
  },
]

export function ExtensionStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-[#E2E8F0] card-hover">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}20` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-xs text-[#2D3748]/70 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-[#1A2B3C] mt-1">{stat.value}</p>
            <p className="text-xs text-[#2D3748]/50">{stat.subtext}</p>
            {stat.savings && (
              <p className="text-xs font-medium mt-1" style={{ color: stat.color }}>
                {stat.savings}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
