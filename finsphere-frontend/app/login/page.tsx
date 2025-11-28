'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface LoginFormData {
  email: string
  password: string
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Login failed')
      }

      const data = await response.json()
      
      // Store token and user info
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify({
        id: data.user_id,
        email: data.email,
        full_name: data.full_name
      }))

      // Redirect to dashboard
      router.push('/')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (email: string, password: string) => {
    setFormData({ email, password })
    // Trigger form submission
    setTimeout(() => {
      const form = document.getElementById('login-form') as HTMLFormElement
      form?.requestSubmit()
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">FinSphere</h1>
          <p className="text-gray-600 mt-2">AI-Powered Financial Wellness</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your financial wellness dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Your password"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Demo Accounts (Click to Login)</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="bg-blue-50 p-2 rounded border border-blue-200 text-xs">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('rajesh.kumar@gmail.com', 'TechGuru@123')}
                    className="w-full text-left hover:bg-blue-100 p-2 rounded transition"
                  >
                    <div className="font-semibold">Rajesh Kumar Singh</div>
                    <div className="text-gray-600">Email: rajesh.kumar@gmail.com</div>
                    <div className="text-gray-600">Password: TechGuru@123</div>
                  </button>
                </div>

                <div className="bg-green-50 p-2 rounded border border-green-200 text-xs">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('priya.sharma@outlook.com', 'Creative@456')}
                    className="w-full text-left hover:bg-green-100 p-2 rounded transition"
                  >
                    <div className="font-semibold">Priya Sharma</div>
                    <div className="text-gray-600">Email: priya.sharma@outlook.com</div>
                    <div className="text-gray-600">Password: Creative@456</div>
                  </button>
                </div>

                <div className="bg-purple-50 p-2 rounded border border-purple-200 text-xs">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('amit.patel@yahoo.com', 'Marketing@789')}
                    className="w-full text-left hover:bg-purple-100 p-2 rounded transition"
                  >
                    <div className="font-semibold">Amit Patel</div>
                    <div className="text-gray-600">Email: amit.patel@yahoo.com</div>
                    <div className="text-gray-600">Password: Marketing@789</div>
                  </button>
                </div>

                <div className="bg-orange-50 p-2 rounded border border-orange-200 text-xs">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('sneha.reddy@gmail.com', 'FreshStart@101')}
                    className="w-full text-left hover:bg-orange-100 p-2 rounded transition"
                  >
                    <div className="font-semibold">Sneha Reddy</div>
                    <div className="text-gray-600">Email: sneha.reddy@gmail.com</div>
                    <div className="text-gray-600">Password: FreshStart@101</div>
                  </button>
                </div>

                <div className="bg-red-50 p-2 rounded border border-red-200 text-xs">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('karthik.varma@startup.com', 'Founder@999')}
                    className="w-full text-left hover:bg-red-100 p-2 rounded transition"
                  >
                    <div className="font-semibold">Karthik Varma</div>
                    <div className="text-gray-600">Email: karthik.varma@startup.com</div>
                    <div className="text-gray-600">Password: Founder@999</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => router.push('/register')}
                  className="text-blue-600 hover:underline"
                >
                  Sign up
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}