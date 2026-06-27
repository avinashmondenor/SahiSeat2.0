import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const roleParam = searchParams.get('role') // 'student' or 'senior'
  const next = searchParams.get('next')

  // Check if there is an error from the OAuth provider (e.g. access_denied)
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    console.error('OAuth redirect error:', error, errorDescription)
    return NextResponse.redirect(
      `${origin}/?auth_error=OAuthError&message=${encodeURIComponent(errorDescription || error)}`
    )
  }

  if (!code) {
    console.error('No authorization code provided in callback')
    return NextResponse.redirect(
      `${origin}/?auth_error=CallbackError&message=${encodeURIComponent('No authorization code returned from provider')}`
    )
  }

  try {
    const supabase = await createClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Code exchange failed:', exchangeError)
      return NextResponse.redirect(
        `${origin}/?auth_error=SessionCreationError&message=${encodeURIComponent(exchangeError.message)}`
      )
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('Failed to get user after code exchange:', userError)
      return NextResponse.redirect(
        `${origin}/?auth_error=SessionError&message=${encodeURIComponent('Could not retrieve user details after session creation')}`
      )
    }

    // Retrieve the user profile or create it if not exists (with settle retries)
    let profile = null
    let existingProfile = null
    let profileError = null

    // Attempt to query profiles with a short delay retry to let the DB trigger settle
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!res.error && res.data) {
        existingProfile = res.data
        profileError = null
        break
      }

      profileError = res.error
      if (res.error && res.error.code !== 'PGRST116') {
        break
      }

      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 150))
      }
    }

    if (profileError && profileError.code === 'PGRST116') {
      // Profile does not exist, create it
      const newProfile = {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
        email: user.email || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        phone: '',
        college: '',
        target_college: '',
        branch: '',
        year: 'Pre-college',
        role: 'student', // default role
        verification_status: 'unverified',
        official_email: '',
      }

      const { data: insertedProfile, error: insertError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single()

      if (insertError) {
        if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
          // If insert failed due to duplicate key, the profile was created concurrently. Refetch it.
          const { data: refetchedProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (refetchedProfile) {
            profile = refetchedProfile
          } else {
            profile = newProfile
          }
        } else {
          console.warn('Silent fallback on inserting user profile in callback:', insertError)
          profile = newProfile
        }
      } else {
        profile = insertedProfile
      }
    } else if (existingProfile) {
      profile = existingProfile
    } else {
      console.warn('Profile query failed in callback:', profileError)
      profile = {
        id: user.id,
        role: 'student',
        verification_status: 'unverified'
      }
    }

    // Determine correct redirect target
    let targetPath = '/'

    if (profile.role === 'admin') {
      targetPath = '/admin'
    } else if (profile.role === 'senior') {
      targetPath = '/senior'
    } else {
      // User is a student:
      // If we passed role=senior in searchParams (meaning they clicked Verified Senior during login)
      // OR they already have verification status that is not unverified
      if (roleParam === 'senior' || profile.verification_status !== 'unverified') {
        targetPath = '/senior'
      } else {
        targetPath = '/'
      }
    }

    if (next) {
      try {
        const nextUrl = new URL(next, origin)
        if (nextUrl.origin === origin) {
          targetPath = nextUrl.pathname + nextUrl.search
        }
      } catch (err) {
        console.warn('Invalid next redirect URL:', err)
      }
    }

    return NextResponse.redirect(`${origin}${targetPath}`)
  } catch (err) {
    console.error('Callback handler exception:', err)
    return NextResponse.redirect(
      `${origin}/?auth_error=RedirectError&message=${encodeURIComponent(err.message || 'Internal server error during authentication')}`
    )
  }
}
