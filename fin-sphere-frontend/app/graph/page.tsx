"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { KnowledgeGraph } from "@/components/graph/knowledge-graph"
import { PatternRecognition } from "@/components/graph/pattern-recognition"
import { NodeDetail } from "@/components/graph/node-detail"
import { useState } from "react"

export type GraphNode = {
  id: string
  label: string
  type: "event" | "state" | "action"
  data?: {
    timestamp?: string
    source?: string
    value?: string
    details?: string
  }
}

export default function GraphPage() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#1A2B3C]">Causal Graph - The Brain</h1>
          <p className="text-[#2D3748]/70 mt-1">Visualize the connections between your events, states, and actions</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Knowledge Graph */}
          <div className="lg:col-span-2">
            <KnowledgeGraph onNodeSelect={setSelectedNode} selectedNode={selectedNode} />
          </div>

          {/* Node Detail Panel */}
          <div className="lg:col-span-1">
            <NodeDetail node={selectedNode} />
          </div>
        </div>

        {/* Pattern Recognition */}
        <PatternRecognition />
      </div>
    </MainLayout>
  )
}
