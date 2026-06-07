"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Heart, Home, Calendar, MessageCircle, BookOpen, AlertTriangle, LogOut, Lock } from "lucide-react"

type ViewType = "home" | "calendar" | "chat" | "materials"

interface SidebarProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  onSosClick: () => void
  onLogout: () => void
  isRegistered: boolean
}

const navItems = [
  { id: "home" as ViewType, label: "Tips on Calming Down", icon: Home, requiresAuth: false },
  { id: "calendar" as ViewType, label: "Calendar", icon: Calendar, requiresAuth: true },
  { id: "chat" as ViewType, label: "Anonymous Chat", icon: MessageCircle, requiresAuth: true },
  { id: "materials" as ViewType, label: "Support Materials", icon: BookOpen, requiresAuth: true },
]

export function Sidebar({ currentView, onViewChange, onSosClick, onLogout, isRegistered }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col h-screen">
      {/* Logo */}
      <div className="h-16 border-b border-sidebar-border flex items-center px-4 gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sidebar-primary/10">
          <Heart className="w-5 h-5 text-sidebar-primary" />
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">PsychSupport</span>
      </div>

      {/* User Status */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <div className={cn(
          "px-3 py-2 rounded-lg text-sm",
          isRegistered 
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
            : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
        )}>
          {isRegistered ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Registered User
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Guest Access (Limited)
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          const isLocked = item.requiresAuth && !isRegistered

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : isLocked
                    ? "text-sidebar-foreground/50 hover:bg-sidebar-accent/50"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                {item.label}
              </span>
              {isLocked && <Lock className="w-4 h-4 opacity-50" />}
            </button>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 space-y-3 border-t border-sidebar-border">
        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>

        {/* SOS Button - always available */}
        <Button
          onClick={onSosClick}
          variant="destructive"
          className="w-full h-14 text-base font-bold animate-pulse-sos bg-red-600 hover:bg-red-700 text-white shadow-lg"
        >
          <AlertTriangle className="w-5 h-5 mr-2" />
          SOS Emergency
        </Button>
      </div>
    </aside>
  )
}
