"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BookOpen, Search, Clock, ArrowRight, Brain, Heart, Moon, Users, Sparkles, Shield } from "lucide-react"

const materials = [
  {
    id: 1,
    title: "Understanding Anxiety: A Student's Guide",
    description: "Learn about the causes, symptoms, and effective strategies for managing anxiety in academic settings.",
    category: "Anxiety",
    readTime: "8 min read",
    icon: Brain,
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    content: `
      Anxiety is a common experience among students, especially during exam periods and major transitions. Understanding what anxiety is and how it affects you is the first step toward managing it effectively.

      **What is Anxiety?**
      Anxiety is your body's natural response to stress. It's a feeling of fear or apprehension about what's to come. While some anxiety can be helpful—motivating you to study or prepare—too much can be overwhelming.

      **Common Symptoms:**
      • Racing thoughts or difficulty concentrating
      • Physical symptoms like rapid heartbeat or sweating
      • Avoidance of anxiety-triggering situations
      • Sleep difficulties
      • Irritability or restlessness

      **Helpful Strategies:**
      1. Practice deep breathing exercises
      2. Break large tasks into smaller, manageable steps
      3. Challenge negative thought patterns
      4. Maintain regular exercise and sleep schedules
      5. Reach out for support when needed

      Remember, experiencing anxiety doesn't mean something is wrong with you. It's a common human experience, and help is always available.
    `
  },
  {
    id: 2,
    title: "Building Resilience Through Self-Care",
    description: "Discover practical self-care practices that can help you build emotional resilience and maintain mental wellness.",
    category: "Self-Care",
    readTime: "6 min read",
    icon: Heart,
    color: "bg-rose-50 border-rose-200",
    iconColor: "text-rose-600",
    content: `
      Self-care isn't selfish—it's essential. Building a regular self-care routine can significantly impact your mental health and ability to handle life's challenges.

      **The Pillars of Self-Care:**
      
      **Physical Self-Care:**
      • Regular exercise (even a 10-minute walk helps)
      • Adequate sleep (7-9 hours recommended)
      • Nutritious meals and staying hydrated
      • Regular health check-ups

      **Emotional Self-Care:**
      • Journaling your thoughts and feelings
      • Setting healthy boundaries
      • Allowing yourself to feel emotions without judgment
      • Practicing self-compassion

      **Social Self-Care:**
      • Maintaining meaningful relationships
      • Asking for help when needed
      • Joining communities that align with your interests
      • Taking breaks from social media

      **Practical Tips:**
      Start small—choose one self-care activity and practice it consistently. Gradually add more as these become habits. Remember, self-care looks different for everyone.
    `
  },
  {
    id: 3,
    title: "Sleep Hygiene for Better Mental Health",
    description: "Understanding the crucial connection between sleep and mental health, with tips for better rest.",
    category: "Sleep",
    readTime: "5 min read",
    icon: Moon,
    color: "bg-indigo-50 border-indigo-200",
    iconColor: "text-indigo-600",
    content: `
      Quality sleep is foundational to mental health. Poor sleep can worsen anxiety, depression, and stress, while good sleep can enhance mood, concentration, and overall well-being.

      **The Sleep-Mental Health Connection:**
      During sleep, your brain processes emotions and consolidates memories. Lack of sleep impairs this process, making it harder to regulate emotions and think clearly.

      **Tips for Better Sleep:**
      
      **Create a Sleep-Friendly Environment:**
      • Keep your room cool (65-68°F / 18-20°C)
      • Use blackout curtains or an eye mask
      • Minimize noise or use white noise
      • Reserve your bed for sleep only

      **Establish a Routine:**
      • Go to bed and wake up at consistent times
      • Create a relaxing pre-sleep routine
      • Avoid screens 1 hour before bed
      • Limit caffeine after 2 PM

      **What to Do When You Can't Sleep:**
      If you can't fall asleep after 20 minutes, get up and do something calming until you feel sleepy. Avoid watching the clock—this can increase anxiety.
    `
  },
  {
    id: 4,
    title: "Navigating Social Relationships",
    description: "Guidance on building healthy relationships and managing social anxiety in university settings.",
    category: "Relationships",
    readTime: "7 min read",
    icon: Users,
    color: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-600",
    content: `
      Relationships play a crucial role in our mental health. Whether you're navigating friendships, romantic relationships, or family dynamics, healthy connections can provide support and joy.

      **Signs of Healthy Relationships:**
      • Mutual respect and trust
      • Open communication
      • Support for each other's goals
      • Healthy conflict resolution
      • Feeling comfortable being yourself

      **Managing Social Anxiety:**
      Social anxiety is common among students. Here are some strategies:

      1. **Start Small:** Practice social skills in low-pressure situations
      2. **Challenge Negative Thoughts:** Ask yourself if your fears are realistic
      3. **Focus Outward:** Concentrate on others rather than your own anxiety
      4. **Prepare Conversation Topics:** Having ideas ready can reduce anxiety
      5. **Be Kind to Yourself:** Everyone feels awkward sometimes

      **Setting Boundaries:**
      It's okay to say no. Setting boundaries protects your energy and maintains healthy relationships. Practice saying: "I appreciate the invitation, but I need some time for myself."
    `
  },
  {
    id: 5,
    title: "Mindfulness for Beginners",
    description: "An introduction to mindfulness practices that can help reduce stress and improve focus.",
    category: "Mindfulness",
    readTime: "6 min read",
    icon: Sparkles,
    color: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-600",
    content: `
      Mindfulness is the practice of being fully present in the moment, without judgment. Regular practice can reduce stress, improve concentration, and enhance overall well-being.

      **Getting Started with Mindfulness:**
      
      **Simple Breathing Meditation:**
      1. Find a comfortable position
      2. Close your eyes or soften your gaze
      3. Focus on your breath—notice the inhale and exhale
      4. When your mind wanders (it will!), gently return to your breath
      5. Start with 3-5 minutes and gradually increase

      **Mindful Activities:**
      You don't need to sit still to be mindful. Try:
      • Mindful walking—notice each step
      • Mindful eating—savor each bite
      • Mindful listening—fully focus on sounds around you

      **Common Misconceptions:**
      • You DON'T need to clear your mind—just observe thoughts without judgment
      • You DON'T need hours—even 1 minute can help
      • You DON'T need to be spiritual—mindfulness is a skill anyone can learn

      **Tips for Building a Practice:**
      Start with just 2 minutes daily. Use apps if helpful. Be patient with yourself—mindfulness is a skill that develops over time.
    `
  },
  {
    id: 6,
    title: "Recognizing When to Seek Help",
    description: "Understanding when it's time to reach out for professional mental health support.",
    category: "Support",
    readTime: "5 min read",
    icon: Shield,
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
    content: `
      Knowing when to seek professional help is an important skill. There's no shame in reaching out—in fact, it's one of the bravest things you can do.

      **Signs It Might Be Time to Seek Help:**
      • Persistent feelings of sadness or hopelessness
      • Difficulty functioning in daily life
      • Changes in sleep or appetite lasting more than 2 weeks
      • Thoughts of self-harm or suicide
      • Using substances to cope
      • Feeling overwhelmed most of the time
      • Withdrawing from activities you once enjoyed

      **Types of Professional Support:**
      
      **Counselor:** Can help with specific issues and provide coping strategies
      **Psychologist:** Specializes in therapy and psychological assessment
      **Psychiatrist:** A medical doctor who can prescribe medication
      **Support Groups:** Peer support for specific challenges

      **How to Reach Out:**
      1. Contact your university's counseling center
      2. Use PsychSupport's booking feature
      3. Talk to a trusted adult
      4. In crisis? Call the helpline: 116 123

      **Remember:** Seeking help is a sign of strength, not weakness. You deserve support.
    `
  }
]

