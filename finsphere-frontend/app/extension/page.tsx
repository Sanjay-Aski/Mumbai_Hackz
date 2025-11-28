"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { InterventionSensitivity } from "@/components/extension/intervention-sensitivity"
import { MonitoringToggles } from "@/components/extension/monitoring-toggles"
import { SiteWhitelist } from "@/components/extension/site-whitelist"
import { ExtensionStats } from "@/components/extension/extension-stats"
import { InterventionHistory } from "@/components/extension/intervention-history"

export default function ExtensionPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#1A2B3C]">Browser Extension Settings</h1>
          <p className="text-[#2D3748]/70 mt-1">Configure how FinSphere monitors and intervenes during your browsing</p>
        </div>

        {/* Extension Stats */}
        <ExtensionStats />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <InterventionSensitivity />
            <MonitoringToggles />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <SiteWhitelist />
            <InterventionHistory />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
