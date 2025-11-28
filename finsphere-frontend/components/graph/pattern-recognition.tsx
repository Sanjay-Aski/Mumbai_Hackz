"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingDown, Moon, Clock, AlertTriangle, Lightbulb } from "lucide-react"

const patterns = [
  {
    id: 1,
    icon: Moon,
    title: "Sleep-Pricing Correlation",
    description: "You underprice projects by 15% when you sleep less than 5 hours",
    confidence: 94,
    impact: "high",
    recommendation: "Set a proposal review delay when sleep < 6 hours",
  },
  {
    id: 2,
    icon: Clock,
    title: "Afternoon Spending Spike",
    description: "78% of impulse purchases occur between 2-4 PM during high stress periods",
    confidence: 87,
    impact: "medium",
    recommendation: "Enable Browser Guard during this time window",
  },
  {
    id: 3,
    icon: TrendingDown,
    title: "Meeting Recovery Pattern",
    description: "Your HRV takes 2+ hours to recover after 3+ consecutive meetings",
    confidence: 91,
    impact: "medium",
    recommendation: "Schedule 30-min breaks between meeting clusters",
  },
  {
    id: 4,
    icon: AlertTriangle,
    title: "Email Trigger Detection",
    description: "Critical emails from 2 specific clients trigger 3x cortisol response",
    confidence: 82,
    impact: "high",
    recommendation: "Route these emails to a delayed inbox",
  },
]

const impactColors = {
  high: { text: "text-[#FF4D4D]", bg: "bg-[#FF4D4D]/10", border: "border-[#FF4D4D]/30" },
  medium: { text: "text-[#ED8936]", bg: "bg-[#ED8936]/10", border: "border-[#ED8936]/30" },
  low: { text: "text-[#48BB78]", bg: "bg-[#48BB78]/10", border: "border-[#48BB78]/30" },
}

export function PatternRecognition() {
  return (
    <Card className="border-[#E2E8F0]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#1A2B3C] flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#667EEA]" />
            Pattern Recognition Insights
          </CardTitle>
          <Badge variant="outline" className="text-[#667EEA] border-[#667EEA]/50 text-xs">
            4 patterns detected
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map((pattern) => {
            const impact = impactColors[pattern.impact as keyof typeof impactColors]
            return (
              <div key={pattern.id} className={`p-4 rounded-lg border ${impact.border} ${impact.bg} card-hover`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-white ${impact.text}`}>
                    <pattern.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-[#1A2B3C] truncate">{pattern.title}</h4>
                      <Badge variant="outline" className={`${impact.text} border-current text-xs flex-shrink-0`}>
                        {pattern.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-xs text-[#2D3748]/70 leading-relaxed mb-3">{pattern.description}</p>
                    <div className="flex items-start gap-2 p-2 rounded bg-white/50">
                      <Lightbulb className="w-3 h-3 text-[#00D4AA] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-[#1A2B3C]">{pattern.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
