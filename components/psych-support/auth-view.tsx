"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Shield, Lock, Sparkles, User, UserPlus, CheckCircle2 } from "lucide-react"

interface AuthViewProps {
  onLogin: (userId: string, isRegistered: boolean, anonymousId?: string) => void
}

export function AuthView({ onLogin }: AuthViewProps) {
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [registerFirstName, setRegisterFirstName] = useState("")
  const [registerLastName, setRegisterLastName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPhone, setRegisterPhone] = useState("")
  const [registerStudentId, setRegisterStudentId] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [registerError, setRegisterError] = useState("")
  const [registerSuccess, setRegisterSuccess] = useState(false)

  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    
    if (!loginEmail || !loginPassword) {
      setLoginError("Please fill in all fields")
      return
    }

    setIsLoggingIn(true)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    })

    setIsLoggingIn(false)

    if (error) {
      setLoginError(error.message)
      return
    }

    if (data.user) {
      // Fetch user profile to get anonymous_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('anonymous_id, is_registered')
        .eq('id', data.user.id)
        .single()
      
      onLogin(data.user.id, profile?.is_registered ?? true, profile?.anonymous_id)
    }
  }

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[(]?[0-9]{2,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{0,3}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const validateStudentId = (studentId: string): boolean => {
    const studentIdRegex = /^\d{6}$/
    return studentIdRegex.test(studentId)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError("")

    if (!registerFirstName || !registerLastName || !registerEmail || !registerPhone || !registerStudentId || !registerPassword || !registerConfirmPassword) {
      setRegisterError("Please fill in all fields")
      return
    }

    if (!validatePhone(registerPhone)) {
      setRegisterError("Please enter a valid phone number")
      return
    }

    if (!validateStudentId(registerStudentId)) {
      setRegisterError("Student ID must be exactly 6 digits")
      return
    }

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError("Passwords do not match")
      return
    }

    if (registerPassword.length < 6) {
      setRegisterError("Password must be at least 6 characters")
      return
    }

    setIsRegistering(true)
    
    const { data, error } = await supabase.auth.signUp({
      email: registerEmail,
      password: registerPassword,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? 
          `${window.location.origin}/auth/callback`,
        data: {
          first_name: registerFirstName,
          last_name: registerLastName,
          phone: registerPhone,
          student_id: registerStudentId,
          is_registered: true,
        },
      },
    })

    setIsRegistering(false)

    if (error) {
      setRegisterError(error.message)
      return
    }

    if (data.user) {
      // Show success message - user needs to confirm email
      setRegisterSuccess(true)
    }
  }

  const generateAnonymousId = async () => {
    setIsGenerating(true)
    
    // Create an anonymous sign-in
    const { data, error } = await supabase.auth.signUp({
      email: `anon-${Date.now()}@anonymous.psychsupport.local`,
      password: `anon-${Math.random().toString(36).substring(2, 15)}-${Date.now()}`,
      options: {
        data: {
          is_registered: false,
        },
      },
    })

    if (error) {
      // Fallback to local-only anonymous mode
      const localAnonId = `ANON-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      setIsGenerating(false)
      onLogin(localAnonId, false, localAnonId)
      return
    }

    if (data.user) {
      // Fetch the generated anonymous_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('anonymous_id')
        .eq('id', data.user.id)
        .single()
      
      setIsGenerating(false)
      onLogin(data.user.id, false, profile?.anonymous_id)
    } else {
      // Fallback
      const localAnonId = `ANON-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      setIsGenerating(false)
      onLogin(localAnonId, false, localAnonId)
    }
  }

  if (registerSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-semibold text-foreground">PsychSupport</span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border shadow-lg">
            <CardContent className="pt-8 pb-8 space-y-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl">Check Your Email</CardTitle>
                <CardDescription className="text-base">
                  We&apos;ve sent a confirmation link to <strong>{registerEmail}</strong>
                </CardDescription>
              </div>
              <p className="text-sm text-muted-foreground">
                Please click the link in your email to verify your account and complete registration.
              </p>
              <Button
                variant="outline"
                onClick={() => setRegisterSuccess(false)}
                className="w-full"
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </main>

        <footer className="border-t border-border bg-card/50">
          <div className="container mx-auto px-4 py-4">
            <p className="text-center text-sm text-muted-foreground">
              If you&apos;re in immediate danger, please call emergency services or the crisis hotline: <strong>116 123</strong>
            </p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-semibold text-foreground">PsychSupport</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Welcome Card */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Welcome to PsychSupport</h1>
            <p className="text-muted-foreground">
              A safe, anonymous space for student mental health support
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-xs text-center text-muted-foreground">100% Anonymous</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border">
              <Lock className="w-6 h-6 text-primary" />
              <span className="text-xs text-center text-muted-foreground">Private & Secure</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-xs text-center text-muted-foreground">24/7 Support</span>
            </div>
          </div>

          {/* Auth Card with Tabs */}
          <Card className="border-border shadow-lg">
            <Tabs defaultValue="register" className="w-full">
              <CardHeader className="pb-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="register" className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Register
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              {/* Login Tab */}
              <TabsContent value="login" className="mt-0">
                <CardContent className="space-y-4 pt-4">
                  <CardDescription className="text-center">
                    Sign in to access all features including chat, calendar, and materials
                  </CardDescription>
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your.email@university.edu"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="bg-background"
                      />
                    </div>

                    {loginError && (
                      <p className="text-sm text-destructive">{loginError}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isLoggingIn ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                          Signing in...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Sign In
                        </span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="mt-0">
                <CardContent className="space-y-4 pt-4">
                  <CardDescription className="text-center">
                    Create an account for full access to all support features
                  </CardDescription>

                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* First Name & Last Name - Two Column Layout */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="register-firstname">First Name</Label>
                        <Input
                          id="register-firstname"
                          type="text"
                          placeholder="John"
                          value={registerFirstName}
                          onChange={(e) => setRegisterFirstName(e.target.value)}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-lastname">Last Name</Label>
                        <Input
                          id="register-lastname"
                          type="text"
                          placeholder="Doe"
                          value={registerLastName}
                          onChange={(e) => setRegisterLastName(e.target.value)}
                          className="bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your.email@university.edu"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="bg-background"
                      />
                    </div>

                    {/* Phone & Student ID - Two Column Layout */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="register-phone">Phone Number</Label>
                        <Input
                          id="register-phone"
                          type="tel"
                          placeholder="+48 123 456 789"
                          value={registerPhone}
                          onChange={(e) => setRegisterPhone(e.target.value)}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-studentid">Student ID</Label>
                        <Input
                          id="register-studentid"
                          type="text"
                          placeholder="123456"
                          maxLength={6}
                          value={registerStudentId}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '')
                            setRegisterStudentId(value)
                          }}
                          className="bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Create a password (min. 6 characters)"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm">Confirm Password</Label>
                      <Input
                        id="register-confirm"
                        type="password"
                        placeholder="Confirm your password"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        className="bg-background"
                      />
                    </div>

                    {registerError && (
                      <p className="text-sm text-destructive">{registerError}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={isRegistering}
                      className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isRegistering ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                          Creating account...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          Create Account
                        </span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Anonymous Access Section */}
          <Card className="border-border border-dashed bg-muted/30">
            <CardContent className="pt-6 space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-medium text-foreground">Continue Without Account</h3>
                <p className="text-sm text-muted-foreground">
                  Limited access: calming tips and SOS feature only
                </p>
              </div>

              <Button
                onClick={generateAnonymousId}
                disabled={isGenerating}
                variant="outline"
                className="w-full h-12 text-base font-medium"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-foreground border-t-transparent" />
                    Generating Secure ID...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Generate Anonymous ID
                  </span>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                You can register anytime to unlock full features
              </p>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Trusted by over 10,000 students across 50+ universities
            </p>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="w-4 h-4 text-primary fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
              <span className="ml-1 text-sm text-muted-foreground">4.9/5</span>
            </div>
          </div>

          {/* Terms */}
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our{" "}
            <button className="underline hover:text-foreground">Privacy Policy</button>
            {" "}and{" "}
            <button className="underline hover:text-foreground">Terms of Service</button>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            If you&apos;re in immediate danger, please call emergency services or the crisis hotline: <strong>116 123</strong>
          </p>
        </div>
      </footer>
    </div>
  )
}
