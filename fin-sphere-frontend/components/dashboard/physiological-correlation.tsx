"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, ShoppingCart } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip } from "recharts"

const correlationData = [
  { time: "6AM", stress: 30, spending: 0 },
  { time: "9AM", stress: 45, spending: 0 },
  { time: "12PM", stress: 55, spending: 25 },
  { time: "3PM", stress: 85, spending: 120 },
  { time: "6PM", stress: 70, spending: 45 },
  { time: "9PM", stress: 40, spending: 15 },
]

export function PhysiologicalCorrelation() {
  return (
    <Card className="card-hover border-[#E2E8F0]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#1A2B3C]">Stress-Spending Correlation</CardTitle>
          <Badge variant="outline" className="text-[#ED8936] border-[#ED8936]/50 text-xs">
            3 overlaps today
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={correlationData}>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "#2D3748" }}
                axisLine={{ stroke: "#E2E8F0" }}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A2B3C",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <ReferenceLine y={70} stroke="#FF4D4D" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="stress" stroke="#FF4D4D" strokeWidth={2} dot={false} name="Stress Level" />
              <Line
                type="monotone"
                dataKey="spending"
                stroke="#667EEA"
                strokeWidth={2}
                dot={false}
                name="Spending ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-xs">
            <Activity className="w-4 h-4 text-[#FF4D4D]" />
            <span className="text-[#2D3748]">Stress Level</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <ShoppingCart className="w-4 h-4 text-[#667EEA]" />
            <span className="text-[#2D3748]">Spending Velocity</span>
          </div>
        </div>
        <p className="text-xs text-[#2D3748]/70 mt-3 text-center">
          Peak stress at 3PM correlated with $120 impulse spend
        </p>
      </CardContent>
    </Card>
  )
}
