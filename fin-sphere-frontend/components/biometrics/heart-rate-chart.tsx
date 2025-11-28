"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart } from "lucide-react"
import { Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, Area, ComposedChart } from "recharts"

const heartRateData = [
  { time: "6AM", hr: 62, zone: "rest" },
  { time: "7AM", hr: 68, zone: "rest" },
  { time: "8AM", hr: 75, zone: "normal" },
  { time: "9AM", hr: 82, zone: "normal" },
  { time: "10AM", hr: 78, zone: "normal" },
  { time: "11AM", hr: 98, zone: "elevated" },
  { time: "12PM", hr: 85, zone: "normal" },
  { time: "1PM", hr: 72, zone: "normal" },
  { time: "2PM", hr: 88, zone: "normal" },
  { time: "3PM", hr: 110, zone: "high" },
  { time: "4PM", hr: 95, zone: "elevated" },
  { time: "5PM", hr: 78, zone: "normal" },
  { time: "Now", hr: 72, zone: "normal" },
]

export function HeartRateChart() {
  return (
    <Card className="border-[#E2E8F0]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#1A2B3C] flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#FF4D4D]" />
            Heart Rate Today
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[#48BB78] border-[#48BB78]/50 text-xs">
              Avg: 81 bpm
            </Badge>
            <Badge variant="outline" className="text-[#FF4D4D] border-[#FF4D4D]/50 text-xs">
              Peak: 110 bpm
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={heartRateData}>
              <defs>
                <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF4D4D" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#FF4D4D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "#2D3748" }}
                axisLine={{ stroke: "#E2E8F0" }}
                tickLine={false}
              />
              <YAxis domain={[50, 120]} tick={{ fontSize: 10, fill: "#2D3748" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A2B3C",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`${value} bpm`, "Heart Rate"]}
              />
              <ReferenceLine
                y={90}
                stroke="#ED8936"
                strokeDasharray="3 3"
                label={{ value: "Alert", fontSize: 10, fill: "#ED8936" }}
              />
              <ReferenceLine
                y={100}
                stroke="#FF4D4D"
                strokeDasharray="3 3"
                label={{ value: "High", fontSize: 10, fill: "#FF4D4D" }}
              />
              <Area type="monotone" dataKey="hr" fill="url(#hrGradient)" stroke="none" />
              <Line
                type="monotone"
                dataKey="hr"
                stroke="#FF4D4D"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props
                  if (payload.zone === "high") {
                    return <circle cx={cx} cy={cy} r={6} fill="#FF4D4D" className="animate-pulse" />
                  }
                  if (payload.zone === "elevated") {
                    return <circle cx={cx} cy={cy} r={4} fill="#ED8936" />
                  }
                  return <circle cx={cx} cy={cy} r={3} fill="#FF4D4D" />
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-[#48BB78]" />
            <span className="text-[#2D3748]">Rest (60-70)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-[#ED8936]" />
            <span className="text-[#2D3748]">Elevated (90-100)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-[#FF4D4D]" />
            <span className="text-[#2D3748]">High (100+)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
