"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { IncomeBreakdown } from "@/components/income/income-breakdown"
import { FamineFundVault } from "@/components/income/famine-fund-vault"
import { SmartContractControls } from "@/components/income/smart-contract-controls"
import { RecentTransactions } from "@/components/income/recent-transactions"
import { IncomeForecast } from "@/components/income/income-forecast"

export default function IncomePage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#1A2B3C]">Income & Smart Contracts</h1>
          <p className="text-[#2D3748]/70 mt-1">
            Manage your income sources and automated savings with smart contracts
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Income */}
          <div className="lg:col-span-2 space-y-6">
            <IncomeBreakdown />
            <IncomeForecast />
          </div>

          {/* Right Column - Vault */}
          <div className="space-y-6">
            <FamineFundVault />
            <SmartContractControls />
          </div>
        </div>

        {/* Recent Transactions */}
        <RecentTransactions />
      </div>
    </MainLayout>
  )
}
