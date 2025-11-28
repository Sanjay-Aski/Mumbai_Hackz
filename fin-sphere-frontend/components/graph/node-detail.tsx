"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, Clock, Database, Activity, AlertCircle, Network } from "lucide-react"
import type { GraphNode } from "@/app/graph/page"

interface NodeDetailProps {
  node: GraphNode | null
}

const typeLabels = {
  event: { label: "Event Trigger", color: "text-[#ED8936]", bg: "bg-[#ED8936]/10" },
  state: { label: "Physiological State", color: "text-[#FF4D4D]", bg: "bg-[#FF4D4D]/10" },
  action: { label: "Resulting Action", color: "text-[#667EEA]", bg: "bg-[#667EEA]/10" },
}

export function NodeDetail({ node }: NodeDetailProps) {
  const typeConfig = node ? typeLabels[node.type] : null

  return (
    <Card className="border-[#E2E8F0] h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-[#1A2B3C] flex items-center gap-2">
          <Info className="w-5 h-5 text-[#00D4AA]" />
          Node Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        {node ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Node Title */}
            <div className={`p-4 rounded-lg ${typeConfig?.bg}`}>
              <Badge variant="outline" className={`${typeConfig?.color} border-current text-xs mb-2`}>
                {typeConfig?.label}
              </Badge>
              <h3 className="text-lg font-semibold text-[#1A2B3C]">{node.label}</h3>
            </div>

            {/* Details */}
            <div className="space-y-3">
              {node.data?.timestamp && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F7FAFC]">
                  <Clock className="w-4 h-4 text-[#2D3748]/70 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#2D3748]/70 font-medium">Timestamp</p>
                    <p className="text-sm text-[#1A2B3C]">{node.data.timestamp}</p>
                  </div>
                </div>
              )}

              {node.data?.source && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F7FAFC]">
                  <Database className="w-4 h-4 text-[#2D3748]/70 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#2D3748]/70 font-medium">Data Source</p>
                    <p className="text-sm text-[#1A2B3C]">{node.data.source}</p>
                  </div>
                </div>
              )}

              {node.data?.value && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F7FAFC]">
                  <Activity className="w-4 h-4 text-[#2D3748]/70 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#2D3748]/70 font-medium">Value</p>
                    <p className="text-sm font-mono text-[#1A2B3C] font-medium">{node.data.value}</p>
                  </div>
                </div>
              )}

              {node.data?.details && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F7FAFC]">
                  <AlertCircle className="w-4 h-4 text-[#2D3748]/70 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#2D3748]/70 font-medium">Analysis</p>
                    <p className="text-sm text-[#1A2B3C] leading-relaxed">{node.data.details}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <div className="w-16 h-16 rounded-full bg-[#F7FAFC] flex items-center justify-center mb-4">
              <Network className="w-8 h-8 text-[#2D3748]/30" />
            </div>
            <p className="text-sm text-[#2D3748]/70">Click on a node in the graph to view its details</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
