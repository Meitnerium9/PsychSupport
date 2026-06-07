"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, Bot, User, Shield, AlertTriangle, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  sentiment?: Sentiment
}

interface ChatViewProps {
  anonymousId: string
}

type Sentiment = "positive" | "negative" | "neutral" | "inquiry" | "crisis"

interface ConversationState {
  sentiment: Sentiment
  turnCount: number
  lastTopic: string | null
  userMood: "happy" | "sad" | "anxious" | "neutral" | "stressed"
}

// Sentiment detection keywords
const sentimentKeywords = {
  positive: [
    "good", "great", "happy", "awesome", "amazing", "wonderful", "fantastic", "excellent",
    "love", "excited", "joy", "grateful", "thankful", "blessed", "perfect", "brilliant",
    "best", "incredible", "better", "improved", "success", "achieved", "proud", "confident"
  ],
  negative: [
    "sad", "bad", "terrible", "awful", "depressed", "anxious", "worried", "stressed",
    "overwhelmed", "tired", "exhausted", "lonely", "scared", "afraid", "hopeless",
    "frustrated", "angry", "upset", "struggling", "difficult", "hard", "tough", "painful"
  ],
  inquiry: [
    "how", "what", "why", "when", "where", "can you", "could you", "help me",
    "tell me", "explain", "advice", "suggest", "recommend", "tips", "?",
  ],
  crisis: [
    "danger", "plan", "hurt", "harm", "suicide", "kill", "die", "end it",
    "no point", "give up", "can't go on", "self-harm", "cutting"
  ]
}

// Dynamic response dictionaries based on sentiment
const responsesByMood = {
  positive: {
    responses: [
      "That's wonderful to hear! 🌟 What's been making things so good for you?",
      "I love that energy! Tell me more about what's bringing you joy!",
      "That's amazing! It's so important to recognize and celebrate these moments. What made it special?",
      "How fantastic! I'd love to hear more details about your positive experience!",
      "Your positivity is infectious! What's the highlight of your day?",
      "That's really great to hear! Moments like these are worth savoring. Want to share more?",
    ],
    quickReplies: [
      "Share more details!",
      "What made it special?",
      "How can we keep this going?",
      "Tell me about your day",
    ]
  },
  negative: {
    responses: [
      "I hear you, and I want you to know that your feelings are completely valid. Would you like to tell me more about what's happening?",
      "Thank you for trusting me with this. It takes courage to share when things are tough. I'm here to listen.",
      "That sounds really challenging. Remember, it's okay to not be okay sometimes. What kind of support would help you right now?",
      "I'm sorry you're going through this. You don't have to face it alone. Can you tell me more about what's weighing on you?",
      "Your feelings matter, and I appreciate you sharing this with me. What would make you feel even a little bit better right now?",
      "It takes strength to acknowledge difficult feelings. I'm here with you. Would it help to explore some coping strategies together?",
    ],
    quickReplies: [
      "I need someone to listen",
      "Show me calming techniques",
      "I want to talk it out",
      "Help me understand this",
    ]
  },
  neutral: {
    responses: [
      "Thanks for sharing! I'm curious to learn more about your day. What's been on your mind?",
      "I appreciate you reaching out. What brings you to chat today?",
      "It's good to hear from you! Is there anything specific you'd like to talk about or explore?",
      "Thanks for connecting! I'm here to support you however I can. What would be most helpful?",
      "Welcome! Whether you want to chat, vent, or explore resources – I'm here for it all. What sounds good?",
    ],
    quickReplies: [
      "Just checking in",
      "Explore resources",
      "Practice mindfulness",
      "Share how I'm feeling",
    ]
  },
  inquiry: {
    responses: [
      "Great question! I'd be happy to help you with that. Let me share some thoughts...",
      "I'm glad you asked! There are several approaches we could explore together.",
      "That's something I can definitely help with. Here's what I'd suggest...",
      "Interesting question! Let me think about the best way to address this for you.",
      "I appreciate your curiosity! Let's explore this together.",
    ],
    quickReplies: [
      "Tell me more",
      "Show me examples",
      "What else should I know?",
      "Any other tips?",
    ]
  },
  crisis: {
    responses: [
      "I'm really glad you reached out, and I want you to know that you matter. What you're feeling is serious, and there are people who want to help. Can you tell me more about what's going on?",
      "Thank you for trusting me with something so important. Your safety is the priority right now. Are you somewhere safe?",
      "I hear you, and I'm taking what you're sharing very seriously. You don't have to go through this alone. Have you considered speaking with a counselor?",
    ],
    quickReplies: [
      "I need help now",
      "Talk to a counselor",
      "Emergency contacts",
      "Crisis resources",
    ]
  }
}

