"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Brain, User, Clock } from "lucide-react"

const chatHistory = [
  {
    id: 1,
    type: "user",
    message: "I'm worried about taking time off. What if I lose all my clients?",
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    type: "ai",
    message:
      "That's a common fear among freelancers. Let's look at your data: Your top 3 clients have been with you for an average of 18 months, and your retention rate is 87%. Taking a short break typically doesn't affect long-term relationships. Would you like me to draft a professional 'out of office' message that maintains engagement?",
    timestamp: "2 hours ago",
    insight: "Based on 18 months of client data",
  },
  {
    id: 3,
    type: "user",
    message: "What if a big opportunity comes while I'm away?",
    timestamp: "1 hour ago",
  },
  {
    id: 4,
    type: "ai",
    message:
      "Your biometrics show you're currently stressed about this (HR elevated at 92bpm). Let me share some perspective: In the past 6 months, only 2 'urgent' opportunities came through, and both had 2-week response windows. You could set up a monitoring system that alerts you only for opportunities above your threshold value.",
    timestamp: "1 hour ago",
    insight: "Real-time biometric correlation",
  },
]

export function ChatHistory() {
  return (
    <Card className="border-[#E2E8F0]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#1A2B3C] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#00D4AA]" />
            Recent Coaching Sessions
          </CardTitle>
          <Badge variant="outline" className="text-[#2D3748] border-[#E2E8F0] text-xs">
            Last 24 hours
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {chatHistory.map((item) => (
            <div key={item.id} className={`flex gap-3 ${item.type === "ai" ? "flex-row" : "flex-row-reverse"}`}>
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${
                  item.type === "ai"
                    ? "bg-gradient-to-br from-[#00D4AA] to-[#667EEA]"
                    : "bg-[#F7FAFC] border border-[#E2E8F0]"
                }
              `}
              >
                {item.type === "ai" ? (
                  <Brain className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-[#2D3748]" />
                )}
              </div>
              <div
                className={`
                flex-1 max-w-[80%] p-3 rounded-lg
                ${
                  item.type === "ai"
                    ? "bg-gradient-to-r from-[#00D4AA]/10 to-[#667EEA]/10 border border-[#00D4AA]/20"
                    : "bg-[#F7FAFC] border border-[#E2E8F0]"
                }
              `}
              >
                <p className="text-sm text-[#1A2B3C] leading-relaxed">{item.message}</p>
                {item.insight && (
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[#E2E8F0]/50">
                    <span className="text-xs text-[#667EEA] font-medium">{item.insight}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 mt-2 opacity-50">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs text-[#2D3748]">{item.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
