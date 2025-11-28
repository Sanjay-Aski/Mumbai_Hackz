"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

const forecastData = [
  { month: "Jul", actual: 4280, forecast: null },
  { month: "Aug", actual: null, forecast: 4500, low: 3800, high: 5200 },
  { month: "Sep", actual: null, forecast: 4800, low: 4000, high: 5600 },
  { month: "Oct", actual: null, forecast: 5100, low: 4200, high: 6000 },
  { month: "Nov", actual: null, forecast: 5300, low: 4400, high: 6200 },
  { month: "Dec", actual: null, forecast: 5600, low: 4600, high: 6600 },
]

export function IncomeForecast() {
  return (
    <Card className="border-[#E2E8F0]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#1A2B3C] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#48BB78]" />
            Income Forecast (6-Month)
          </CardTitle>
          <Badge variant="outline" className="text-[#48BB78] border-[#48BB78]/50 text-xs">
            AI Prediction
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData}>
              <defs>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#48BB78" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#48BB78" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D4AA" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#00D4AA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#2D3748" }}
                axisLine={{ stroke: "#E2E8F0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#2D3748" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A2B3C",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => [
                  `$${value?.toLocaleString() || "N/A"}`,
                  name === "actual" ? "Actual" : name === "forecast" ? "Forecast" : name,
                ]}
              />
              <Area type="monotone" dataKey="high" stroke="none" fill="#48BB78" fillOpacity={0.1} />
              <Area type="monotone" dataKey="low" stroke="none" fill="#fff" />
              <Area type="monotone" dataKey="actual" stroke="#00D4AA" strokeWidth={2} fill="url(#actualGradient)" />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#48BB78"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#forecastGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-[#00D4AA]" />
            <span className="text-[#2D3748]">Actual</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-[#48BB78]" />
            <span className="text-[#2D3748]">Forecast</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-[#48BB78]/30" />
            <span className="text-[#2D3748]">Confidence Range</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
