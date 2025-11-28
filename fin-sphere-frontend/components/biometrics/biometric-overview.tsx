"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Heart, Activity, Thermometer, Moon } from "lucide-react"

const metrics = [
  {
    label: "Heart Rate",
    value: "72",
    unit: "bpm",
    icon: Heart,
    status: "normal",
    change: "-3 from baseline",
    color: "#FF4D4D",
  },
  {
    label: "HRV",
    value: "45",
    unit: "ms",
    icon: Activity,
    status: "good",
    change: "+8 from morning",
    color: "#00D4AA",
  },
  {
    label: "Stress Level",
    value: "32",
    unit: "%",
    icon: Thermometer,
    status: "low",
    change: "Relaxed state",
    color: "#48BB78",
  },
  {
    label: "Sleep Score",
    value: "84",
    unit: "/100",
    icon: Moon,
    status: "excellent",
    change: "7.5 hours last night",
    color: "#667EEA",
  },
]

export function BiometricOverview() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="border-[#E2E8F0] card-hover">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${metric.color}20` }}>
                <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
              </div>
              <span
                className="text-xs font-medium px-2 py-1 rounded-full"
                style={{
                  backgroundColor: `${metric.color}20`,
                  color: metric.color,
                }}
              >
                {metric.status}
              </span>
            </div>
            <p className="text-xs text-[#2D3748]/70 font-medium">{metric.label}</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-[#1A2B3C]">{metric.value}</span>
              <span className="text-sm text-[#2D3748]/70">{metric.unit}</span>
            </div>
            <p className="text-xs text-[#2D3748]/50 mt-1">{metric.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
