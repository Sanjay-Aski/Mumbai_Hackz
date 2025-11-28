"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Receipt, ArrowUpRight, ArrowDownRight, Lock } from "lucide-react"

const transactions = [
  {
    id: 1,
    type: "income",
    description: "Upwork - Web Design Project",
    amount: 1250,
    date: "Today, 2:30 PM",
    category: "Freelance",
    autoLocked: 62.5,
  },
  {
    id: 2,
    type: "expense",
    description: "Adobe Creative Cloud",
    amount: -54.99,
    date: "Today, 9:15 AM",
    category: "Software",
  },
  {
    id: 3,
    type: "income",
    description: "Gumroad - UI Kit Sales",
    amount: 320,
    date: "Yesterday",
    category: "Products",
    autoLocked: 16.0,
  },
  {
    id: 4,
    type: "expense",
    description: "Steam - Impulsive Purchase",
    amount: -59.99,
    date: "Yesterday",
    category: "Entertainment",
    flagged: true,
  },
  {
    id: 5,
    type: "income",
    description: "Crypto Staking Rewards",
    amount: 85.5,
    date: "2 days ago",
    category: "Crypto",
  },
]

export function RecentTransactions() {
  return (
    <Card className="border-[#E2E8F0]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#1A2B3C] flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#667EEA]" />
            Recent Transactions
          </CardTitle>
          <Badge variant="outline" className="text-[#2D3748] border-[#E2E8F0] text-xs">
            Last 7 days
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                tx.flagged ? "bg-[#FF4D4D]/5 border-[#FF4D4D]/20" : "bg-[#F7FAFC] border-[#E2E8F0]"
              } hover:border-[#00D4AA]/30 transition-colors`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${tx.type === "income" ? "bg-[#48BB78]/10" : "bg-[#FF4D4D]/10"}
                `}
                >
                  {tx.type === "income" ? (
                    <ArrowDownRight className="w-5 h-5 text-[#48BB78]" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-[#FF4D4D]" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#1A2B3C]">{tx.description}</p>
                    {tx.flagged && <Badge className="bg-[#FF4D4D]/20 text-[#FF4D4D] text-xs">Stress Purchase</Badge>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#2D3748]/50">{tx.date}</span>
                    <span className="text-xs text-[#2D3748]/30">•</span>
                    <span className="text-xs text-[#2D3748]/50">{tx.category}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-semibold font-mono ${
                    tx.type === "income" ? "text-[#48BB78]" : "text-[#FF4D4D]"
                  }`}
                >
                  {tx.type === "income" ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                </p>
                {tx.autoLocked && (
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    <Lock className="w-3 h-3 text-[#00D4AA]" />
                    <span className="text-xs text-[#00D4AA]">${tx.autoLocked.toFixed(2)} locked</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
