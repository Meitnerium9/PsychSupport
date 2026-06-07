"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Wind, Eye, Flower2, Music, Heart, Sun, Moon, Waves } from "lucide-react"

const calmingTips = [
  {
    id: 1,
    title: "Box Breathing",
    description: "A calming technique used by Navy SEALs",
    icon: Wind,
    color: "bg-blue-50 border-blue-200 text-blue-800",
    iconColor: "text-blue-600",
    content: {
      title: "Box Breathing Exercise",
      steps: [
        "Breathe in slowly for 4 seconds",
        "Hold your breath for 4 seconds",
        "Exhale slowly for 4 seconds",
        "Hold empty for 4 seconds",
        "Repeat 4-6 times"
      ],
      tip: "This technique helps activate your parasympathetic nervous system, reducing stress and anxiety."
    }
  },
  {
    id: 2,
    title: "5-4-3-2-1 Grounding",
    description: "Anchor yourself in the present moment",
    icon: Eye,
    color: "bg-emerald-50 border-emerald-200 text-emerald-800",
    iconColor: "text-emerald-600",
    content: {
      title: "Grounding Exercise",
      steps: [
        "Name 5 things you can SEE",
        "Name 4 things you can TOUCH",
        "Name 3 things you can HEAR",
        "Name 2 things you can SMELL",
        "Name 1 thing you can TASTE"
      ],
      tip: "This exercise helps redirect your focus from anxious thoughts to your immediate environment."
    }
  },
  {
    id: 3,
    title: "Progressive Relaxation",
    description: "Release tension from head to toe",
    icon: Flower2,
    color: "bg-purple-50 border-purple-200 text-purple-800",
    iconColor: "text-purple-600",
    content: {
      title: "Progressive Muscle Relaxation",
      steps: [
        "Start with your toes - tense for 5 seconds, then release",
        "Move to your calves - tense, hold, release",
        "Continue with thighs, stomach, hands",
        "Finish with shoulders, face, and forehead",
        "Notice the difference between tension and relaxation"
      ],
      tip: "Regular practice can help you recognize when you're holding tension and release it quickly."
    }
  },
  {
    id: 4,
    title: "Mindful Listening",
    description: "Use sound to center your mind",
    icon: Music,
    color: "bg-amber-50 border-amber-200 text-amber-800",
    iconColor: "text-amber-600",
    content: {
      title: "Mindful Listening Practice",
      steps: [
        "Find a quiet place and close your eyes",
        "Focus on the sounds around you",
        "Notice sounds near and far",
        "Don't judge the sounds, just observe",
        "If your mind wanders, gently return to listening"
      ],
      tip: "This practice helps train your attention and can be done anywhere, anytime."
    }
  },
  {
    id: 5,
    title: "Self-Compassion",
    description: "Practice kindness towards yourself",
    icon: Heart,
    color: "bg-rose-50 border-rose-200 text-rose-800",
    iconColor: "text-rose-600",
    content: {
      title: "Self-Compassion Exercise",
      steps: [
        "Place your hand over your heart",
        "Acknowledge: 'This is a moment of difficulty'",
        "Remind yourself: 'Suffering is part of being human'",
        "Offer yourself kindness: 'May I be gentle with myself'",
        "Breathe and let the warmth spread"
      ],
      tip: "Research shows self-compassion reduces anxiety and depression more effectively than self-criticism."
    }
  },
  {
    id: 6,
    title: "Visualization",
    description: "Create a mental safe space",
    icon: Sun,
    color: "bg-orange-50 border-orange-200 text-orange-800",
    iconColor: "text-orange-600",
    content: {
      title: "Safe Place Visualization",
      steps: [
        "Close your eyes and breathe deeply",
        "Imagine a place where you feel completely safe",
        "Notice the colors, sounds, and smells",
        "Feel the temperature and textures",
        "Stay in this space for 2-5 minutes"
      ],
      tip: "Creating a mental safe space gives you a refuge you can access anytime, anywhere."
    }
  },
  {
    id: 7,
    title: "Sleep Hygiene",
    description: "Tips for better rest tonight",
    icon: Moon,
    color: "bg-indigo-50 border-indigo-200 text-indigo-800",
    iconColor: "text-indigo-600",
    content: {
      title: "Better Sleep Tips",
      steps: [
        "Maintain a consistent sleep schedule",
        "Avoid screens 1 hour before bed",
        "Keep your room cool and dark",
        "Try a calming activity like reading or stretching",
        "Limit caffeine after 2 PM"
      ],
      tip: "Quality sleep is foundational for mental health. Even small improvements can make a big difference."
    }
  },
  {
    id: 8,
    title: "Wave Breathing",
    description: "Flow with your natural rhythm",
    icon: Waves,
    color: "bg-cyan-50 border-cyan-200 text-cyan-800",
    iconColor: "text-cyan-600",
    content: {
      title: "Wave Breathing Exercise",
      steps: [
        "Imagine waves gently rolling onto a beach",
        "Breathe in as the wave comes in (5 seconds)",
        "Breathe out as the wave recedes (7 seconds)",
        "Make your exhale longer than your inhale",
        "Continue for 2-3 minutes"
      ],
      tip: "Longer exhales activate the vagus nerve, triggering relaxation responses in your body."
    }
  },
]

export function HomeView() {
  const [selectedTip, setSelectedTip] = useState<typeof calmingTips[0] | null>(null)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Tips on Calming Down</h2>
        <p className="text-muted-foreground">
          Explore these evidence-based techniques to help manage stress and anxiety
        </p>
      </div>

      {/* Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {calmingTips.map((tip) => {
          const Icon = tip.icon
          return (
            <Card
              key={tip.id}
              className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${tip.color} border`}
              onClick={() => setSelectedTip(tip)}
            >
              <CardHeader className="pb-2">
                <div className={`w-10 h-10 rounded-lg bg-white/50 flex items-center justify-center mb-2`}>
                  <Icon className={`w-5 h-5 ${tip.iconColor}`} />
                </div>
                <CardTitle className="text-lg">{tip.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-current opacity-75">
                  {tip.description}
                </CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">24/7</p>
              <p className="text-sm text-muted-foreground mt-1">Support Available</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">100%</p>
              <p className="text-sm text-muted-foreground mt-1">Confidential</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">Free</p>
              <p className="text-sm text-muted-foreground mt-1">For All Students</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tip Detail Dialog */}
      <Dialog open={!!selectedTip} onOpenChange={() => setSelectedTip(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedTip && (
            <>
              <DialogHeader>
                <div className={`w-12 h-12 rounded-xl ${selectedTip.color} flex items-center justify-center mb-2`}>
                  <selectedTip.icon className={`w-6 h-6 ${selectedTip.iconColor}`} />
                </div>
                <DialogTitle className="text-xl">{selectedTip.content.title}</DialogTitle>
                <DialogDescription>
                  Follow these steps to practice this technique
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <ol className="space-y-3">
                  {selectedTip.content.steps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-foreground">{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="p-4 rounded-xl bg-secondary border border-border">
                  <p className="text-sm text-secondary-foreground">
                    <strong>Pro tip:</strong> {selectedTip.content.tip}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setSelectedTip(null)}>
                  Got it, thanks!
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
