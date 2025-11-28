"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const incomeData = [
  { name: "Freelance Clients", value: 2800, color: "#00D4AA" },
  { name: "Digital Products", value: 980, color: "#667EEA" },
  { name: "Crypto Staking", value: 320, color: "#ED8936" },
  { name: "Affiliate", value: 180, color: "#48BB78" },
]

const totalIncome = incomeData.reduce((sum, item) => sum + item.value, 0)

export function IncomeBreakdown() {
  return (
    <Card className="border-[#E2E8F0]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#1A2B3C] flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#00D4AA]" />
            Income Source Breakdown
          </CardTitle>
          <Badge variant="outline" className="text-[#00D4AA] border-[#00D4AA]/50 text-xs">
            This Month
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {incomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
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
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend & Stats */}
          <div className="space-y-3">
            <div className="text-center md:text-left mb-4">
              <p className="text-xs text-[#2D3748]/70">Total Income</p>
              <p className="text-3xl font-bold text-[#1A2B3C]">${totalIncome.toLocaleString()}</p>
            </div>
            {incomeData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-[#F7FAFC]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-[#2D3748]">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-[#1A2B3C]">${item.value.toLocaleString()}</span>
                  <span className="text-xs text-[#2D3748]/50 ml-1">
                    ({Math.round((item.value / totalIncome) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
