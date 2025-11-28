"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Activity, Cloud, Heart } from "lucide-react"

export function Footer() {
  const [heartRate, setHeartRate] = useState(72)
  const [hrv, setHrv] = useState(45)
  const [status, setStatus] = useState<"Relaxed" | "Alert" | "Stressed">("Relaxed")

  // Simulate biometric data changes
  useEffect(() => {
    const interval = setInterval(() => {
      const newHR = 68 + Math.floor(Math.random() * 15)
      const newHRV = 40 + Math.floor(Math.random() * 20)
      setHeartRate(newHR)
      setHrv(newHRV)

      if (newHR > 90) setStatus("Stressed")
      else if (newHR > 80) setStatus("Alert")
      else setStatus("Relaxed")
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const statusColors = {
    Relaxed: "text-[#48BB78]",
    Alert: "text-[#ED8936]",
    Stressed: "text-[#FF4D4D]",
  }

  return (
    <footer className="h-12 bg-[#F7FAFC] border-t border-[#E2E8F0] px-6 flex items-center justify-between text-sm">
      {/* Left - Extension Status */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#48BB78] animate-pulse" />
        <span className="text-[#2D3748] hidden sm:inline">Extension Active:</span>
        <span className="text-[#2D3748]/70 text-xs">Monitoring Upwork & Amazon</span>
      </div>

      {/* Center - Live Biometrics */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-[#FF4D4D] animate-heartbeat" />
          <span className="font-mono text-[#1A2B3C] font-medium">{heartRate}</span>
          <span className="text-[#2D3748]/70 text-xs">bpm</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#667EEA]" />
          <span className="font-mono text-[#1A2B3C] font-medium">{hrv}</span>
          <span className="text-[#2D3748]/70 text-xs">ms HRV</span>
        </div>
        <Badge variant="outline" className={`${statusColors[status]} border-current text-xs`}>
          {status}
        </Badge>
      </div>

      {/* Right - System Status */}
      <div className="flex items-center gap-2">
        <Cloud className="w-4 h-4 text-[#00D4AA]" />
        <span className="text-[#2D3748] hidden sm:inline">AI Coach:</span>
        <span className="text-[#48BB78] font-medium text-xs">Online</span>
      </div>
    </footer>
  )
}
