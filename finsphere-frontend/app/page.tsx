"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { StabilityScoreCard } from "@/components/dashboard/stability-score-card"
import { PhysiologicalCorrelation } from "@/components/dashboard/physiological-correlation"
import { QuickStatsBar } from "@/components/dashboard/quick-stats-bar"
import { InterventionPanel } from "@/components/dashboard/intervention-panel"
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart"
import { useDashboardStats, useInterventions, useHealthCheck } from "@/hooks/use-api"
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null)
  
  // Load userId from localStorage on client side
  useEffect(() => {
    const storedUserId = localStorage.getItem("finsphere_user_id")
    if (!storedUserId) {
      const newUserId = `user_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("finsphere_user_id", newUserId)
      setUserId(newUserId)
    } else {
      setUserId(storedUserId)
    }
  }, [])

  // Fetch data
  const { data: dashboardData, loading: dashLoading, error: dashError } = useDashboardStats(userId || "")
  const { data: interventions, loading: intLoading, error: intError } = useInterventions(userId || "")
  const { status: apiStatus } = useHealthCheck()

  if (!userId) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-[#00D4AA]" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#1A2B3C]">Financial Health Dashboard</h1>
          <p className="text-[#2D3748]/70 mt-1">Your physiological financial intelligence at a glance</p>
          {apiStatus === "unhealthy" && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Backend API is currently unavailable. Some features may not work properly.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Error Messages */}
        {dashError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{dashError}</AlertDescription>
          </Alert>
        )}

        {intError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Failed to load interventions: {intError}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {(dashLoading || intLoading) ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#00D4AA] mx-auto mb-2" />
              <p className="text-[#2D3748]">Loading your financial health data...</p>
            </div>
          </div>
        ) : dashboardData ? (
          <>
            {/* Quick Stats Bar */}
            <QuickStatsBar data={dashboardData} />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Score & Correlation */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StabilityScoreCard data={dashboardData} />
                  <PhysiologicalCorrelation data={dashboardData} />
                </div>
                <IncomeExpenseChart />
              </div>

              {/* Right Column - Interventions */}
              <div className="lg:col-span-1">
                <InterventionPanel interventions={interventions} />
              </div>
            </div>
          </>
        ) : (
          <Alert>
            <AlertDescription>No data available. Please ensure the backend is running.</AlertDescription>
          </Alert>
        )}
      </div>
    </MainLayout>
  )
}
