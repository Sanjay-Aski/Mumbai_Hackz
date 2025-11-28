"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Vault, Lock, Shield, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function FamineFundVault() {
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [step, setStep] = useState(1)

  const vaultBalance = 1200
  const vaultTarget = 3000
  const progress = (vaultBalance / vaultTarget) * 100

  return (
    <Card className="border-[#E2E8F0] overflow-hidden">
      <div className="h-2 teal-gradient" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#1A2B3C] flex items-center gap-2">
            <Vault className="w-5 h-5 text-[#00D4AA]" />
            Famine Fund Vault
          </CardTitle>
          <Badge className="bg-[#00D4AA]/20 text-[#00D4AA] text-xs">
            <Lock className="w-3 h-3 mr-1" />
            Smart Contract
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vault Visualization */}
        <div className="relative p-6 rounded-xl bg-gradient-to-br from-[#1A2B3C] to-[#2D3748] text-white text-center">
          <div className="absolute top-3 right-3">
            <Shield className="w-5 h-5 text-[#00D4AA]" />
          </div>
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#00D4AA]/20 flex items-center justify-center">
            <Vault className="w-8 h-8 text-[#00D4AA]" />
          </div>
          <p className="text-xs text-white/70 mb-1">Locked Balance</p>
          <p className="text-3xl font-bold font-mono">${vaultBalance.toLocaleString()}</p>
          <p className="text-xs text-white/50 mt-2">USDC on Ethereum</p>
        </div>

        {/* Progress to Target */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#2D3748]/70">Progress to Target</span>
            <span className="text-[#1A2B3C] font-medium">
              ${vaultBalance} / ${vaultTarget}
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-[#E2E8F0]" />
          <p className="text-xs text-[#2D3748]/50 text-center">{Math.round(progress)}% of 3-month runway secured</p>
        </div>

        {/* Emergency Withdraw */}
        <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-[#FF4D4D]/30 text-[#FF4D4D] hover:bg-[#FF4D4D]/10 bg-transparent"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Emergency Withdraw
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#FF4D4D]" />
                Emergency Withdrawal
              </DialogTitle>
              <DialogDescription>
                This will unlock your Famine Fund. This action requires 2-step verification.
              </DialogDescription>
            </DialogHeader>
            {step === 1 ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[#FF4D4D]/10 border border-[#FF4D4D]/20">
                  <p className="text-sm text-[#FF4D4D]">
                    Breaking your smart contract will reset your 30-day lock period.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Enter reason for withdrawal:</label>
                  <Input placeholder="e.g., Unexpected medical expense" />
                </div>
                <Button onClick={() => setStep(2)} className="w-full bg-[#FF4D4D] hover:bg-[#FF4D4D]/90">
                  Continue to Verification
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Enter 6-digit verification code:</label>
                  <Input placeholder="000000" className="text-center font-mono text-lg tracking-widest" />
                  <p className="text-xs text-[#2D3748]/50">Code sent to your email</p>
                </div>
                <Button
                  onClick={() => {
                    setShowWithdraw(false)
                    setStep(1)
                  }}
                  className="w-full bg-[#FF4D4D] hover:bg-[#FF4D4D]/90"
                >
                  Confirm Withdrawal
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
