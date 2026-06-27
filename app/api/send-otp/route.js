import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return Response.json({ error: 'Missing Authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: authHeader } },
    })

    // Verify token and fetch user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      return Response.json({ error: 'Invalid authentication token' }, { status: 401 })
    }

    const body = await request.json()
    const { email } = body

    if (!email || !email.includes('@')) {
      return Response.json({ error: 'A valid email address is required' }, { status: 400 })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes expiry

    // Delete any old OTPs for this user
    await supabaseClient
      .from('college_verifications')
      .delete()
      .eq('user_id', user.id)

    // Insert new OTP
    const { error: insertError } = await supabaseClient
      .from('college_verifications')
      .insert({
        user_id: user.id,
        official_email: email,
        otp: otp,
        expires_at: expiresAt,
      })

    if (insertError) {
      console.error('Error inserting OTP into DB:', insertError)
      return Response.json({ error: 'Failed to record verification code' }, { status: 500 })
    }

    // Log to console so that it is visible in terminal logs
    console.log(`
============================================================
[OTP SEND] College email verification OTP:
User: ${user.email} (${user.id})
Target College Email: ${email}
Verification Code (OTP): ${otp}
Expires At: ${expiresAt}
============================================================
    `)

    // Return success. Include the OTP in response body for development purposes.
    return Response.json({
      success: true,
      message: 'OTP sent to your college email (logged to server console)',
      devOtp: otp, // Development convenience helper
    })
  } catch (err) {
    console.error('API send-otp error:', err)
    return Response.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
