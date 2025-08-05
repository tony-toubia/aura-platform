// apps/web/app/api/oauth-connections/route.ts

import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server.server"
import { SubscriptionService } from "@/lib/services/subscription-service"
import type { NextRequest } from "next/server"
import { AVAILABLE_SENSES } from "@/lib/constants"

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substring(7)
  
  console.log(`[${timestamp}] [${requestId}] 🚀 POST /api/oauth-connections - REQUEST RECEIVED`)
  
  let body
  try {
    body = await req.json()
  } catch (parseError) {
    console.error(`[${timestamp}] [${requestId}] ❌ Failed to parse request body:`, parseError)
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
  }
  
  const { provider, sense_type, provider_user_id, access_token, refresh_token, expires_at, scope, aura_id, device_info, use_library = true } = body
  
  console.log(`[${timestamp}] [${requestId}] 📋 Request details:`, {
    provider,
    sense_type,
    provider_user_id: provider_user_id ? '***' : null,
    hasAccessToken: !!access_token,
    hasRefreshToken: !!refresh_token,
    aura_id,
    use_library,
    hasDeviceInfo: !!device_info,
    deviceInfoKeys: device_info ? Object.keys(device_info) : [],
    bodyKeys: Object.keys(body),
    contentType: req.headers.get('content-type'),
    userAgent: req.headers.get('user-agent')?.substring(0, 50) + '...'
  })

  // Basic validation
  if (!provider || !sense_type || !access_token) {
    console.log(`[${timestamp}] [${requestId}] ❌ Validation failed - missing required fields`)
    return NextResponse.json(
      { error: "Missing required fields: provider, sense_type, access_token" },
      { status: 400 }
    )
  }

  const supabase = await createServerSupabase()
  
  // Get current user for authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // Check if the sense_type is a premium sense and if the user has access
  const senseData = AVAILABLE_SENSES.find(s => s.id === sense_type)
  const isPremiumSense = senseData?.tier === 'Premium'
  console.log(`[${timestamp}] [${requestId}] 🔍 Premium sense check:`, {
    sense_type,
    isPremiumSense,
    senseData,
    tier: senseData?.tier
  })
  
  if (isPremiumSense) {
    console.log(`[${timestamp}] [${requestId}] 🔍 Checking subscription access for premium sense...`)
    
    // Get user subscription details for debugging
    const userSubscription = await SubscriptionService.getUserSubscription(user.id, supabase)
    console.log(`[${timestamp}] [${requestId}] 📋 User subscription:`, {
      userId: user.id,
      subscriptionTier: userSubscription.id,
      subscriptionName: userSubscription.name,
      hasPersonalConnectedSenses: userSubscription.features.hasPersonalConnectedSenses,
      availableSenses: userSubscription.features.availableSenses
    })
    
    const hasPersonalConnectedSenses = await SubscriptionService.checkFeatureAccess(user.id, 'hasPersonalConnectedSenses', supabase)
    console.log(`[${timestamp}] [${requestId}] 🔍 Feature access check result:`, {
      hasPersonalConnectedSenses,
      subscriptionFeatures: userSubscription.features
    })
    
    if (!hasPersonalConnectedSenses) {
      console.log(`[${timestamp}] [${requestId}] ❌ User ${user.id} attempted to connect premium sense ${sense_type} without access.`)
      return NextResponse.json(
        { error: "Upgrade your plan to enable personal connected senses." },
        { status: 403 }
      )
    }
    
    console.log(`[${timestamp}] [${requestId}] ✅ User has access to premium sense ${sense_type}`)
  }

  try {
    // Check for existing library connection first (if use_library is true)
    if (use_library) {
      const { data: existingLibraryConnection } = await supabase
        .from("oauth_connections")
        .select("id")
        .eq("user_id", user.id)
        .eq("provider", provider)
        .eq("sense_type", sense_type)
        .is("aura_id", null) // Library connection
        .single()

      if (existingLibraryConnection && aura_id) {
        console.log(`[${timestamp}] [${requestId}] 🔄 Found existing library connection, creating association with aura: ${aura_id}`)
        
        // Try to use junction table first
        try {
          // Check if association already exists
          const { data: existingAssociation } = await supabase
            .from("aura_oauth_connections")
            .select("id")
            .eq("connection_id", existingLibraryConnection.id)
            .eq("aura_id", aura_id)
            .single()

          if (!existingAssociation) {
            // Create association
            const { data: _association, error: associationError } = await supabase
              .from("aura_oauth_connections")
              .insert({
                connection_id: existingLibraryConnection.id,
                aura_id: aura_id
              })
              .select()
              .single()

            if (associationError) {
              console.error(`[${timestamp}] [${requestId}] ❌ Failed to create association:`, associationError)
              // Don't return error - fall through to create new connection
            } else {
              console.log(`[${timestamp}] [${requestId}] ✅ Successfully associated existing library connection with aura`)
              return NextResponse.json({
                id: existingLibraryConnection.id,
                association_id: _association.id,
                is_library_connection: true
              }, { status: 200 })
            }
          } else {
            console.log(`[${timestamp}] [${requestId}] ⚠️ Association already exists`)
            return NextResponse.json(
              { error: "Connection already associated with this aura" },
              { status: 409 }
            )
          }
        } catch (tableError) {
          console.log(`[${timestamp}] [${requestId}] Junction table not available, will create direct connection`)
        }
      }
    }

    // Check for existing direct connection for this user/provider/sense combination
    const { data: existingConnection } = await supabase
      .from("oauth_connections")
      .select("id, aura_id")
      .eq("user_id", user.id)
      .eq("provider", provider)
      .eq("sense_type", sense_type)
      .not("aura_id", "is", null) // Only direct connections
      .single()

    if (existingConnection) {
      // If connection exists and we're trying to associate it with a specific aura
      if (aura_id && existingConnection.aura_id !== aura_id) {
        console.log(`[${timestamp}] [${requestId}] 🔄 Updating existing connection to associate with aura: ${aura_id}`)
        
        // Update the existing connection to associate it with the new aura
        const { data: updatedConnection, error: updateError } = await supabase
          .from("oauth_connections")
          .update({ aura_id: aura_id })
          .eq("id", existingConnection.id)
          .select()
          .single()

        if (updateError) {
          console.error(`[${timestamp}] [${requestId}] ❌ Failed to update OAuth connection:`, updateError)
          return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        console.log(`[${timestamp}] [${requestId}] ✅ Successfully updated OAuth connection with ID: ${updatedConnection.id}`)
        return NextResponse.json(updatedConnection, { status: 200 })
      } else {
        // Connection already exists for this aura or no aura specified
        console.log(`[${timestamp}] [${requestId}] ⚠️ Connection already exists`)
        return NextResponse.json(
          { error: "Connection already exists for this provider and account" },
          { status: 409 }
        )
      }
    }

    // Determine where to store the new connection
    const shouldStoreInLibrary = use_library && !aura_id
    const targetAuraId = shouldStoreInLibrary ? null : aura_id

    // Insert new OAuth connection
    const insertData = {
      user_id: user.id,
      provider,
      provider_user_id: provider_user_id || provider,
      sense_type,
      access_token,
      refresh_token,
      expires_at: expires_at ? new Date(expires_at).toISOString() : null,
      scope,
      aura_id: targetAuraId, // null for library, specific aura_id for direct connection
      device_info: device_info || null, // Store device information for location connections
    }
    
    console.log(`[${timestamp}] [${requestId}] 💾 Inserting OAuth connection:`, {
      ...insertData,
      access_token: '***',
      refresh_token: insertData.refresh_token ? '***' : null,
      is_library_connection: shouldStoreInLibrary,
      device_info: insertData.device_info ? {
        browser: insertData.device_info.browser,
        os: insertData.device_info.os,
        platform: insertData.device_info.platform
      } : null
    })
    
    const { data: connection, error: insertError } = await supabase
      .from("oauth_connections")
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      console.error(`[${timestamp}] [${requestId}] ❌ Failed to create OAuth connection:`, {
        error: insertError,
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      })
      
      // Provide more specific error messages
      if (insertError.code === '23505') {
        return NextResponse.json({
          error: "This connection already exists. Please try disconnecting and reconnecting.",
          code: insertError.code
        }, { status: 409 })
      }
      
      return NextResponse.json({
        error: insertError.message || "Failed to save connection",
        code: insertError.code,
        details: insertError.details
      }, { status: 500 })
    }

    // If we created a library connection and have an aura_id, create the association
    if (shouldStoreInLibrary && aura_id) {
      const { data: association, error: associationError } = await supabase
        .from("aura_oauth_connections")
        .insert({
          connection_id: connection.id,
          aura_id: aura_id
        })
        .select()
        .single()

      if (associationError) {
        console.error(`[${timestamp}] [${requestId}] ❌ Failed to create association for new library connection:`, associationError)
        // Don't fail the whole request, just log the error
      } else {
        console.log(`[${timestamp}] [${requestId}] ✅ Successfully created association for new library connection`)
      }
    }

    console.log(`[${timestamp}] [${requestId}] ✅ Successfully created OAuth connection with ID: ${connection.id}`)
    return NextResponse.json({
      ...connection,
      is_library_connection: shouldStoreInLibrary
    }, { status: 201 })
  } catch (error) {
    console.error(`[${timestamp}] [${requestId}] ❌ Unexpected error creating OAuth connection:`, error)
    
    // Provide more specific error messages based on the error type
    let errorMessage = "An unexpected error occurred"
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as any).message
    } else if (error && typeof error === 'object' && 'code' in error) {
      // Handle specific database error codes
      const errorCode = (error as any).code
      switch (errorCode) {
        case '23505': // unique_violation
          errorMessage = "A connection with these details already exists"
          break
        case '23503': // foreign_key_violation
          errorMessage = "Invalid aura or user reference"
          break
        case '23514': // check_violation
          errorMessage = "Invalid connection data provided"
          break
        default:
          errorMessage = `Database error: ${errorCode}`
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase()
  
  // Get current user for authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    // Get query parameters
    const { searchParams } = new URL(req.url)
    const auraId = searchParams.get('aura_id')
    const includeLibrary = searchParams.get('include_library') === 'true'

    if (auraId) {
      // Use the database function to get all connections for an aura (direct + library)
      const { data: connections, error } = await supabase
        .rpc('get_aura_oauth_connections', { aura_uuid: auraId })

      if (error) {
        console.error("Failed to fetch aura OAuth connections:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(connections || [])
    } else {
      // Get all connections for the user
      let query = supabase
        .from("oauth_connections")
        .select("*")
        .eq("user_id", user.id)

      if (!includeLibrary) {
        // Exclude library connections (aura_id IS NOT NULL)
        query = query.not("aura_id", "is", null)
      }

      const { data: connections, error } = await query
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Failed to fetch OAuth connections:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(connections || [])
    }
  } catch (error) {
    console.error("Unexpected error fetching OAuth connections:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}