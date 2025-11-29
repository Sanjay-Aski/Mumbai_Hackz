"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { StabilityScoreCard } from "@/components/dashboard/stability-score-card"
import { PhysiologicalCorrelation } from "@/components/dashboard/physiological-correlation"
import { QuickStatsBar } from "@/components/dashboard/quick-stats-bar"
import { InterventionPanel } from "@/components/dashboard/intervention-panel"
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart"
import { UserSelection } from "@/components/dashboard/user-selection"
import UserDashboard from "@/components/dashboard/user-dashboard"
import RealTimeData from "@/components/dashboard/real-time-data"
import { getDashboardStats, UserProfile } from "@/lib/api"
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/contexts/UserContext"

export default function DashboardPage() {
  return <DashboardContent />
}

function DashboardContent() {
  const { selectedUser, setSelectedUser } = useUser()
  const [showUserSelection, setShowUserSelection] = useState(!selectedUser)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Handle user selection
  const handleUserSelect = (user: UserProfile) => {
    setSelectedUser(user)
    setShowUserSelection(false)
  }

  // Go back to user selection
  const handleBackToSelection = () => {
    setSelectedUser(null)
    setShowUserSelection(true)
    setDashboardData(null)
    setError(null)
  }

  // Fetch dashboard data for selected user
  useEffect(() => {
    if (selectedUser && !showUserSelection) {
      const fetchDashboardData = async () => {
        try {
          setLoading(true)
          const data = await getDashboardStats(selectedUser.id)
          setDashboardData(data)
          setError(null)
        } catch (err) {
          console.error('Failed to fetch dashboard data:', err)
          setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
          // Use mock data on error
          setDashboardData({
            stress_level: "Medium",
            stress_score: 0.45,
            spending_risk: "Warning",
            cognitive_load: "Normal",
            savings_runway: "8.5 Mo",
            recent_interventions: []
          })
        } finally {
          setLoading(false)
        }
      }

      fetchDashboardData()
    }
  }, [selectedUser, showUserSelection])

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Show User Selection */}
        {showUserSelection && (
          <>
            <div>
              <h1 className="text-2xl font-bold text-[#1A2B3C]">FinSphere Dashboard</h1>
              <p className="text-[#2D3748]/70 mt-1">Select a user profile to view their comprehensive financial insights</p>
            </div>
            <UserSelection 
              onUserSelect={handleUserSelect}
              selectedUserId={selectedUser?.id}
            />
          </>
        )}

        {/* Show Selected User Dashboard */}
        {!showUserSelection && selectedUser && (
          <>
            {/* Header with Back Button */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#1A2B3C]">Financial Health Dashboard</h1>
                <p className="text-[#2D3748]/70 mt-1">Physiological financial intelligence for {selectedUser.full_name}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleBackToSelection}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Users
              </Button>
            </div>

            {/* Error Messages */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#00D4AA] mx-auto" />
                  <p className="mt-2 text-gray-600">Loading {selectedUser.full_name}'s dashboard...</p>
                </div>
              </div>
            )}

            {/* Dashboard Content */}
            {!loading && dashboardData && (
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
                    <InterventionPanel interventions={dashboardData.recent_interventions || []} />
                  </div>
                </div>

                {/* Real-Time Data Stream */}
                <RealTimeData userId={selectedUser.id} className="mt-8" />

                {/* User Detailed Dashboard */}
                <UserDashboard user={selectedUser} className="mt-8" />
              </>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}
