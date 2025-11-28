"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Network, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import type { GraphNode } from "@/app/graph/page"

interface KnowledgeGraphProps {
  onNodeSelect: (node: GraphNode | null) => void
  selectedNode: GraphNode | null
}

const nodes: GraphNode[] = [
  {
    id: "1",
    label: "Rude Email",
    type: "event",
    data: { timestamp: "2:34 PM", source: "Gmail", details: "Client feedback was harsh and dismissive" },
  },
  {
    id: "2",
    label: "High Cortisol",
    type: "state",
    data: {
      timestamp: "2:36 PM",
      source: "Apple Watch",
      value: "23.5 μg/dL",
      details: "Cortisol spike detected via HRV analysis",
    },
  },
  {
    id: "3",
    label: "Buy Video Game",
    type: "action",
    data: {
      timestamp: "2:52 PM",
      source: "Steam",
      value: "$59.99",
      details: "Impulse purchase during elevated stress",
    },
  },
  {
    id: "4",
    label: "Poor Sleep",
    type: "event",
    data: {
      timestamp: "Previous night",
      source: "Apple Watch",
      value: "4.2 hours",
      details: "Sleep quality score: 42/100",
    },
  },
  {
    id: "5",
    label: "Low HRV",
    type: "state",
    data: {
      timestamp: "Morning",
      source: "Apple Watch",
      value: "28ms",
      details: "Significantly below baseline of 45ms",
    },
  },
  {
    id: "6",
    label: "Underprice Proposal",
    type: "action",
    data: { timestamp: "10:15 AM", source: "Upwork", value: "-15%", details: "Bid $170 instead of target $200" },
  },
  {
    id: "7",
    label: "Meeting Stress",
    type: "event",
    data: { timestamp: "11:00 AM", source: "Calendar", details: "3 back-to-back client calls" },
  },
  {
    id: "8",
    label: "Elevated HR",
    type: "state",
    data: {
      timestamp: "11:45 AM",
      source: "Apple Watch",
      value: "98 bpm",
      details: "Sustained elevation for 45 minutes",
    },
  },
  {
    id: "9",
    label: "Skip Lunch",
    type: "action",
    data: { timestamp: "1:00 PM", source: "Pattern Detection", details: "No food intake tracked" },
  },
]

const connections = [
  { from: "1", to: "2" },
  { from: "2", to: "3" },
  { from: "4", to: "5" },
  { from: "5", to: "6" },
  { from: "7", to: "8" },
  { from: "8", to: "9" },
  { from: "4", to: "8" },
]

const nodeColors = {
  event: { bg: "#ED8936", text: "#FFFFFF" },
  state: { bg: "#FF4D4D", text: "#FFFFFF" },
  action: { bg: "#667EEA", text: "#FFFFFF" },
}

const nodePositions: Record<string, { x: number; y: number }> = {
  "1": { x: 80, y: 60 },
  "2": { x: 220, y: 120 },
  "3": { x: 360, y: 60 },
  "4": { x: 80, y: 200 },
  "5": { x: 220, y: 260 },
  "6": { x: 360, y: 200 },
  "7": { x: 80, y: 340 },
  "8": { x: 220, y: 400 },
  "9": { x: 360, y: 340 },
}

export function KnowledgeGraph({ onNodeSelect, selectedNode }: KnowledgeGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const svgRef = useRef<SVGSVGElement>(null)

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2))
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5))
  const handleReset = () => setScale(1)

  return (
    <Card className="border-[#E2E8F0]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#1A2B3C] flex items-center gap-2">
            <Network className="w-5 h-5 text-[#667EEA]" />
            Knowledge Graph Visualization
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={handleReset}>
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ED8936]" />
            <span className="text-xs text-[#2D3748]">Event</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF4D4D]" />
            <span className="text-xs text-[#2D3748]">State</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#667EEA]" />
            <span className="text-xs text-[#2D3748]">Action</span>
          </div>
        </div>

        {/* Graph SVG */}
        <div className="relative h-[460px] bg-[#F7FAFC] rounded-xl border border-[#E2E8F0] overflow-hidden">
          <svg
            ref={svgRef}
            className="w-full h-full"
            style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
          >
            {/* Connections */}
            {connections.map((conn, i) => {
              const from = nodePositions[conn.from]
              const to = nodePositions[conn.to]
              const isHighlighted =
                hoveredNode === conn.from ||
                hoveredNode === conn.to ||
                selectedNode?.id === conn.from ||
                selectedNode?.id === conn.to
              return (
                <line
                  key={i}
                  x1={from.x + 45}
                  y1={from.y + 20}
                  x2={to.x + 45}
                  y2={to.y + 20}
                  stroke={isHighlighted ? "#00D4AA" : "#CBD5E0"}
                  strokeWidth={isHighlighted ? 3 : 2}
                  strokeDasharray={isHighlighted ? "0" : "5,5"}
                  className="transition-all duration-300"
                />
              )
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const pos = nodePositions[node.id]
              const colors = nodeColors[node.type]
              const isHovered = hoveredNode === node.id
              const isSelected = selectedNode?.id === node.id

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => onNodeSelect(node)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Glow effect for selected/hovered */}
                  {(isHovered || isSelected) && (
                    <ellipse cx="45" cy="20" rx="55" ry="30" fill={colors.bg} opacity="0.2" className="animate-pulse" />
                  )}
                  {/* Node background */}
                  <rect
                    x="0"
                    y="0"
                    width="90"
                    height="40"
                    rx="20"
                    fill={colors.bg}
                    className={`transition-all duration-200 ${isHovered || isSelected ? "opacity-100" : "opacity-90"}`}
                    style={{
                      filter: isHovered || isSelected ? "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" : "none",
                      transform: isHovered || isSelected ? "scale(1.05)" : "scale(1)",
                      transformOrigin: "center",
                    }}
                  />
                  {/* Node text */}
                  <text
                    x="45"
                    y="25"
                    textAnchor="middle"
                    fill={colors.text}
                    fontSize="11"
                    fontWeight="500"
                    className="select-none"
                  >
                    {node.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}
