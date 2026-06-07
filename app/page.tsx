"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { AuthView } from "@/components/psych-support/auth-view"
import { Dashboard } from "@/components/psych-support/dashboard"
import { Toaster } from "@/components/ui/sonner"

export default function PsychSupportApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState("")
  const [anonymousId, setAnonymousId] = useState("")
  const [isRegistered, setIsRegistered] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('anonymous_id, is_registered')
          .eq('id', session.user.id)
          .single()
        
        setUserId(session.user.id)
        setAnonymousId(profile?.anonymous_id ?? '')
        setIsRegistered(profile?.is_registered ?? true)
        setIsAuthenticated(true)
      }
      
      setIsLoading(false)
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('anonymous_id, is_registered')
            .eq('id', session.user.id)
            .single()
          
          setUserId(session.user.id)
          setAnonymousId(profile?.anonymous_id ?? '')
          setIsRegistered(profile?.is_registered ?? true)
          setIsAuthenticated(true)
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false)
          setUserId('')
          setAnonymousId('')
          setIsRegistered(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogin = (id: string, registered: boolean, anonId?: string) => {
    setUserId(id)
    setAnonymousId(anonId ?? id)
    setIsRegistered(registered)
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error.message)
      }
    } catch (err) {
      console.error("Sign out failed:", err)
    } finally {
      // Always clear local state regardless of signOut result
      setIsAuthenticated(false)
      setUserId("")
      setAnonymousId("")
      setIsRegistered(false)
      // Force page reload to clear any cached state
      window.location.href = "/"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthView onLogin={handleLogin} />
        <Toaster />
      </>
    )
  }

  return (
    <>
      <Dashboard 
        anonymousId={anonymousId || userId} 
        isRegistered={isRegistered}
        onLogout={handleLogout} 
      />
      <Toaster />
    </>
  )
}
