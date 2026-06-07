"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Cookie, Settings, X } from "lucide-react"

const COOKIE_CONSENT_KEY = "psychsupport-cookie-consent"

type ConsentStatus = "pending" | "accepted" | "declined" | "customized"

export function CookieConsentBanner() {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  // Cookie preferences
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') return

    try {
      // Check localStorage for existing consent
      const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY)
      
      if (storedConsent) {
        const parsed = JSON.parse(storedConsent)
        setConsentStatus(parsed.status ?? 'accepted')
        setPreferences(parsed.preferences ?? {
          necessary: true,
          analytics: false,
          marketing: false,
        })
      } else {
        // No consent stored, show banner immediately
        setIsVisible(true)
      }
    } catch {
      // If JSON parsing fails, show the banner immediately
      setIsVisible(true)
    }
  }, [])

  const saveConsent = (status: ConsentStatus, prefs: typeof preferences) => {
    if (typeof window === 'undefined') return
    
    try {
      const consentData = {
        status,
        preferences: prefs,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData))
    } catch {
      // Silently fail if localStorage is not available
    }
  }

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    }
    setPreferences(allAccepted)
    saveConsent("accepted", allAccepted)
    animateOut()
  }

  const handleDecline = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
    }
    setPreferences(onlyNecessary)
    saveConsent("declined", onlyNecessary)
    animateOut()
  }

  const handleSavePreferences = () => {
    saveConsent("customized", preferences)
    animateOut()
  }

  const animateOut = () => {
    setIsAnimatingOut(true)
    setTimeout(() => {
      setIsVisible(false)
      setConsentStatus("accepted")
    }, 300)
  }

  // Don't render if consent already given or not yet checked
  if (consentStatus !== null || !isVisible) {
    return null
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-300 ease-in-out ${
        isAnimatingOut 
          ? "translate-y-full opacity-0" 
          : "translate-y-0 opacity-100"
      }`}
    >
      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur-sm md:p-6">
          {!showSettings ? (
            // Main banner view
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-primary/10 p-2">
                  <Cookie className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-foreground">Cookie Preferences</h3>
                  <p className="text-sm text-muted-foreground">
                    We use cookies to ensure you get the best experience on our website. 
                    They help us understand how you use our site and improve our services.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDecline}
                >
                  Decline
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                >
                  Accept All
                </Button>
              </div>
            </div>
          ) : (
            // Settings view
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground">Cookie Settings</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {/* Necessary cookies - always enabled */}
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div>
                    <p className="font-medium text-sm text-foreground">Necessary Cookies</p>
                    <p className="text-xs text-muted-foreground">
                      Required for the website to function properly. Cannot be disabled.
                    </p>
                  </div>
                  <div className="flex h-6 w-11 items-center rounded-full bg-primary px-1">
                    <div className="h-4 w-4 translate-x-5 rounded-full bg-white shadow-sm" />
                  </div>
                </div>
                
                {/* Analytics cookies */}
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div>
                    <p className="font-medium text-sm text-foreground">Analytics Cookies</p>
                    <p className="text-xs text-muted-foreground">
                      Help us understand how visitors interact with our website.
                    </p>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                    className={`flex h-6 w-11 items-center rounded-full px-1 transition-colors ${
                      preferences.analytics ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <div 
                      className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                        preferences.analytics ? "translate-x-5" : "translate-x-0"
                      }`} 
                    />
                  </button>
                </div>
                
                {/* Marketing cookies */}
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div>
                    <p className="font-medium text-sm text-foreground">Marketing Cookies</p>
                    <p className="text-xs text-muted-foreground">
                      Used to track visitors across websites for advertising purposes.
                    </p>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                    className={`flex h-6 w-11 items-center rounded-full px-1 transition-colors ${
                      preferences.marketing ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <div 
                      className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                        preferences.marketing ? "translate-x-5" : "translate-x-0"
                      }`} 
                    />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDecline}
                >
                  Decline All
                </Button>
                <Button
                  size="sm"
                  onClick={handleSavePreferences}
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