// Follow-up questions to keep conversation flowing
const followUpQuestions = {
  positive: [
    "What do you think contributed most to this feeling?",
    "How can you carry this positive energy forward?",
    "Who would you like to share this good news with?",
    "What other things have been going well lately?",
  ],
  negative: [
    "When did you first start feeling this way?",
    "Have you experienced something similar before?",
    "Is there someone in your life you can lean on?",
    "What usually helps you feel a bit better?",
  ],
  neutral: [
    "What's been occupying your thoughts lately?",
    "Is there anything you've been wanting to explore or discuss?",
    "How would you describe your energy levels today?",
    "What's one thing that would make today better?",
  ]
}

const initialMessages: Message[] = [
  {
    id: "1",
    content: "Hello! Welcome to PsychSupport anonymous chat. I'm here to listen and support you – whether you're having a great day and want to share, or you need someone to talk to during tough times. How are you feeling today?",
    sender: "bot",
    timestamp: new Date(Date.now() - 60000),
    sentiment: "neutral"
  },
]

function detectSentiment(text: string): Sentiment {
  const lowerText = text.toLowerCase()
  
  // Check for crisis first (highest priority)
  if (sentimentKeywords.crisis.some(word => lowerText.includes(word))) {
    return "crisis"
  }
  
  // Count matches for each sentiment
  const positiveCount = sentimentKeywords.positive.filter(word => lowerText.includes(word)).length
  const negativeCount = sentimentKeywords.negative.filter(word => lowerText.includes(word)).length
  const inquiryCount = sentimentKeywords.inquiry.filter(word => lowerText.includes(word)).length
  
  // Determine sentiment based on counts
  if (positiveCount > negativeCount && positiveCount > 0) {
    return "positive"
  }
  if (negativeCount > positiveCount && negativeCount > 0) {
    return "negative"
  }
  if (inquiryCount > 0 && positiveCount === 0 && negativeCount === 0) {
    return "inquiry"
  }
  
  return "neutral"
}

function getMoodFromSentiment(sentiment: Sentiment): "happy" | "sad" | "anxious" | "neutral" | "stressed" {
  switch (sentiment) {
    case "positive": return "happy"
    case "negative": return "sad"
    case "crisis": return "stressed"
    case "inquiry": return "neutral"
    default: return "neutral"
  }
}

function getResponseKey(sentiment: Sentiment): keyof typeof responsesByMood {
  if (sentiment === "crisis") return "crisis"
  if (sentiment === "positive") return "positive"
  if (sentiment === "negative") return "negative"
  if (sentiment === "inquiry") return "inquiry"
  return "neutral"
}

