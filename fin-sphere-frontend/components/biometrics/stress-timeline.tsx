"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Thermometer, AlertTriangle, CheckCircle, Clock } from "lucide-react"

const stressEvents = [
  {
    id: 1,
    time: "3:15 PM",
    level: "high",
    trigger: "Client call escalation",
    duration: "23 min",
    hrPeak: 110,
    resolved: true,
  },
  {
    id: 2,
    time: "11:30 AM",
    level: "medium",
    trigger: "Back-to-back meetings",
    duration: "45 min",
    hrPeak: 98,
    resolved: true,
  },
  {
    id: 3,
    time: "9:15 AM",
    level: "low",
    trigger: "Email notification spike",
    duration: "12 min",
    hrPeak: 85,
    resolved: true,
  },
]

const levelConfig = {
  high: { color: "text-[#FF4D4D]", bg: "bg-[#FF4D4D]/10", icon: AlertTriangle },
  medium: { color: "text-[#ED8936]", bg: "bg-[#ED8936]/10", icon: Clock },
  low: { color: "text-[#48BB78]", bg: "bg-[#48BB78]/10", icon: CheckCircle },
}

export function StressTimeline() {
  return (
    <Card className="border-[#E2E8F0]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#1A2B3C] flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-[#ED8936]" />
            Stress Events Timeline
          </CardTitle>
          <Badge variant="outline" className="text-[#2D3748] border-[#E2E8F0] text-xs">
            Today
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-[#E2E8F0]" />

          <div className="space-y-4">
            {stressEvents.map((event, index) => {
              const config = levelConfig[event.level as keyof typeof levelConfig]
              return (
                <div key={event.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div
                    className={`relative z-10 w-12 h-12 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    <config.icon className={`w-5 h-5 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className={`flex-1 p-4 rounded-lg ${config.bg} border border-[#E2E8F0]`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#1A2B3C]">{event.trigger}</span>
                        <Badge variant="outline" className={`${config.color} border-current text-xs capitalize`}>
                          {event.level}
                        </Badge>
                      </div>
                      <span className="text-xs text-[#2D3748]/70">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#2D3748]/70">
                      <span>
                        Duration: <span className="font-mono font-medium text-[#1A2B3C]">{event.duration}</span>
                      </span>
                      <span>
                        Peak HR: <span className="font-mono font-medium text-[#FF4D4D]">{event.hrPeak} bpm</span>
                      </span>
                      {event.resolved && (
                        <span className="flex items-center gap-1 text-[#48BB78]">
                          <CheckCircle className="w-3 h-3" />
                          Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
