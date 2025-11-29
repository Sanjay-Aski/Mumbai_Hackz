"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  PieChart, 
  Activity, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Brain,
  Heart
} from "lucide-react"
import { 
  UserProfile, 
  FinancialGoal, 
  BudgetCategory, 
  BehavioralPattern, 
  SpendingInsight,
  RecentTransaction,
  RecentIntervention,
  getUserFinancialGoals,
  getUserBudgetCategories,
  getUserBehavioralInsights,
  getUserRecentActivity
} from "@/lib/api"

interface UserDashboardProps {
  user: UserProfile
  className?: string
}

export function UserDashboard({ user, className }: UserDashboardProps) {
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([])
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([])
  const [behavioralPatterns, setBehavioralPatterns] = useState<BehavioralPattern[]>([])
  const [spendingInsights, setSpendingInsights] = useState<SpendingInsight[]>([])
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [recentInterventions, setRecentInterventions] = useState<RecentIntervention[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserData()
  }, [user.id])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [goalsData, budgetData, behaviorData, activityData] = await Promise.all([
        getUserFinancialGoals(user.id),
        getUserBudgetCategories(user.id),
        getUserBehavioralInsights(user.id),
        getUserRecentActivity(user.id, 10)
      ])

      setFinancialGoals(goalsData.goals)
      setBudgetCategories(budgetData.budget_categories)
      setBehavioralPatterns(behaviorData.behavioral_patterns)
      setSpendingInsights(behaviorData.spending_insights)
      setRecentTransactions(activityData.recent_transactions)
      setRecentInterventions(activityData.recent_interventions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data')
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getGoalStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'on_track': return 'text-green-600'
      case 'behind': return 'text-yellow-600'
      case 'at_risk': return 'text-red-600'
      case 'achieved': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getBudgetStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'over_budget': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStressColor = (level: number) => {
    if (level <= 3) return 'text-green-600'
    if (level <= 7) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading user dashboard...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchUserData} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* User Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{user.full_name}</CardTitle>
              <CardDescription className="text-base">
                {user.profession} • {user.location}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Monthly Income</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(user.income_monthly)}
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <Badge variant="secondary">{user.spending_personality}</Badge>
            <Badge variant="outline">
              <Heart className="h-3 w-3 mr-1" />
              Stress: {user.stress_baseline}/10
            </Badge>
            <Badge variant="outline">
              Savings: {formatCurrency(user.savings_current)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Budget Categories Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Budget Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {budgetCategories.slice(0, 5).map((category) => (
                  <div key={category.id} className={`p-4 rounded-lg border ${getBudgetStatusColor(category.status)}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{category.category_name}</span>
                      <span className="text-sm">{category.utilization_percentage}%</span>
                    </div>
                    <Progress value={category.utilization_percentage} className="mb-2" />
                    <div className="flex justify-between text-sm">
                      <span>Spent: {formatCurrency(category.actual_spending)}</span>
                      <span>Budget: {formatCurrency(category.monthly_limit)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {spendingInsights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">{insight.insight_text}</p>
                        <p className="text-xs text-blue-600 mt-1">{insight.action_suggested}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Financial Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {financialGoals.map((goal) => (
                  <Card key={goal.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{goal.goal_type}</h3>
                          <p className="text-sm text-gray-600">{goal.motivation_text}</p>
                        </div>
                        <Badge variant="outline" className={getGoalStatusColor(goal.status)}>
                          {goal.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{goal.progress_percentage}%</span>
                        </div>
                        <Progress value={goal.progress_percentage} />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Current: {formatCurrency(goal.current_amount)}</span>
                          <span>Target: {formatCurrency(goal.target_amount)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Monthly: {formatCurrency(goal.monthly_contribution)}</span>
                        <span>{goal.months_to_target} months to target</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Behavioral Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {behavioralPatterns.map((pattern) => (
                  <Card key={pattern.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold">{pattern.pattern_type}</h3>
                        <Badge variant="secondary">{pattern.pattern_strength}</Badge>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span>Confidence</span>
                          <span>{pattern.confidence_level}%</span>
                        </div>
                        <Progress value={pattern.confidence_level} />
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Triggers:</span>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {pattern.triggers.map((trigger, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {trigger}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Recommendations:</span>
                          <ul className="mt-1 space-y-1">
                            {pattern.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                                <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-start p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{transaction.merchant}</p>
                        <p className="text-xs text-gray-600">{transaction.category}</p>
                        <p className="text-xs text-gray-500">{formatDate(transaction.timestamp)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatCurrency(transaction.amount)}</p>
                        <p className={`text-xs ${getStressColor(transaction.stress_at_time)}`}>
                          Stress: {transaction.stress_at_time}/10
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Interventions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Recent Interventions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentInterventions.slice(0, 5).map((intervention) => (
                    <div key={intervention.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-sm">{intervention.website_category}</p>
                        <Badge variant="outline" className={
                          intervention.severity === 'high' ? 'text-red-600' :
                          intervention.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }>
                          {intervention.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{intervention.reason}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{formatDate(intervention.timestamp)}</span>
                        <span>{intervention.final_outcome}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default UserDashboard