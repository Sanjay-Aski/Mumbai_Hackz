"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sparkles, Calendar, TrendingDown, Mail, AlertTriangle } from "lucide-react"

export function ScenarioPlanner() {
  const [query, setQuery] = useState("What if I take 2 months off?")
  const [monthsOff, setMonthsOff] = useState([2])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  const currentSavings = 8500
  const monthlyBurn = 2600
  const savingsAfter = Math.max(0, currentSavings - monthsOff[0] * monthlyBurn)
  const tankPercentage = (savingsAfter / currentSavings) * 100

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setShowDashboard(true)
    }, 1500)
  }

  useEffect(() => {
    if (showDashboard) {
      // Reset animation when values change
    }
  }, [monthsOff, showDashboard])

  return (
    <Card className="border-[#E2E8F0]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#1A2B3C] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#667EEA]" />
            Generative Scenario Planner
          </CardTitle>
          <Badge variant="outline" className="text-[#667EEA] border-[#667EEA]/50 text-xs">
            AI-Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Query Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[#2D3748]">Ask a scenario:</label>
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What if I take 2 months off?"
              className="flex-1 border-[#E2E8F0]"
            />
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-[#667EEA] hover:bg-[#667EEA]/90 text-white"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                "Generate"
              )}
            </Button>
          </div>
        </div>

        {/* Generated Dashboard */}
        {showDashboard && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sabbatical Dashboard Header */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-[#667EEA]/10 to-[#00D4AA]/10 border border-[#667EEA]/20">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#667EEA]" />
                <span className="text-sm font-medium text-[#1A2B3C]">Sabbatical Dashboard</span>
              </div>
            </div>

            {/* Months Off Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#2D3748]">Time Off Duration</label>
                <span className="text-sm font-bold text-[#667EEA]">{monthsOff[0]} months</span>
              </div>
              <Slider
                value={monthsOff}
                onValueChange={setMonthsOff}
                min={1}
                max={6}
                step={1}
                className="[&_[role=slider]]:bg-[#667EEA]"
              />
              <div className="flex justify-between text-xs text-[#2D3748]/50">
                <span>1 month</span>
                <span>6 months</span>
              </div>
            </div>

            {/* Savings Tank Visualization */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#2D3748]">Savings Tank</label>
              <div className="relative h-24 bg-[#F7FAFC] rounded-lg border border-[#E2E8F0] overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out"
                  style={{
                    height: `${tankPercentage}%`,
                    background:
                      tankPercentage > 30
                        ? "linear-gradient(to top, #00D4AA, #48BB78)"
                        : tankPercentage > 15
                          ? "linear-gradient(to top, #ED8936, #F6AD55)"
                          : "linear-gradient(to top, #FF4D4D, #FC8181)",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#1A2B3C]">${savingsAfter.toLocaleString()}</p>
                    <p className="text-xs text-[#2D3748]/70">remaining after {monthsOff[0]} months</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning/Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#F7FAFC] border border-[#E2E8F0]">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-[#ED8936]" />
                  <span className="text-xs font-medium text-[#2D3748]">Burn Rate</span>
                </div>
                <p className="text-lg font-bold text-[#1A2B3C]">${monthlyBurn.toLocaleString()}/mo</p>
              </div>
              <div className="p-3 rounded-lg bg-[#F7FAFC] border border-[#E2E8F0]">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className={`w-4 h-4 ${savingsAfter < 3000 ? "text-[#FF4D4D]" : "text-[#48BB78]"}`} />
                  <span className="text-xs font-medium text-[#2D3748]">Risk Level</span>
                </div>
                <p className={`text-lg font-bold ${savingsAfter < 3000 ? "text-[#FF4D4D]" : "text-[#48BB78]"}`}>
                  {savingsAfter < 3000 ? "High" : savingsAfter < 5000 ? "Medium" : "Low"}
                </p>
              </div>
            </div>

            {/* Contextual Action */}
            <Button
              variant="outline"
              className="w-full gap-2 border-[#667EEA] text-[#667EEA] hover:bg-[#667EEA]/10 bg-transparent"
            >
              <Mail className="w-4 h-4" />
              Generate Client Email Templates
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
