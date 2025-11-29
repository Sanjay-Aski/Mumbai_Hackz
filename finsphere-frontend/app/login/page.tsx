'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const response = await fetch('/api/v1/auth/login-bypass', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'rajesh.kumar@gmail.com' }),
        })
        const data = await response.json()
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify({
          id: data.user_id,
          email: data.email,
          full_name: data.full_name
        }))
        router.push('/')
      } catch (err) {
        router.push('/')
      }
    }
    autoLogin()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Redirecting...</p>
    </div>
  )
}