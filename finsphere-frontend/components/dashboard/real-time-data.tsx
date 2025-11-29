"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  Activity, 
  Heart, 
  Mail, 
  AlertCircle, 
  TrendingUp, 
  Zap,
  Play,
  Pause,
  RefreshCw
} from "lucide-react"
import { 
  BiometricStream, 
  EmailStream, 
  createBiometricStream, 
  createEmailStream,
  getRealtimeDashboard 
} from "@/lib/api"

interface RealTimeDataProps {
  userId: number
  className?: string
}

export function RealTimeData({ userId, className }: RealTimeDataProps) {
  const [currentBiometric, setCurrentBiometric] = useState<BiometricStream | null>(null)
  const [recentEmails, setRecentEmails] = useState<EmailStream[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')
  const [error, setError] = useState<string | null>(null)
  
  const biometricStreamRef = useRef<EventSource | null>(null)
  const emailStreamRef = useRef<EventSource | null>(null)

  useEffect(() => {
    // Initial data load
    loadInitialData()
    
    return () => {
      // Cleanup streams
      stopStreaming()
    }
  }, [userId])

  const loadInitialData = async () => {
    try {
      setError(null)
      const dashboardData = await getRealtimeDashboard(userId)
      setCurrentBiometric(dashboardData.current_biometric)
      setRecentEmails(dashboardData.recent_emails)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load initial data')
    }
  }

  const startStreaming = () => {
    if (isStreaming) return
    
    try {
      setConnectionStatus('connecting')
      setError(null)
      
      // Start biometric stream
      biometricStreamRef.current = createBiometricStream(userId)
      
      biometricStreamRef.current.onopen = () => {
        setConnectionStatus('connected')
        setIsStreaming(true)
      }
      
      biometricStreamRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as BiometricStream
          setCurrentBiometric(data)
        } catch (err) {
          console.error('Failed to parse biometric data:', err)
        }
      }
      
      biometricStreamRef.current.onerror = (error) => {
        console.error('Biometric stream error:', error)
        setConnectionStatus('disconnected')
        setError('Biometric stream connection failed')
      }

      // Start email stream
      emailStreamRef.current = createEmailStream(userId)
      
      emailStreamRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as EmailStream
          setRecentEmails(prev => [data, ...prev.slice(0, 9)]) // Keep latest 10
        } catch (err) {
          console.error('Failed to parse email data:', err)
        }
      }
      
      emailStreamRef.current.onerror = (error) => {
        console.error('Email stream error:', error)
      }

    } catch (err) {
      setError('Failed to start streaming')
      setConnectionStatus('disconnected')
    }
  }

  const stopStreaming = () => {
    if (biometricStreamRef.current) {
      biometricStreamRef.current.close()
      biometricStreamRef.current = null
    }
    
    if (emailStreamRef.current) {
      emailStreamRef.current.close()
      emailStreamRef.current = null
    }
    
    setIsStreaming(false)
    setConnectionStatus('disconnected')
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getStressColor = (level: number) => {
    if (level <= 3) return 'text-green-600'
    if (level <= 7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStressLevel = (level: number) => {
    if (level <= 3) return 'Low'
    if (level <= 7) return 'Medium'
    return 'High'
  }

  return (
    <div className={className}>
      {/* Stream Controls */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">Real-Time Data Stream</CardTitle>
              <CardDescription>Live biometric and email sentiment monitoring</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={connectionStatus === 'connected' ? 'default' : 'secondary'}
                className={connectionStatus === 'connected' ? 'bg-green-100 text-green-800' : ''}
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                  connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                  'bg-gray-400'
                }`} />
                {connectionStatus === 'connected' ? 'Live' : 
                 connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
              </Badge>
              
              {!isStreaming ? (
                <Button onClick={startStreaming} size="sm" className="gap-2">
                  <Play className="h-4 w-4" />
                  Start Stream
                </Button>
              ) : (
                <Button onClick={stopStreaming} variant="outline" size="sm" className="gap-2">
                  <Pause className="h-4 w-4" />
                  Stop Stream
                </Button>
              )}
              
              <Button onClick={loadInitialData} variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {error && (
          <CardContent className="pt-0">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Current Biometrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Live Biometrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentBiometric ? (
              <div className="space-y-4">
                {/* Heart Rate */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-red-500" />
                    <span className="font-medium">Heart Rate</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-red-500">
                      {currentBiometric.heart_rate}
                    </span>
                    <span className="text-sm text-gray-600 ml-1">BPM</span>
                  </div>
                </div>

                {/* HRV */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">HRV</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-500">
                      {currentBiometric.hrv_ms}
                    </span>
                    <span className="text-sm text-gray-600 ml-1">ms</span>
                  </div>
                </div>

                {/* Stress Level */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Stress Level</span>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${getStressColor(currentBiometric.stress_level)}`}>
                        {getStressLevel(currentBiometric.stress_level)}
                      </span>
                      <span className="text-sm text-gray-600 ml-2">
                        ({currentBiometric.stress_level}/10)
                      </span>
                    </div>
                  </div>
                  <Progress value={currentBiometric.stress_level * 10} className="h-2" />
                </div>

                {/* Recovery Score */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Recovery Score</span>
                    <span className="text-lg font-bold text-green-600">
                      {Math.round(currentBiometric.recovery_score)}%
                    </span>
                  </div>
                  <Progress value={currentBiometric.recovery_score} className="h-2" />
                </div>

                {/* Activity Level */}
                <div className="flex justify-between items-center">
                  <span className="font-medium">Activity Level</span>
                  <Badge variant={
                    currentBiometric.activity_level === 'high' ? 'default' :
                    currentBiometric.activity_level === 'moderate' ? 'secondary' : 'outline'
                  }>
                    {currentBiometric.activity_level}
                  </Badge>
                </div>

                {/* Timestamp */}
                <div className="pt-3 border-t text-xs text-gray-500">
                  Last updated: {formatTimestamp(currentBiometric.timestamp)}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No biometric data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Emails */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              Live Email Stream
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentEmails.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentEmails.map((email, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{email.subject}</p>
                        <p className="text-xs text-gray-600 truncate">{email.sender}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {email.stress_trigger && (
                          <Badge variant="destructive" className="text-xs">
                            Stress
                          </Badge>
                        )}
                        <Badge 
                          variant={email.priority === 'high' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {email.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                      {email.content_preview}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            email.sentiment_label === 'positive' ? 'text-green-600 border-green-200' :
                            email.sentiment_label === 'negative' ? 'text-red-600 border-red-200' :
                            'text-gray-600 border-gray-200'
                          }`}
                        >
                          {email.sentiment_label} ({email.sentiment_score.toFixed(2)})
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {email.category}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(email.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent emails</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RealTimeData