"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Watch, Bluetooth, Battery, RefreshCw } from "lucide-react"

export function WearableStatus() {
  return (
    <Card className="border-[#E2E8F0] bg-gradient-to-r from-[#1A2B3C] to-[#2D3748] text-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/10">
              <Watch className="w-6 h-6 text-[#00D4AA]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Apple Watch Series 9</h3>
                <Badge className="bg-[#48BB78] text-white text-xs">Connected</Badge>
              </div>
              <p className="text-sm text-white/70">Last sync: 2 minutes ago</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Bluetooth className="w-4 h-4 text-[#00D4AA]" />
              <span className="text-sm">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-[#48BB78]" />
              <span className="text-sm font-mono">78%</span>
            </div>
            <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10 bg-transparent">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
