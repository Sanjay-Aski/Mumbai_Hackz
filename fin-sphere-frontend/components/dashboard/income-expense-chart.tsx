"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"

const chartData = [
  { month: "Jan", income: 3200, expenses: 2100 },
  { month: "Feb", income: 4100, expenses: 2400 },
  { month: "Mar", income: 3800, expenses: 2200 },
  { month: "Apr", income: 4500, expenses: 2800 },
  { month: "May", income: 4280, expenses: 2600 },
  { month: "Jun", income: 5100, expenses: 2900 },
]

export function IncomeExpenseChart() {
  return (
    <Card className="border-[#E2E8F0]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#1A2B3C]">Income vs Expenses</CardTitle>
          <Select defaultValue="6m">
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">3 months</SelectItem>
              <SelectItem value="6m">6 months</SelectItem>
              <SelectItem value="1y">1 year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#2D3748" }}
                axisLine={{ stroke: "#E2E8F0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#2D3748" }}
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
                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
              <Bar dataKey="income" fill="#00D4AA" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#667EEA" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
