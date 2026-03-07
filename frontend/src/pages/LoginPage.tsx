import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { InputField } from '../components/InputField'
import { signIn, resendConfirmationEmail } from '../services/auth'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showResendEmail, setShowResendEmail] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden md:flex flex-1 items-center justify-center px-12 relative overflow-hidden bg-white">
        <div className="w-full max-w-lg space-y-4 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] leading-tight">
            Smart Meeting Intelligence
          </h2>
          <div className="flex items-center justify-center">
            <img 
              src="/img/hero-visual.png" 
              alt="MeetMind" 
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-12 py-10 bg-gray-100">
        <div className="w-full max-w-md  px-6 py-6 space-y-5">
          <div className="flex justify-center mb-4">
            <Link to="/">
              <img src="/img/logo.png" alt="MeetMind Logo" className="h-12 w-auto hover:opacity-80 transition-opacity cursor-pointer" />
            </Link>
          </div>
          
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            Sign in to your MeetMind workspace.
          </p>
        </div>

        <form
          className="space-y-4"
            onSubmit={async (e) => {
            e.preventDefault()
            setError('')
            setIsSubmitting(true)

              try {
                const { data, error: signInError } = await signIn({ email, password })

                if (signInError) {
                  console.log('Sign in error:', signInError)
                  
                  let errorMessage = signInError.message || 'Failed to sign in. Please check your credentials.'
                  
                  const isEmailNotConfirmed = 
                    errorMessage.includes('Email not confirmed') ||
                    errorMessage.includes('email_not_confirmed') ||
                    errorMessage.includes('email_not_verified') ||
                    signInError.status === 400 && errorMessage.toLowerCase().includes('confirm')
                  
                  if (errorMessage.includes('Invalid login credentials') || 
                      (errorMessage.includes('email') && errorMessage.includes('password')) ||
                      errorMessage.includes('Invalid login')) {
                    errorMessage = 'Invalid email or password. Please check your credentials and try again.'
                    setShowResendEmail(false)
                  } else if (isEmailNotConfirmed) {
                    errorMessage = 'Please check your email and confirm your account before signing in. If you disabled email confirmation in Supabase, you may need to confirm existing users manually.'
                    setShowResendEmail(true)
                  } else if (errorMessage.includes('rate limit')) {
                    errorMessage = 'Too many attempts. Please try again later.'
                    setShowResendEmail(false)
                  } else {
                    errorMessage = `Error: ${errorMessage}`
                    setShowResendEmail(false)
                  }
                  
                  setError(errorMessage)
                  setIsSubmitting(false)
                  return
                }

                if (data) {
                  navigate('/dashboard')
                }
              } catch (err) {
                setError('An unexpected error occurred. Please try again.')
              setIsSubmitting(false)
              }
          }}
        >
          <InputField
            label="Work email"
            name="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
          />
          <div className="flex items-center justify-between text-xs">
            <span />
            <Link to="#" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
              Forgot password?
            </Link>
          </div>

          {error && (
              <div className="space-y-2">
            <p className="text-xs text-[var(--color-danger)] bg-rose-50 border border-rose-100 rounded-[10px] px-3 py-2">
              {error}
            </p>
                {showResendEmail && (
                  <div className="space-y-2">
                    {resendSuccess ? (
                      <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-[10px] px-3 py-2">
                        ✓ Confirmation email sent! Please check your inbox.
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          setResending(true)
                          setResendSuccess(false)
                          const { error: resendError } = await resendConfirmationEmail(email)
                          if (resendError) {
                            setError('Failed to resend confirmation email. Please try again.')
                          } else {
                            setResendSuccess(true)
                            setError('')
                          }
                          setResending(false)
                        }}
                        disabled={resending}
                        className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-soft)] underline transition-colors disabled:opacity-50"
                      >
                        {resending ? 'Sending...' : 'Resend confirmation email'}
                      </button>
                    )}
                  </div>
                )}
              </div>
          )}

          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Log in'}
          </Button>
        </form>

          <p className="text-sm text-[var(--color-text-muted)] text-center">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-[var(--color-primary)] hover:text-[var(--color-primary-soft)] transition-colors">
            Create one
          </Link>
        </p>
        </div>
      </div>
    </div>
  )
}

