"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { FileCode, Settings } from "lucide-react"

export function SmartContractControls() {
  const [autoLock, setAutoLock] = useState(true)
  const [incomeThreshold, setIncomeThreshold] = useState([5000])
  const [lockPercentage, setLockPercentage] = useState([5])

  return (
    <Card className="border-[#E2E8F0]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#1A2B3C] flex items-center gap-2">
            <FileCode className="w-5 h-5 text-[#667EEA]" />
            Contract Logic
          </CardTitle>
          <Badge variant="outline" className="text-[#667EEA] border-[#667EEA]/50 text-xs">
            <Settings className="w-3 h-3 mr-1" />
            Editable
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto-Lock Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#1A2B3C]">Auto-Lock Enabled</p>
            <p className="text-xs text-[#2D3748]/70">Automatically lock funds on income</p>
          </div>
          <Switch checked={autoLock} onCheckedChange={setAutoLock} className="data-[state=checked]:bg-[#00D4AA]" />
        </div>

        {/* Contract Logic Display */}
        <div className="p-4 rounded-lg bg-[#1A2B3C] text-white font-mono text-sm">
          <p className="text-[#00D4AA] mb-2">// Smart Contract Logic</p>
          <p>
            <span className="text-[#ED8936]">if</span> (monthlyIncome <span className="text-[#667EEA]">{">"}</span>{" "}
            <span className="text-[#48BB78]">${incomeThreshold[0].toLocaleString()}</span>) {"{"}
          </p>
          <p className="pl-4">
            <span className="text-[#ED8936]">autoLock</span>(
            <span className="text-[#48BB78]">{lockPercentage[0]}%</span> USDC);
          </p>
          <p>{"}"}</p>
        </div>

        {/* Income Threshold */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[#2D3748]">Income Threshold</label>
            <span className="text-sm font-mono font-bold text-[#1A2B3C]">${incomeThreshold[0].toLocaleString()}</span>
          </div>
          <Slider
            value={incomeThreshold}
            onValueChange={setIncomeThreshold}
            min={1000}
            max={10000}
            step={500}
            className="[&_[role=slider]]:bg-[#667EEA]"
          />
        </div>

        {/* Lock Percentage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[#2D3748]">Lock Percentage</label>
            <span className="text-sm font-mono font-bold text-[#1A2B3C]">{lockPercentage[0]}%</span>
          </div>
          <Slider
            value={lockPercentage}
            onValueChange={setLockPercentage}
            min={1}
            max={20}
            step={1}
            className="[&_[role=slider]]:bg-[#00D4AA]"
          />
        </div>
      </CardContent>
    </Card>
  )
}
