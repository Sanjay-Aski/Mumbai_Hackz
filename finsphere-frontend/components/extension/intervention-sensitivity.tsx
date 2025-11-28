"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Gauge, Bell, AlertTriangle, Ban } from "lucide-react"

const sensitivityLevels = [
  { value: 1, label: "Minimal", description: "Light notifications only", icon: Bell, color: "#48BB78" },
  { value: 2, label: "Moderate", description: "Notifications + delays", icon: AlertTriangle, color: "#ED8936" },
  { value: 3, label: "Aggressive", description: "Block buttons when stressed", icon: Ban, color: "#FF4D4D" },
]

export function InterventionSensitivity() {
  const [sensitivity, setSensitivity] = useState([2])
  const currentLevel = sensitivityLevels[sensitivity[0] - 1]

  return (
    <Card className="border-[#E2E8F0]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#1A2B3C] flex items-center gap-2">
            <Gauge className="w-5 h-5 text-[#667EEA]" />
            Intervention Sensitivity
          </CardTitle>
          <Badge
            variant="outline"
            className="text-xs"
            style={{ color: currentLevel.color, borderColor: `${currentLevel.color}50` }}
          >
            {currentLevel.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Slider */}
        <div className="space-y-4">
          <Slider
            value={sensitivity}
            onValueChange={setSensitivity}
            min={1}
            max={3}
            step={1}
            className="[&_[role=slider]]:bg-[#667EEA]"
          />
          <div className="flex justify-between text-xs text-[#2D3748]/50">
            <span>Minimal</span>
            <span>Moderate</span>
            <span>Aggressive</span>
          </div>
        </div>

        {/* Current Level Display */}
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: `${currentLevel.color}10`,
            borderColor: `${currentLevel.color}30`,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${currentLevel.color}20` }}>
              <currentLevel.icon className="w-5 h-5" style={{ color: currentLevel.color }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A2B3C]">{currentLevel.label} Mode</p>
              <p className="text-xs text-[#2D3748]/70">{currentLevel.description}</p>
            </div>
          </div>
        </div>

        {/* Level Descriptions */}
        <div className="space-y-2">
          {sensitivityLevels.map((level) => (
            <div
              key={level.value}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                sensitivity[0] === level.value ? "bg-[#F7FAFC] border border-[#E2E8F0]" : "opacity-50"
              }`}
            >
              <level.icon className="w-4 h-4" style={{ color: level.color }} />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1A2B3C]">{level.label}</p>
                <p className="text-xs text-[#2D3748]/50">{level.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
