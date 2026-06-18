import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  const fetchProfile = useCallback(async (userId) => {
    if (!isSupabaseConfigured) return null
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (!error && data) setProfile(data)
    return data
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signUp = async ({ email, password, fullName, phone, companyName, reasonForAccess, termsAccepted, complianceAccepted }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          company_name: companyName,
          reason_for_access: reasonForAccess,
          terms_accepted: termsAccepted,
          compliance_accepted: complianceAccepted,
        },
      },
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setUser(null)
  }

  const refreshProfile = async () => {
    if (user) return fetchProfile(user.id)
    return null
  }

  const isAdmin = profile?.role === 'admin' && profile?.status === 'approved'
  const isApproved = profile?.status === 'approved'
  const isPending = profile?.status === 'pending'
  const isRejected = profile?.status === 'rejected'
  const isSuspended = profile?.status === 'suspended'

  return (
    <AuthContext.Provider value={{
      user, profile, loading, signUp, signIn, signOut, refreshProfile,
      isAdmin, isApproved, isPending, isRejected, isSuspended,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