export function MaterialsView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMaterial, setSelectedMaterial] = useState<typeof materials[0] | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [...new Set(materials.map(m => m.category))]

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || material.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Support Materials</h2>
          <p className="text-muted-foreground">
            Educational resources to support your mental health journey
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{materials.length} Resources</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map((material) => {
          const Icon = material.icon
          return (
            <Card
              key={material.id}
              className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md border ${material.color}`}
              onClick={() => setSelectedMaterial(material)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-lg bg-white/50 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${material.iconColor}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {material.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3">{material.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-current opacity-75 line-clamp-2">
                  {material.description}
                </CardDescription>
                <div className="flex items-center justify-between mt-4">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {material.readTime}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-primary">
                    Read more <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No resources found matching your search.</p>
        </div>
      )}

      {/* Material Detail Dialog */}
      <Dialog open={!!selectedMaterial} onOpenChange={() => setSelectedMaterial(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedMaterial && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-xl ${selectedMaterial.color} flex items-center justify-center`}>
                    <selectedMaterial.icon className={`w-6 h-6 ${selectedMaterial.iconColor}`} />
                  </div>
                  <div>
                    <Badge variant="secondary" className="text-xs mb-1">
                      {selectedMaterial.category}
                    </Badge>
                    <DialogTitle className="text-xl">{selectedMaterial.title}</DialogTitle>
                  </div>
                </div>
                <DialogDescription className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {selectedMaterial.readTime}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="prose prose-sm max-w-none">
                  {selectedMaterial.content.split('\n').map((paragraph, index) => {
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return (
                        <h3 key={index} className="text-lg font-semibold text-foreground mt-4 mb-2">
                          {paragraph.replace(/\*\*/g, '')}
                        </h3>
                      )
                    }
                    if (paragraph.startsWith('•')) {
                      return (
                        <p key={index} className="text-muted-foreground ml-4 my-1">
                          {paragraph}
                        </p>
                      )
                    }
                    if (paragraph.match(/^\d+\./)) {
                      return (
                        <p key={index} className="text-muted-foreground ml-4 my-1">
                          {paragraph}
                        </p>
                      )
                    }
                    if (paragraph.trim()) {
                      return (
                        <p key={index} className="text-foreground my-2 leading-relaxed">
                          {paragraph}
                        </p>
                      )
                    }
                    return null
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedMaterial(null)}>
                  Close
                </Button>
                <Button>
                  Save to Favorites
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
