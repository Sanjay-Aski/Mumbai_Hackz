/**
 * Custom React Hooks for FinSphere Frontend
 * Handle data fetching and state management for API calls
 */

"use client"

import { useEffect, useState, useCallback } from "react"
import * as api from "@/lib/api"

// Hook for fetching dashboard stats
export function useDashboardStats(userId: string) {
  const [data, setData] = useState<api.DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await api.getDashboardStats(userId)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch dashboard stats")
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchData()
      // Refetch every 30 seconds
      const interval = setInterval(fetchData, 30000)
      return () => clearInterval(interval)
    }
  }, [userId, fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Hook for fetching interventions
export function useInterventions(userId: string, limit: number = 10) {
  const [data, setData] = useState<api.InterventionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await api.getInterventions(userId, limit)
      setData(result.interventions)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch interventions")
    } finally {
      setLoading(false)
    }
  }, [userId, limit])

  useEffect(() => {
    if (userId) {
      fetchData()
      // Refetch every 60 seconds
      const interval = setInterval(fetchData, 60000)
      return () => clearInterval(interval)
    }
  }, [userId, fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Hook for checking intervention need
export function useCheckIntervention(userId: string, contextUrl?: string, enabled: boolean = false) {
  const [data, setData] = useState<api.InterventionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = useCallback(async (url?: string, activity: string = "browsing") => {
    try {
      setLoading(true)
      setError(null)
      const result = await api.checkIntervention({
        user_id: userId,
        context_url: url || contextUrl,
        current_activity: activity,
      })
      setData(result)
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to check intervention"
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [userId, contextUrl])

  return { data, loading, error, check }
}

// Hook for logging interventions
export function useLogIntervention() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const log = useCallback(async (intervention: {
    user_id: string
    url: string
    reason: string
    severity: "low" | "medium" | "high"
  }) => {
    try {
      setLoading(true)
      setError(null)
      const result = await api.logIntervention(intervention)
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to log intervention"
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { log, loading, error }
}

// Hook for therapy chat
export function useTherapyChat(userId: string) {
  type Message = { role: "user" | "assistant"; content: string }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])

  const sendMessage = useCallback(async (message: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Add user message
      setMessages((prev: Message[]) => [...prev, { role: "user", content: message }])
      
      // Get response
      const response = await api.therapyChat({
        user_id: userId,
        message,
      })
      
      // Add assistant response
      setMessages((prev: Message[]) => [...prev, { role: "assistant", content: response.response_text }])
      
      return response
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to send message"
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [userId])

  return { messages, sendMessage, loading, error }
}

// Hook for ingesting biometrics
export function useBiometrics() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ingest = useCallback(async (data: api.BiometricData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await api.ingestBiometrics(data)
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to ingest biometrics"
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { ingest, loading, error }
}

// Hook for ingesting transactions
export function useTransaction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ingest = useCallback(async (txn: api.TransactionInput) => {
    try {
      setLoading(true)
      setError(null)
      const result = await api.ingestTransaction(txn)
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to ingest transaction"
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { ingest, loading, error }
}

// Hook for checking API health
export function useHealthCheck() {
  const [status, setStatus] = useState<"healthy" | "unhealthy" | "unknown">("unknown")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      try {
        await api.healthCheck()
        setStatus("healthy")
      } catch {
        setStatus("unhealthy")
      } finally {
        setLoading(false)
      }
    }
    
    check()
    // Check every 60 seconds
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [])

  return { status, loading }
}
