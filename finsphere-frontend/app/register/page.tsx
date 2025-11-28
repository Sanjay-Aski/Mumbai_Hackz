'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  full_name: string
  age: number | ''
  profession: string
  location: string
  income_monthly: number | ''
  savings_target: number | ''
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    age: '',
    profession: '',
    location: '',
    income_monthly: '',
    savings_target: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        age: formData.age || null,
        profession: formData.profession || null,
        location: formData.location || null,
        income_monthly: formData.income_monthly || null,
        savings_target: formData.savings_target || null
      }

      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Registration failed')
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
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">FinSphere</h1>
          <p className="text-gray-600 mt-2">Create Your Account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Create your account to start your financial wellness journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
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
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="At least 6 characters"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : '' }))}
                      placeholder="25"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profession">Profession</Label>
                    <Input
                      id="profession"
                      type="text"
                      value={formData.profession}
                      onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                      placeholder="Software Engineer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Mumbai, Maharashtra"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="income_monthly">Monthly Income (₹)</Label>
                    <Input
                      id="income_monthly"
                      type="number"
                      value={formData.income_monthly}
                      onChange={(e) => setFormData(prev => ({ ...prev, income_monthly: e.target.value ? parseFloat(e.target.value) : '' }))}
                      placeholder="50000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="savings_target">Savings Target (₹)</Label>
                    <Input
                      id="savings_target"
                      type="number"
                      value={formData.savings_target}
                      onChange={(e) => setFormData(prev => ({ ...prev, savings_target: e.target.value ? parseFloat(e.target.value) : '' }))}
                      placeholder="15000"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-blue-600 hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}