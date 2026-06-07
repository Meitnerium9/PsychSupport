"use client"

import { useState, useEffect, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, Clock, User, Video, MapPin, CheckCircle2, Star, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  getAvailableTherapists,
  createAppointment,
  createSupportCard,
  getAllAvailability,
  type Therapist,
  type AvailableSlot,
} from "@/app/actions/appointments"

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const timeSlots = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"]

type BookingType = "offline" | "online" | null

interface BookingState {
  type: BookingType
  day: string
  time: string
  step: "select-therapist" | "form" | "confirm"
  selectedTherapist: Therapist | null
}

interface AvailabilitySlot {
  day: string
  time: string
  type: "online" | "offline"
  count: number
}

export function CalendarView() {
  const [isPending, startTransition] = useTransition()
  const [booking, setBooking] = useState<BookingState>({
    type: null,
    day: "",
    time: "",
    step: "select-therapist",
    selectedTherapist: null,
  })
  const [availableTherapists, setAvailableTherapists] = useState<AvailableSlot[]>([])
  const [calendarAvailability, setCalendarAvailability] = useState<AvailabilitySlot[]>([])
  const [isLoadingTherapists, setIsLoadingTherapists] = useState(false)
  const [confirmedAppointment, setConfirmedAppointment] = useState<{
    therapistName: string
    day: string
    time: string
    type: "online" | "offline"
    location?: string
    meetingLink?: string
  } | null>(null)

  // Support card form state
  const [supportCard, setSupportCard] = useState({
    currentMood: 5,
    stressLevel: 5,
    recentChallenges: "",
    supportGoals: "",
    additionalNotes: "",
  })

  const [consultantForm, setConsultantForm] = useState({
    topic: "",
    preferredLanguage: "",
    additionalNotes: "",
  })

  // Fetch calendar availability on mount
  useEffect(() => {
    startTransition(async () => {
      const result = await getAllAvailability()
      if (result.success && result.data) {
        setCalendarAvailability(result.data)
      }
    })
  }, [])

  const openBookingDialog = async (type: BookingType, day: string, time: string) => {
    setBooking({ type, day, time, step: "select-therapist", selectedTherapist: null })
    setIsLoadingTherapists(true)

    // Fetch available therapists for this slot
    const result = await getAvailableTherapists(day, time, type as "online" | "offline")
    
    if (result.success && result.data) {
      setAvailableTherapists(result.data)
    } else {
      toast.error(result.error || "Failed to load available therapists")
      setAvailableTherapists([])
    }
    setIsLoadingTherapists(false)
  }

  const selectTherapist = (therapist: Therapist) => {
    setBooking((prev) => ({ ...prev, selectedTherapist: therapist, step: "form" }))
  }

  const handleSupportCardSubmit = async () => {
    if (!booking.selectedTherapist) return

    startTransition(async () => {
      // Create support card first
      const cardResult = await createSupportCard(
        `Session with ${booking.selectedTherapist!.title} ${booking.selectedTherapist!.first_name} ${booking.selectedTherapist!.last_name}`,
        supportCard.currentMood,
        supportCard.stressLevel,
        supportCard.recentChallenges,
        supportCard.supportGoals,
        supportCard.additionalNotes
      )

      if (!cardResult.success) {
        toast.error(cardResult.error || "Failed to create support card")
        return
      }

      // Then create appointment
      const appointmentDate = getNextDateForDay(booking.day)
      const time24 = convertTo24Hour(booking.time)
      const endTime = addHourToTime(time24)

      const appointmentResult = await createAppointment(
        booking.selectedTherapist!.id,
        appointmentDate,
        time24,
        endTime,
        "offline",
        supportCard.additionalNotes
      )

      if (!appointmentResult.success) {
        toast.error(appointmentResult.error || "Failed to book appointment")
        return
      }

      setConfirmedAppointment({
        therapistName: `${booking.selectedTherapist!.title || ""} ${booking.selectedTherapist!.first_name} ${booking.selectedTherapist!.last_name}`,
        day: booking.day,
        time: booking.time,
        type: "offline",
        location: booking.selectedTherapist!.office_location || "Counseling Center",
      })
      setBooking((prev) => ({ ...prev, step: "confirm" }))
      toast.success("Appointment booked successfully!")
    })
  }

  const handleConsultantSubmit = async () => {
    if (!booking.selectedTherapist) return

    startTransition(async () => {
      const appointmentDate = getNextDateForDay(booking.day)
      const time24 = convertTo24Hour(booking.time)
      const endTime = addHourToTime(time24)

      const result = await createAppointment(
        booking.selectedTherapist!.id,
        appointmentDate,
        time24,
        endTime,
        "online",
        `Topic: ${consultantForm.topic}\nLanguage: ${consultantForm.preferredLanguage}\n${consultantForm.additionalNotes}`
      )

      if (!result.success) {
        toast.error(result.error || "Failed to book consultation")
        return
      }

      setConfirmedAppointment({
        therapistName: `${booking.selectedTherapist!.title || ""} ${booking.selectedTherapist!.first_name} ${booking.selectedTherapist!.last_name}`,
        day: booking.day,
        time: booking.time,
        type: "online",
        meetingLink: `https://meet.psychsupport.edu/session/${result.appointmentId?.substring(0, 8)}`,
      })
      setBooking((prev) => ({ ...prev, step: "confirm" }))
      toast.success("Online consultation booked!")
    })
  }

  const closeDialog = () => {
    setBooking({ type: null, day: "", time: "", step: "select-therapist", selectedTherapist: null })
    setAvailableTherapists([])
    setConfirmedAppointment(null)
    setSupportCard({
      currentMood: 5,
      stressLevel: 5,
      recentChallenges: "",
      supportGoals: "",
      additionalNotes: "",
    })
    setConsultantForm({
      topic: "",
      preferredLanguage: "",
      additionalNotes: "",
    })
  }

  // Check if a slot has availability
  const getSlotInfo = (day: string, time: string): { hasOffline: boolean; hasOnline: boolean } => {
    const dayLower = day.toLowerCase()
    const offlineSlot = calendarAvailability.find(
      (s) => s.day.toLowerCase() === dayLower && s.time === time && s.type === "offline"
    )
    const onlineSlot = calendarAvailability.find(
      (s) => s.day.toLowerCase() === dayLower && s.time === time && s.type === "online"
    )
    return {
      hasOffline: !!offlineSlot,
      hasOnline: !!onlineSlot,
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Calendar</h2>
          <p className="text-muted-foreground">
            Book appointments with psychologists and consultants
          </p>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Psychologist (In-person)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-sm text-muted-foreground">Consultant (Online)</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <CardTitle>Weekly Schedule</CardTitle>
          </div>
          <CardDescription>Click on an available slot to book an appointment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left text-sm font-medium text-muted-foreground border-b border-border w-24">
                    Time
                  </th>
                  {weekDays.map((day) => (
                    <th key={day} className="p-2 text-center text-sm font-medium text-foreground border-b border-border">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time}>
                    <td className="p-2 text-sm text-muted-foreground border-b border-border">
                      {time}
                    </td>
                    {weekDays.map((day) => {
                      const { hasOffline, hasOnline } = getSlotInfo(day, time)
                      const hasAny = hasOffline || hasOnline

                      return (
                        <td key={day} className="p-1 border-b border-border">
                          {!hasAny ? (
                            <div className="h-12 rounded-lg bg-muted/50 flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">-</span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {hasOffline && (
                                <button
                                  onClick={() => openBookingDialog("offline", day, time)}
                                  className="w-full h-6 rounded text-xs font-medium transition-all hover:scale-[1.02] bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 flex items-center justify-center gap-1"
                                >
                                  <MapPin className="w-3 h-3" />
                                  In-person
                                </button>
                              )}
                              {hasOnline && (
                                <button
                                  onClick={() => openBookingDialog("online", day, time)}
                                  className="w-full h-6 rounded text-xs font-medium transition-all hover:scale-[1.02] bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20 flex items-center justify-center gap-1"
                                >
                                  <Video className="w-3 h-3" />
                                  Online
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={booking.type !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {booking.step === "select-therapist" && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${booking.type === "offline" ? "bg-primary/10" : "bg-accent/10"}`}>
                    {booking.type === "offline" ? (
                      <User className="w-5 h-5 text-primary" />
                    ) : (
                      <Video className="w-5 h-5 text-accent" />
                    )}
                  </div>
                  <div>
                    <DialogTitle>
                      {booking.type === "offline" ? "Book Offline Appointment" : "Book Online Consultation"}
                    </DialogTitle>
                    <DialogDescription>Select a therapist for your session</DialogDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {booking.day}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {booking.time}
                  </span>
                </div>
              </DialogHeader>

              <div className="py-4">
                {isLoadingTherapists ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading available therapists...</span>
                  </div>
                ) : availableTherapists.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No therapists available for this time slot.</p>
                    <p className="text-sm text-muted-foreground mt-1">Please select a different time.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground mb-4">
                      {availableTherapists.length} therapist{availableTherapists.length > 1 ? "s" : ""} available
                    </p>
                    {availableTherapists.map((slot) => (
                      <button
                        key={slot.therapist.id}
                        onClick={() => selectTherapist(slot.therapist)}
                        className="w-full p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {slot.therapist.first_name[0]}{slot.therapist.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-foreground">
                                {slot.therapist.title} {slot.therapist.first_name} {slot.therapist.last_name}
                              </h4>
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{slot.therapist.rating?.toFixed(2) || "N/A"}</span>
                                <span className="text-muted-foreground">({slot.therapist.total_reviews})</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {slot.therapist.specializations?.slice(0, 3).map((spec) => (
                                <Badge key={spec} variant="secondary" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {slot.therapist.bio}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>Cancel</Button>
              </DialogFooter>
            </>
          )}

          {booking.step === "form" && booking.type === "offline" && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle>Create Support Card</DialogTitle>
                    <DialogDescription>
                      Session with {booking.selectedTherapist?.title} {booking.selectedTherapist?.first_name} {booking.selectedTherapist?.last_name}
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {booking.day}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {booking.time}
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm text-foreground font-medium">Support Card</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This information helps your psychologist prepare for your session
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>How are you feeling right now? ({supportCard.currentMood}/10)</Label>
                    <Slider
                      value={[supportCard.currentMood]}
                      onValueChange={(value) => setSupportCard((prev) => ({ ...prev, currentMood: value[0] }))}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Very Low</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Current stress level ({supportCard.stressLevel}/10)</Label>
                    <Slider
                      value={[supportCard.stressLevel]}
                      onValueChange={(value) => setSupportCard((prev) => ({ ...prev, stressLevel: value[0] }))}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Low Stress</span>
                      <span>High Stress</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="challenges">Recent challenges</Label>
                    <Textarea
                      id="challenges"
                      placeholder="What challenges have you been facing recently?"
                      value={supportCard.recentChallenges}
                      onChange={(e) => setSupportCard((prev) => ({ ...prev, recentChallenges: e.target.value }))}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goals">What do you hope to achieve?</Label>
                    <Textarea
                      id="goals"
                      placeholder="Your goals for this session..."
                      value={supportCard.supportGoals}
                      onChange={(e) => setSupportCard((prev) => ({ ...prev, supportGoals: e.target.value }))}
                      className="min-h-[60px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Anything else you&apos;d like us to know..."
                      value={supportCard.additionalNotes}
                      onChange={(e) => setSupportCard((prev) => ({ ...prev, additionalNotes: e.target.value }))}
                      className="min-h-[60px]"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setBooking((prev) => ({ ...prev, step: "select-therapist" }))}>
                  Back
                </Button>
                <Button onClick={handleSupportCardSubmit} disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    "Create Support Card & Book"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}

          {booking.step === "form" && booking.type === "online" && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Video className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <DialogTitle>Book Online Consultation</DialogTitle>
                    <DialogDescription>
                      Session with {booking.selectedTherapist?.title} {booking.selectedTherapist?.first_name} {booking.selectedTherapist?.last_name}
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {booking.day}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {booking.time}
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">What would you like to discuss?</Label>
                  <Select
                    value={consultantForm.topic}
                    onValueChange={(value) => setConsultantForm((prev) => ({ ...prev, topic: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stress">Academic Stress</SelectItem>
                      <SelectItem value="relationships">Relationships</SelectItem>
                      <SelectItem value="anxiety">Anxiety & Worry</SelectItem>
                      <SelectItem value="depression">Low Mood</SelectItem>
                      <SelectItem value="sleep">Sleep Issues</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Preferred language</Label>
                  <Select
                    value={consultantForm.preferredLanguage}
                    onValueChange={(value) => setConsultantForm((prev) => ({ ...prev, preferredLanguage: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="polish">Polish</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultNotes">Additional notes (optional)</Label>
                  <Textarea
                    id="consultNotes"
                    placeholder="Anything else you&apos;d like us to know..."
                    value={consultantForm.additionalNotes}
                    onChange={(e) => setConsultantForm((prev) => ({ ...prev, additionalNotes: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setBooking((prev) => ({ ...prev, step: "select-therapist" }))}>
                  Back
                </Button>
                <Button onClick={handleConsultantSubmit} disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    "Book Consultation"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}

          {booking.step === "confirm" && confirmedAppointment && (
            <>
              <DialogHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <DialogTitle className="text-xl">Appointment Confirmed!</DialogTitle>
                <DialogDescription>
                  Your {confirmedAppointment.type === "offline" ? "in-person" : "online"} session has been booked
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4">
                <div className="p-4 rounded-lg bg-secondary">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Therapist</p>
                      <p className="font-medium">{confirmedAppointment.therapistName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">{confirmedAppointment.day}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time</p>
                      <p className="font-medium">{confirmedAppointment.time}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium">
                        {confirmedAppointment.type === "offline" ? "In-person Session" : "Video Call"}
                      </p>
                    </div>
                    {confirmedAppointment.location && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium">{confirmedAppointment.location}</p>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {confirmedAppointment.type === "offline"
                    ? "A confirmation has been sent to your profile. Please arrive 10 minutes early."
                    : "You will receive a video link 30 minutes before your session."}
                </p>
              </div>
              <DialogFooter className="justify-center">
                <Button onClick={closeDialog}>Done</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper function to convert 12-hour time to 24-hour format
function convertTo24Hour(time12: string): string {
  const [time, modifier] = time12.split(" ")
  let [hours, minutes] = time.split(":")

  if (hours === "12") {
    hours = modifier === "AM" ? "00" : "12"
  } else if (modifier === "PM") {
    hours = String(parseInt(hours, 10) + 12)
  }

  return `${hours.padStart(2, "0")}:${minutes || "00"}`
}

// Helper function to add an hour to time
function addHourToTime(time24: string): string {
  const [hours, minutes] = time24.split(":")
  const newHours = (parseInt(hours, 10) + 1) % 24
  return `${newHours.toString().padStart(2, "0")}:${minutes}`
}

// Helper function to get the next occurrence of a day of week
function getNextDateForDay(dayName: string): string {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  const targetDay = days.indexOf(dayName.toLowerCase())
  const today = new Date()
  const currentDay = today.getDay()
  
  let daysUntilTarget = targetDay - currentDay
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7
  }
  
  const targetDate = new Date(today)
  targetDate.setDate(today.getDate() + daysUntilTarget)
  
  return targetDate.toISOString().split("T")[0]
}
