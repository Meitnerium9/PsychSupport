"use server"

import { createClient } from "@/lib/supabase/server"

export interface SaveAnonymousSessionResult {
  success: boolean
  anonymousId?: string
  error?: string
}

/**
 * Server Action: saveAnonymousUserSession
 * 
 * Creates an anonymous user session in the database.
 * This is a real async backend operation that inserts/updates
 * the anonymous ID in the profiles table via Supabase.
 * 
 * @returns Promise<SaveAnonymousSessionResult> - Result object with success status and anonymousId or error
 */
export async function saveAnonymousUserSession(): Promise<SaveAnonymousSessionResult> {
  try {
    const supabase = await createClient()
    
    // Generate a unique anonymous email and password for this session
    const timestamp = Date.now()
    const randomPart = Math.random().toString(36).substring(2, 15)
    const anonymousEmail = `anon-${timestamp}-${randomPart}@anonymous.psychsupport.local`
    const anonymousPassword = `anon-${randomPart}-${timestamp}-${Math.random().toString(36).substring(2, 10)}`
    
    // Create the anonymous user in Supabase Auth
    // The database trigger will automatically create the profile with anonymous_id
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: anonymousEmail,
      password: anonymousPassword,
      options: {
        data: {
          is_registered: false,
        },
      },
    })

    if (authError) {
      console.error("[Server Action] Auth error:", authError.message)
      return {
        success: false,
        error: authError.message,
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Failed to create anonymous user session",
      }
    }

    // The profile with anonymous_id is created automatically by the database trigger
    // Fetch the generated anonymous_id from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("anonymous_id")
      .eq("id", authData.user.id)
      .single()

    if (profileError) {
      console.error("[Server Action] Profile fetch error:", profileError.message)
      // Even if we can't fetch the profile, the user was created
      // Generate a fallback anonymous ID
      const fallbackId = `ANON-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      return {
        success: true,
        anonymousId: fallbackId,
      }
    }

    return {
      success: true,
      anonymousId: profile.anonymous_id,
    }
  } catch (error) {
    console.error("[Server Action] Unexpected error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

/**
 * Server Action: signInUser
 * 
 * Signs in a registered user with email and password.
 */
export async function signInUser(email: string, password: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    if (!data.user) {
      return {
        success: false,
        error: "Failed to sign in",
      }
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("anonymous_id, is_registered, first_name, last_name")
      .eq("id", data.user.id)
      .single()

    return {
      success: true,
      userId: data.user.id,
      isRegistered: profile?.is_registered ?? true,
      anonymousId: profile?.anonymous_id,
      firstName: profile?.first_name,
      lastName: profile?.last_name,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

/**
 * Server Action: registerUser
 * 
 * Registers a new user with full profile information.
 */
export async function registerUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone: string,
  studentId: string
) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? 
          `${process.env.NEXT_PUBLIC_SITE_URL || ""}/auth/callback`,
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          student_id: studentId,
          is_registered: true,
        },
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      userId: data.user?.id,
      emailConfirmationRequired: true,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}
