"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, User, TrendingUp, Activity, DollarSign } from "lucide-react"
import { getUsersList, UserProfile } from "@/lib/api"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserSelectionProps {
  onUserSelect: (user: UserProfile) => void
  selectedUserId?: number
  className?: string
}

export function UserSelection({ onUserSelect, selectedUserId, className }: UserSelectionProps) {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const userList = await getUsersList()
      setUsers(userList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getPersonalityColor = (personality: string) => {
    switch (personality.toLowerCase()) {
      case 'impulsive': return 'bg-red-100 text-red-800'
      case 'planned': return 'bg-green-100 text-green-800'
      case 'stress-driven': return 'bg-orange-100 text-orange-800'
      case 'social': return 'bg-blue-100 text-blue-800'
      case 'conservative': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStressLevel = (baseline: number) => {
    if (baseline <= 3) return { level: 'Low', color: 'text-green-600' }
    if (baseline <= 6) return { level: 'Medium', color: 'text-yellow-600' }
    return { level: 'High', color: 'text-red-600' }
  }

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Select User Profile
          </CardTitle>
          <CardDescription>
            Choose a user to view their financial data and insights
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading users...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <User className="h-5 w-5" />
            Error Loading Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchUsers} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Select User Profile
        </CardTitle>
        <CardDescription>
          Top {users.length} users with rich financial data - Select one to view their insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {users.map((user, index) => {
            const stressInfo = getStressLevel(user.stress_baseline)
            const isSelected = selectedUserId === user.id
            
            return (
              <Card 
                key={user.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  isSelected && "ring-2 ring-primary border-primary/50"
                )}
                onClick={() => onUserSelect(user)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* User Avatar and Basic Info */}
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-sm font-medium">
                          {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{user.full_name}</h3>
                          {index < 3 && (
                            <Badge variant="secondary" className="text-xs">
                              Top {index + 1}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{user.profession} • {user.location}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={getPersonalityColor(user.spending_personality)}>
                            {user.spending_personality}
                          </Badge>
                          <span className={cn("text-sm font-medium", stressInfo.color)}>
                            {stressInfo.level} Stress
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center gap-1 text-green-600">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-sm font-medium">Income</span>
                        </div>
                        <p className="text-lg font-bold">{formatCurrency(user.income_monthly)}</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-blue-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm font-medium">Savings</span>
                        </div>
                        <p className="text-lg font-bold">{formatCurrency(user.savings_current)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Data Statistics */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Data Richness</span>
                      <span className="text-sm font-bold text-primary">
                        {Math.round(user.data_stats.data_richness)}%
                      </span>
                    </div>
                    <Progress value={user.data_stats.data_richness} className="h-2 mb-3" />
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center gap-1 text-purple-600">
                          <Activity className="h-3 w-3" />
                          <span className="text-xs">Biometrics</span>
                        </div>
                        <p className="text-sm font-bold">{user.data_stats.biometric_readings}</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-blue-600">
                          <DollarSign className="h-3 w-3" />
                          <span className="text-xs">Transactions</span>
                        </div>
                        <p className="text-sm font-bold">{user.data_stats.transactions}</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-orange-600">
                          <TrendingUp className="h-3 w-3" />
                          <span className="text-xs">Interventions</span>
                        </div>
                        <p className="text-sm font-bold">{user.data_stats.interventions}</p>
                      </div>
                    </div>

                    {user.data_stats.total_spending > 0 && (
                      <div className="mt-3 pt-3 border-t text-center">
                        <span className="text-xs text-gray-600">Total Spending: </span>
                        <span className="text-sm font-bold text-red-600">
                          {formatCurrency(user.data_stats.total_spending)}
                        </span>
                      </div>
                    )}
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t">
                      <Badge variant="default" className="w-full justify-center">
                        Selected Profile
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {users.length === 0 && (
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No users found with sufficient data</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default UserSelection