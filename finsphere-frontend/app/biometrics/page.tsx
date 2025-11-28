"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { BiometricOverview } from "@/components/biometrics/biometric-overview"
import { HeartRateChart } from "@/components/biometrics/heart-rate-chart"
import { HrvAnalysis } from "@/components/biometrics/hrv-analysis"
import { StressTimeline } from "@/components/biometrics/stress-timeline"
import { WearableStatus } from "@/components/biometrics/wearable-status"

export default function BiometricsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#1A2B3C]">Biometrics & Health</h1>
          <p className="text-[#2D3748]/70 mt-1">Real-time physiological data powering your financial decisions</p>
        </div>

        {/* Wearable Status */}
        <WearableStatus />

        {/* Overview Cards */}
        <BiometricOverview />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HeartRateChart />
          <HrvAnalysis />
        </div>

        {/* Stress Timeline */}
        <StressTimeline />
      </div>
    </MainLayout>
  )
}
