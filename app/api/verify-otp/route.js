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
    const { email, otp } = body

    if (!email || !otp) {
      return Response.json({ error: 'Email and verification code are required' }, { status: 400 })
    }

    // Call the security definer database function to check OTP & update profile status
    const { data: verified, error: rpcError } = await supabaseClient.rpc('verify_college_otp', {
      p_email: email,
      p_otp: otp.trim(),
    })

    if (rpcError) {
      console.error('Error executing verify_college_otp RPC:', rpcError)
      return Response.json({ error: 'Failed to verify verification code' }, { status: 500 })
    }

    if (!verified) {
      return Response.json({ success: false, error: 'Invalid or expired verification code' }, { status: 400 })
    }

    return Response.json({
      success: true,
      message: 'College email successfully verified! Awaiting administrator approval.',
    })
  } catch (err) {
    console.error('API verify-otp error:', err)
    return Response.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
