"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

export function StabilityScoreCard() {
  const score = 78
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <Card className="card-hover border-[#E2E8F0]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-[#1A2B3C] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#00D4AA]" />
          Financial Stability Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle cx="64" cy="64" r="45" fill="none" stroke="#E2E8F0" strokeWidth="10" />
              {/* Progress circle */}
              <circle
                cx="64"
                cy="64"
                r="45"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00D4AA" />
                  <stop offset="100%" stopColor="#667EEA" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[#1A2B3C]">{score}</span>
              <span className="text-xs text-[#2D3748]/70">out of 100</span>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-[#2D3748]/70">
            Your score improved <span className="text-[#48BB78] font-medium">+5 points</span> this week
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
