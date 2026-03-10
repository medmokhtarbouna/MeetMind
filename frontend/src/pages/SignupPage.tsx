import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { InputField } from '../components/InputField'
import { signUp, resendConfirmationEmail } from '../services/auth'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export function SignupPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [signupSuccess, setSignupSuccess] = useState(false)

  const disabled = isSubmitting || !accepted

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
        <div className="w-full max-w-md px-6 py-6 space-y-5">
          <div className="flex justify-center mb-4">
            <Link to="/">
              <img src="/img/logo.png" alt="MeetMind Logo" className="h-12 w-auto hover:opacity-80 transition-opacity cursor-pointer" />
            </Link>
          </div>
          
          <div className="space-y-1 text-center">
            <h1 className="text-xl font-semibold">Create your account</h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Start a 14-day trial. No credit card required.
            </p>
          </div>

          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault()
              setError('')

              if (!email || !email.includes('@')) {
                setError('Please enter a valid email address.')
                return
              }

              const invalidDomains = ['example.com', 'test.com', 'invalid.com']
              const emailDomain = email.split('@')[1]?.toLowerCase()
              if (emailDomain && invalidDomains.includes(emailDomain)) {
                setError('Please use a real email address. Example domains are not allowed.')
                return
              }

              if (password.length < 8) {
                setError('Password must be at least 8 characters long.')
                return
              }

              if (password !== confirmPassword) {
                setError('Passwords do not match.')
                return
              }

              if (!accepted) {
                setError('Please accept the Terms of Service and Privacy Policy.')
                return
              }

              setIsSubmitting(true)

              try {
                const { data, error: signUpError } = await signUp({
                  email,
                  password,
                  fullName,
                })

                if (signUpError) {
                  let errorMessage = signUpError.message || 'Failed to create account. Please try again.'
                  
                  if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
                    errorMessage = 'Please enter a valid email address.'
                  } else if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
                    errorMessage = 'An account with this email already exists. Please sign in instead.'
                  } else if (errorMessage.includes('password')) {
                    errorMessage = 'Password does not meet requirements. Please use a stronger password.'
                  } else if (errorMessage.includes('rate limit')) {
                    errorMessage = 'Too many attempts. Please try again later.'
                  }
                  
                  setError(errorMessage)
                  setIsSubmitting(false)
                  return
                }

                if (data) {
                  const { data: { session } } = await supabase.auth.getSession()
                  
                  if (!session) {
                    setSignupSuccess(true)
                    setError('')
                    setIsSubmitting(false)
                  } else {
                    navigate('/dashboard')
                  }
                }
              } catch (err) {
                setError('An unexpected error occurred. Please try again.')
                setIsSubmitting(false)
              }
            }}
          >
            {signupSuccess ? (
              <div className="space-y-3">
                <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-[10px] px-3 py-3">
                  <p className="font-medium mb-1">✓ Account created successfully!</p>
                  <p className="mb-2">Please check your email ({email}) and click the confirmation link to activate your account.</p>
                  <button
                    type="button"
                    onClick={async () => {
                      const { error: resendError } = await resendConfirmationEmail(email)
                      if (resendError) {
                        setError('Failed to resend confirmation email. Please try again.')
                        setSignupSuccess(false)
                      } else {
                        setError('')
                      }
                    }}
                    className="text-[var(--color-primary)] hover:text-[var(--color-primary-soft)] underline font-medium"
                  >
                    Resend confirmation email
                  </button>
                </div>
                <div className="text-center">
                  <Link to="/login" className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-soft)] transition-colors">
                    Go to login page →
                  </Link>
                </div>
              </div>
            ) : error && (
              <p className="text-xs text-[var(--color-danger)] bg-rose-50 border border-rose-100 rounded-[10px] px-3 py-2">
                {error}
              </p>
            )}

            <InputField
              label="Full name"
              name="fullName"
              placeholder="Enter your full name"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <InputField
              label="Work email"
              name="email"
              type="email"
              placeholder="your.email@company.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <InputField
              label="Password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <InputField
              label="Confirm password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <label className="flex items-start gap-2 text-xs text-[var(--color-text-muted)]">
              <input
                type="checkbox"
                className="mt-[3px]"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <span>
                I agree to the{' '}
                <a href="#" className="text-[var(--color-primary)] hover:text-[var(--color-primary-soft)] transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-[var(--color-primary)] hover:text-[var(--color-primary-soft)] transition-colors">
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            <Button type="submit" fullWidth disabled={disabled}>
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="text-sm text-[var(--color-text-muted)] text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--color-primary)] hover:text-[var(--color-primary-soft)] transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

