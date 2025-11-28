"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { StabilityScoreCard } from "@/components/dashboard/stability-score-card"
import { PhysiologicalCorrelation } from "@/components/dashboard/physiological-correlation"
import { QuickStatsBar } from "@/components/dashboard/quick-stats-bar"
import { InterventionPanel } from "@/components/dashboard/intervention-panel"
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart"

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#1A2B3C]">Financial Health Dashboard</h1>
          <p className="text-[#2D3748]/70 mt-1">Your physiological financial intelligence at a glance</p>
        </div>

        {/* Quick Stats Bar */}
        <QuickStatsBar />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Score & Correlation */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StabilityScoreCard />
              <PhysiologicalCorrelation />
            </div>
            <IncomeExpenseChart />
          </div>

          {/* Right Column - Interventions */}
          <div className="lg:col-span-1">
            <InterventionPanel />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
