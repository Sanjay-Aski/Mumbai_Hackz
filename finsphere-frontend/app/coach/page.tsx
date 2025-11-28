"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { VoiceTherapyMode } from "@/components/coach/voice-therapy-mode"
import { ScenarioPlanner } from "@/components/coach/scenario-planner"
import { ChatHistory } from "@/components/coach/chat-history"

export default function CoachPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#1A2B3C]">AI Coach & Voice Therapy</h1>
          <p className="text-[#2D3748]/70 mt-1">
            Talk through your financial stress and explore scenarios with AI-powered guidance
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Voice Therapy Mode */}
          <VoiceTherapyMode />

          {/* Scenario Planner */}
          <ScenarioPlanner />
        </div>

        {/* Chat History */}
        <ChatHistory />
      </div>
    </MainLayout>
  )
}
