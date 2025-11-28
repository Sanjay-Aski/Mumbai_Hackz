"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Globe, Plus, X, Check } from "lucide-react"

const initialSites = [
  { id: 1, domain: "amazon.com", status: "active" },
  { id: 2, domain: "upwork.com", status: "active" },
  { id: 3, domain: "coinbase.com", status: "active" },
  { id: 4, domain: "steam.com", status: "active" },
  { id: 5, domain: "fiverr.com", status: "paused" },
]

export function SiteWhitelist() {
  const [sites, setSites] = useState(initialSites)
  const [newSite, setNewSite] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const addSite = () => {
    if (newSite.trim()) {
      setSites((prev) => [...prev, { id: Date.now(), domain: newSite.trim(), status: "active" }])
      setNewSite("")
      setIsAdding(false)
    }
  }

  const removeSite = (id: number) => {
    setSites((prev) => prev.filter((s) => s.id !== id))
  }

  const toggleSite = (id: number) => {
    setSites((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === "active" ? "paused" : "active" } : s)),
    )
  }

  return (
    <Card className="border-[#E2E8F0]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#1A2B3C] flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#667EEA]" />
            Site Whitelist
          </CardTitle>
          <Badge variant="outline" className="text-[#2D3748] border-[#E2E8F0] text-xs">
            {sites.filter((s) => s.status === "active").length} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Site */}
        {isAdding ? (
          <div className="flex gap-2">
            <Input
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
              placeholder="Enter domain (e.g., shopify.com)"
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && addSite()}
            />
            <Button size="icon" onClick={addSite} className="bg-[#00D4AA] hover:bg-[#00D4AA]/90">
              <Check className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="outline" onClick={() => setIsAdding(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full border-dashed gap-2 bg-transparent"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-4 h-4" />
            Add Site to Monitor
          </Button>
        )}

        {/* Site List */}
        <div className="space-y-2">
          {sites.map((site) => (
            <div
              key={site.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                site.status === "active" ? "bg-[#F7FAFC] border-[#E2E8F0]" : "bg-[#F7FAFC]/50 border-[#E2E8F0]/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${site.status === "active" ? "bg-[#48BB78]" : "bg-[#2D3748]/30"}`}
                />
                <span className={`text-sm ${site.status === "active" ? "text-[#1A2B3C]" : "text-[#2D3748]/50"}`}>
                  {site.domain}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => toggleSite(site.id)}>
                  {site.status === "active" ? "Pause" : "Resume"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#FF4D4D] hover:bg-[#FF4D4D]/10"
                  onClick={() => removeSite(site.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
