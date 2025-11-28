"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

const hrvData = [
  { day: "Mon", hrv: 42, baseline: 45 },
  { day: "Tue", hrv: 38, baseline: 45 },
  { day: "Wed", hrv: 35, baseline: 45 },
  { day: "Thu", hrv: 48, baseline: 45 },
  { day: "Fri", hrv: 52, baseline: 45 },
  { day: "Sat", hrv: 58, baseline: 45 },
  { day: "Sun", hrv: 45, baseline: 45 },
]

export function HrvAnalysis() {
  return (
    <Card className="border-[#E2E8F0]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#1A2B3C] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00D4AA]" />
            HRV Analysis (7-Day)
          </CardTitle>
          <Badge variant="outline" className="text-[#00D4AA] border-[#00D4AA]/50 text-xs">
            Baseline: 45ms
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hrvData}>
              <defs>
                <linearGradient id="hrvGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D4AA" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#00D4AA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "#2D3748" }}
                axisLine={{ stroke: "#E2E8F0" }}
                tickLine={false}
              />
              <YAxis domain={[30, 65]} tick={{ fontSize: 10, fill: "#2D3748" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A2B3C",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="baseline"
                stroke="#667EEA"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="none"
                name="Baseline"
              />
              <Area
                type="monotone"
                dataKey="hrv"
                stroke="#00D4AA"
                strokeWidth={2}
                fill="url(#hrvGradient)"
                name="HRV"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#E2E8F0]">
          <div className="text-center">
            <p className="text-xs text-[#2D3748]/70">Weekly Avg</p>
            <p className="text-lg font-bold font-mono text-[#1A2B3C]">45.4ms</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#2D3748]/70">Recovery Score</p>
            <p className="text-lg font-bold font-mono text-[#48BB78]">Good</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#2D3748]/70">Trend</p>
            <p className="text-lg font-bold font-mono text-[#00D4AA]">+7%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
