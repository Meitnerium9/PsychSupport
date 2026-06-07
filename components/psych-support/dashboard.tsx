"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { HomeView } from "./views/home-view"
import { CalendarView } from "./views/calendar-view"
import { ChatView } from "./views/chat-view"
import { MaterialsView } from "./views/materials-view"
import { SosDialog } from "./sos-dialog"
import { User, Lock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type ViewType = "home" | "calendar" | "chat" | "materials"

interface DashboardProps {
  anonymousId: string
  isRegistered: boolean
  onLogout: () => void
}

export function Dashboard({ anonymousId, isRegistered, onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<ViewType>("home")
  const [isSosOpen, setIsSosOpen] = useState(false)

  // Restricted view for unregistered users
  const RestrictedView = ({ title }: { title: string }) => (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-muted-foreground" />
          </div>
          <CardTitle>Access Restricted</CardTitle>
          <CardDescription>
            {title} is available only for registered users. Please sign out and create an account to access this feature.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onLogout} variant="outline" className="w-full">
            Sign Out & Register
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderView = () => {
    switch (currentView) {
      case "home":
        // Home (Tips on calming down) is available for everyone
        return <HomeView />
      case "calendar":
        // Calendar is only for registered users
        return isRegistered ? <CalendarView /> : <RestrictedView title="Calendar & Appointments" />
      case "chat":
        // Chat is only for registered users
        return isRegistered ? <ChatView anonymousId={anonymousId} /> : <RestrictedView title="Anonymous Chat" />
      case "materials":
        // Materials are only for registered users
        return isRegistered ? <MaterialsView /> : <RestrictedView title="Support Materials" />
      default:
        return <HomeView />
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onSosClick={() => setIsSosOpen(true)}
        onLogout={onLogout}
        isRegistered={isRegistered}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground capitalize">
              {currentView === "home" ? "Tips on Calming Down" : currentView}
            </h1>
            {!isRegistered && currentView !== "home" && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                Restricted
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!isRegistered && (
              <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                Guest Access
              </span>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">
              <User className="w-4 h-4" />
              <span className="text-sm font-mono">{anonymousId}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderView()}
        </div>
      </main>

      {/* SOS Dialog - available for everyone */}
      <SosDialog open={isSosOpen} onOpenChange={setIsSosOpen} />
    </div>
  )
}