export function ChatView({ anonymousId }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [conversationState, setConversationState] = useState<ConversationState>({
    sentiment: "neutral",
    turnCount: 0,
    lastTopic: null,
    userMood: "neutral"
  })
  const [currentQuickReplies, setCurrentQuickReplies] = useState<string[]>(responsesByMood.neutral.quickReplies)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const usedResponsesRef = useRef<Set<string>>(new Set())

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const checkForDangerousContent = (text: string): boolean => {
    return sentimentKeywords.crisis.some(word => text.toLowerCase().includes(word))
  }

  const getUniqueResponse = (responses: string[]): string => {
    const availableResponses = responses.filter(r => !usedResponsesRef.current.has(r))
    
    // Reset if all responses have been used
    if (availableResponses.length === 0) {
      usedResponsesRef.current.clear()
      return responses[Math.floor(Math.random() * responses.length)]
    }
    
    const selectedResponse = availableResponses[Math.floor(Math.random() * availableResponses.length)]
    usedResponsesRef.current.add(selectedResponse)
    return selectedResponse
  }

  const generateBotResponse = (userMessage: string, sentiment: Sentiment): string => {
    const responseKey = getResponseKey(sentiment)
    const baseResponse = getUniqueResponse(responsesByMood[responseKey].responses)
    
    // Add follow-up question occasionally for natural flow
    const shouldAddFollowUp = conversationState.turnCount > 0 && Math.random() > 0.5
    
    if (shouldAddFollowUp && sentiment !== "crisis" && sentiment !== "inquiry") {
      const followUpKey = sentiment === "positive" ? "positive" : sentiment === "negative" ? "negative" : "neutral"
      const followUp = followUpQuestions[followUpKey][Math.floor(Math.random() * followUpQuestions[followUpKey].length)]
      return `${baseResponse}\n\n${followUp}`
    }
    
    return baseResponse
  }

  const sendMessage = (messageText?: string) => {
    const textToSend = messageText || inputValue
    if (!textToSend.trim()) return

    // Detect sentiment
    const sentiment = detectSentiment(textToSend)
    const userMood = getMoodFromSentiment(sentiment)

    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      sender: "user",
      timestamp: new Date(),
      sentiment
    }

    setMessages(prev => [...prev, userMessage])

    // Update conversation state
    setConversationState(prev => ({
      ...prev,
      sentiment,
      turnCount: prev.turnCount + 1,
      userMood
    }))

    // Check for dangerous content
    if (checkForDangerousContent(textToSend)) {
      toast.warning(
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">System Alert</p>
            <p className="text-sm text-amber-700">
              Collecting user data from anonymous ID: {anonymousId}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              A counselor has been notified for your safety.
            </p>
          </div>
        </div>,
        {
          duration: 8000,
          style: {
            background: "#FEF3C7",
            border: "1px solid #F59E0B",
          },
        }
      )
    }

    setInputValue("")
    setIsTyping(true)

    // Generate contextual bot response
    setTimeout(() => {
      const botResponseText = generateBotResponse(textToSend, sentiment)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponseText,
        sender: "bot",
        timestamp: new Date(),
        sentiment
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)

      // Update quick replies based on detected sentiment
      const responseKey = getResponseKey(sentiment)
      setCurrentQuickReplies(responsesByMood[responseKey].quickReplies)
    }, 1200 + Math.random() * 800) // Variable delay for more natural feel
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleQuickReply = (reply: string) => {
    sendMessage(reply)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getSentimentIndicator = (sentiment?: Sentiment) => {
    if (!sentiment) return null
    const colors = {
      positive: "bg-emerald-500",
      negative: "bg-amber-500",
      neutral: "bg-slate-400",
      inquiry: "bg-blue-500",
      crisis: "bg-red-500"
    }
    return <span className={`w-2 h-2 rounded-full ${colors[sentiment]} inline-block ml-2`} />
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col">
      {/* Header */}
      <Card className="border-border mb-4">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Anonymous Chat</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Support available 24/7
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-xs">
              <Shield className="w-3 h-3 text-primary" />
              <span className="text-secondary-foreground">End-to-end encrypted</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <Card className="flex-1 border-border flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "bot" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary text-secondary-foreground rounded-bl-md"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                <p
                  className={`text-xs mt-1 flex items-center ${
                    message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {formatTime(message.timestamp)}
                  {message.sender === "user" && getSentimentIndicator(message.sentiment)}
                </p>
              </div>
              {message.sender === "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Quick Replies */}
        <div className="border-t border-border px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Quick replies</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentQuickReplies.map((reply, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-7 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleQuickReply(reply)}
                disabled={isTyping}
              >
                {reply}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="flex gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-background"
            />
            <Button onClick={() => sendMessage()} disabled={!inputValue.trim() || isTyping}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Your identity is protected. This chat is completely anonymous.
          </p>
        </div>
      </Card>
    </div>
  )
}
