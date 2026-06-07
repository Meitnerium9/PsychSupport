"use server"

import { createClient } from "@/lib/supabase/server"

export interface Therapist {
  id: string
  first_name: string
  last_name: string
  title: string | null
  specializations: string[]
  bio: string | null
  avatar_url: string | null
  is_online_available: boolean
  is_offline_available: boolean
  office_location: string | null
  rating: number
  total_reviews: number
}

export interface TherapistAvailability {
  id: string
  therapist_id: string
  day_of_week: string
  start_time: string
  end_time: string
  meeting_type: "online" | "offline"
  slot_duration_minutes: number
}

export interface AvailableSlot {
  therapist: Therapist
  availability: TherapistAvailability
}

/**
 * Server Action: getAvailableTherapists
 * 
 * Fetches therapists available for a specific day and time slot.
 */
export async function getAvailableTherapists(
  dayOfWeek: string,
  timeSlot: string,
  meetingType: "online" | "offline"
): Promise<{ success: boolean; data?: AvailableSlot[]; error?: string }> {
  try {
    const supabase = await createClient()

    // Convert day name to lowercase for database enum
    const dayLower = dayOfWeek.toLowerCase()

    // Parse time slot (e.g., "9:00 AM" -> "09:00")
    const time24 = convertTo24Hour(timeSlot)

    // Fetch availability that matches the day and time
    const { data: availabilities, error: availError } = await supabase
      .from("therapist_availability")
      .select(`
        id,
        therapist_id,
        day_of_week,
        start_time,
        end_time,
        meeting_type,
        slot_duration_minutes
      `)
      .eq("day_of_week", dayLower)
      .eq("meeting_type", meetingType)
      .eq("is_available", true)
      .lte("start_time", time24)
      .gt("end_time", time24)

    if (availError) {
      console.error("[Server Action] Availability fetch error:", availError.message)
      return { success: false, error: availError.message }
    }

    if (!availabilities || availabilities.length === 0) {
      return { success: true, data: [] }
    }

    // Get therapist IDs
    const therapistIds = availabilities.map((a) => a.therapist_id)

    // Fetch therapist details
    const { data: therapists, error: therapistError } = await supabase
      .from("therapists")
      .select(`
        id,
        first_name,
        last_name,
        title,
        specializations,
        bio,
        avatar_url,
        is_online_available,
        is_offline_available,
        office_location,
        rating,
        total_reviews
      `)
      .in("id", therapistIds)
      .eq("status", "active")

    if (therapistError) {
      console.error("[Server Action] Therapist fetch error:", therapistError.message)
      return { success: false, error: therapistError.message }
    }

    // Combine therapists with their availability
    const availableSlots: AvailableSlot[] = availabilities
      .map((availability) => {
        const therapist = therapists?.find((t) => t.id === availability.therapist_id)
        if (!therapist) return null
        return {
          therapist: therapist as Therapist,
          availability: availability as TherapistAvailability,
        }
      })
      .filter((slot): slot is AvailableSlot => slot !== null)

    return { success: true, data: availableSlots }
  } catch (error) {
    console.error("[Server Action] Unexpected error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

/**
 * Server Action: createAppointment
 * 
 * Books a new appointment with a therapist.
 */
export async function createAppointment(
  therapistId: string,
  appointmentDate: string, // YYYY-MM-DD format
  startTime: string, // HH:MM format
  endTime: string, // HH:MM format
  meetingType: "online" | "offline",
  notes?: string
): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "You must be logged in to book an appointment" }
    }

    // Get therapist details for meeting link/office address
    const { data: therapist, error: therapistError } = await supabase
      .from("therapists")
      .select("office_location")
      .eq("id", therapistId)
      .single()

    if (therapistError) {
      console.error("[Server Action] Therapist fetch error:", therapistError.message)
      return { success: false, error: "Failed to fetch therapist details" }
    }

    // Create appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        user_id: user.id,
        therapist_id: therapistId,
        appointment_date: appointmentDate,
        start_time: startTime,
        end_time: endTime,
        meeting_type: meetingType,
        status: "scheduled",
        meeting_link: meetingType === "online" ? `https://meet.psychsupport.edu/session/${crypto.randomUUID().substring(0, 8)}` : null,
        office_address: meetingType === "offline" ? therapist?.office_location : null,
        notes: notes || null,
      })
      .select("id")
      .single()

    if (appointmentError) {
      console.error("[Server Action] Appointment creation error:", appointmentError.message)
      return { success: false, error: appointmentError.message }
    }

    return { success: true, appointmentId: appointment.id }
  } catch (error) {
    console.error("[Server Action] Unexpected error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

/**
 * Server Action: createSupportCard
 * 
 * Creates a support card for an appointment.
 */
export async function createSupportCard(
  title: string,
  currentMood: number,
  stressLevel: number,
  recentChallenges: string,
  supportGoals: string,
  additionalNotes?: string
): Promise<{ success: boolean; supportCardId?: string; error?: string }> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "You must be logged in to create a support card" }
    }

    // Create support card
    const { data: supportCard, error: supportCardError } = await supabase
      .from("support_cards")
      .insert({
        user_id: user.id,
        title,
        current_mood: currentMood,
        stress_level: stressLevel,
        recent_challenges: recentChallenges,
        support_goals: supportGoals,
        additional_notes: additionalNotes || null,
        is_active: true,
      })
      .select("id")
      .single()

    if (supportCardError) {
      console.error("[Server Action] Support card creation error:", supportCardError.message)
      return { success: false, error: supportCardError.message }
    }

    return { success: true, supportCardId: supportCard.id }
  } catch (error) {
    console.error("[Server Action] Unexpected error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

/**
 * Server Action: getAllAvailability
 * 
 * Fetches all therapist availability for displaying the calendar grid.
 */
export async function getAllAvailability(): Promise<{
  success: boolean
  data?: { day: string; time: string; type: "online" | "offline"; count: number }[]
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { data: availabilities, error } = await supabase
      .from("therapist_availability")
      .select(`
        day_of_week,
        start_time,
        end_time,
        meeting_type,
        therapist_id
      `)
      .eq("is_available", true)

    if (error) {
      console.error("[Server Action] Availability fetch error:", error.message)
      return { success: false, error: error.message }
    }

    // Process availability into time slots
    const slotMap = new Map<string, { type: "online" | "offline"; count: number }>()

    availabilities?.forEach((avail) => {
      const startHour = parseInt(avail.start_time.split(":")[0])
      const endHour = parseInt(avail.end_time.split(":")[0])

      for (let hour = startHour; hour < endHour; hour++) {
        const time12 = convertTo12Hour(`${hour.toString().padStart(2, "0")}:00`)
        const key = `${avail.day_of_week}-${time12}`
        
        const existing = slotMap.get(key)
        if (existing) {
          existing.count += 1
        } else {
          slotMap.set(key, { type: avail.meeting_type as "online" | "offline", count: 1 })
        }
      }
    })

    const result = Array.from(slotMap.entries()).map(([key, value]) => {
      const [day, time] = key.split("-")
      return {
        day: day.charAt(0).toUpperCase() + day.slice(1),
        time,
        type: value.type,
        count: value.count,
      }
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("[Server Action] Unexpected error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
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

// Helper function to convert 24-hour time to 12-hour format
function convertTo12Hour(time24: string): string {
  const [hoursStr, minutes] = time24.split(":")
  let hours = parseInt(hoursStr, 10)
  const modifier = hours >= 12 ? "PM" : "AM"
  
  if (hours === 0) {
    hours = 12
  } else if (hours > 12) {
    hours -= 12
  }
  
  return `${hours}:${minutes} ${modifier}`
}
