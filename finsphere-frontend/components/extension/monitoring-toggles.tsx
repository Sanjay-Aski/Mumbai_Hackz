"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Eye, ShoppingCart, FileText, Bitcoin, CreditCard, Gamepad2 } from "lucide-react"

const monitoringOptions = [
  {
    id: "upwork",
    label: "Monitor Upwork Proposals",
    description: "Suggest optimal pricing based on your state",
    icon: FileText,
    enabled: true,
  },
  {
    id: "amazon",
    label: "Monitor Amazon Checkout",
    description: "Intervene during stress-triggered purchases",
    icon: ShoppingCart,
    enabled: true,
  },
  {
    id: "crypto",
    label: "Monitor Crypto Wallets",
    description: "Prevent impulsive trading decisions",
    icon: Bitcoin,
    enabled: true,
  },
  {
    id: "subscriptions",
    label: "Monitor Subscription Sites",
    description: "Alert before new recurring charges",
    icon: CreditCard,
    enabled: false,
  },
  {
    id: "gaming",
    label: "Monitor Gaming Platforms",
    description: "Track in-game and digital purchases",
    icon: Gamepad2,
    enabled: true,
  },
]

export function MonitoringToggles() {
  const [options, setOptions] = useState(monitoringOptions)

  const toggleOption = (id: string) => {
    setOptions((prev) => prev.map((opt) => (opt.id === id ? { ...opt, enabled: !opt.enabled } : opt)))
  }

  return (
    <Card className="border-[#E2E8F0]">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-[#1A2B3C] flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#00D4AA]" />
          Monitoring Toggles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {options.map((option) => (
          <div
            key={option.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              option.enabled ? "bg-[#00D4AA]/5 border-[#00D4AA]/20" : "bg-[#F7FAFC] border-[#E2E8F0]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${option.enabled ? "bg-[#00D4AA]/10" : "bg-[#E2E8F0]"}`}>
                <option.icon className={`w-4 h-4 ${option.enabled ? "text-[#00D4AA]" : "text-[#2D3748]/50"}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1A2B3C]">{option.label}</p>
                <p className="text-xs text-[#2D3748]/50">{option.description}</p>
              </div>
            </div>
            <Switch
              checked={option.enabled}
              onCheckedChange={() => toggleOption(option.id)}
              className="data-[state=checked]:bg-[#00D4AA]"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
