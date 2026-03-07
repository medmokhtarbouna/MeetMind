import { supabase } from '../lib/supabase'
import type { AuthError, User, Session } from '@supabase/supabase-js'

export interface SignUpParams {
  email: string
  password: string
  fullName?: string
}

export interface SignInParams {
  email: string
  password: string
}

export interface AuthResult<T = User> {
  data: T | null
  error: AuthError | null
}

export interface SessionResult {
  data: Session | null
  error: AuthError | null
}

export async function signUp({ email, password, fullName }: SignUpParams): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    })

    return { data: data.user, error }
  } catch (error) {
    return {
      data: null,
      error: error as AuthError,
    }
  }
}

export async function signIn({ email, password }: SignInParams): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { data: data.user, error }
  } catch (error) {
    return {
      data: null,
      error: error as AuthError,
    }
  }
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    return { error: error as AuthError }
  }
}

export async function getSession(): Promise<SessionResult> {
  try {
    const { data, error } = await supabase.auth.getSession()
    return { data: data.session, error }
  } catch (error) {
    return {
      data: null,
      error: error as AuthError,
    }
  }
}

export async function getCurrentUser(): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.getUser()
    return { data: data.user, error }
  } catch (error) {
    return {
      data: null,
      error: error as AuthError,
    }
  }
}

export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
    callback(event, session)
  })
}

export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  } catch (error) {
    return { error: error as AuthError }
  }
}

export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { error }
  } catch (error) {
    return { error: error as AuthError }
  }
}

export async function resendConfirmationEmail(email: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })
    return { error }
  } catch (error) {
    return { error: error as AuthError }
  }
}
