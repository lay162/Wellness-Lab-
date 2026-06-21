import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  isDevBypass, getStoredDevRole, storeDevRole, clearDevRole,
  DEV_PROFILES, devUserFromProfile,
} from '../lib/devAuth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(() => {
    if (isDevBypass()) return !getStoredDevRole()
    return isSupabaseConfigured
  })
  const [isDevSession, setIsDevSession] = useState(false)

  const applyDevRole = useCallback((role) => {
    const p = DEV_PROFILES[role]
    storeDevRole(role)
    setProfile(p)
    setUser(devUserFromProfile(p))
    setIsDevSession(true)
    setLoading(false)
  }, [])

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
    if (isDevBypass()) {
      const role = getStoredDevRole()
      if (role) {
        applyDevRole(role)
        return
      }
      setLoading(false)
    }

    if (!isSupabaseConfigured) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
        setIsDevSession(false)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
        setIsDevSession(false)
        clearDevRole()
      } else if (!getStoredDevRole()) {
        setUser(null)
        setProfile(null)
        setIsDevSession(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile, applyDevRole])

  const enterDevAs = (role) => {
    if (!isDevBypass()) return
    applyDevRole(role)
  }

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
    if (isDevSession) {
      clearDevRole()
      setProfile(null)
      setUser(null)
      setIsDevSession(false)
      return
    }
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
  const mustChangePassword = profile?.must_change_password === true

  const updatePassword = async (newPassword) => {
    const { error: authError } = await supabase.auth.updateUser({ password: newPassword })
    if (authError) return { error: authError }
    if (user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', user.id)
      if (profileError) return { error: profileError }
      await fetchProfile(user.id)
    }
    return { error: null }
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading, signUp, signIn, signOut, refreshProfile, updatePassword, enterDevAs,
      isAdmin, isApproved, isPending, isRejected, isSuspended, mustChangePassword, isDevSession,
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
