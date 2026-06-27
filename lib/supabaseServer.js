import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const isValidUrl = (url) => {
  try {
    new URL(url)
    return url.startsWith('http')
  } catch {
    return false
  }
}

const isValidSupabase = isValidUrl(supabaseUrl) && supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'

export async function createClient() {
  if (!isValidSupabase) {
    return {
      auth: {
        exchangeCodeForSession: async () => ({ data: { session: null, user: null }, error: new Error('Supabase URL not configured') }),
        getUser: async () => ({ data: { user: null }, error: new Error('Supabase URL not configured') }),
        getSession: async () => ({ data: { session: null }, error: new Error('Supabase URL not configured') }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: { code: 'PGRST116', message: 'Supabase URL not configured' } }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: new Error('Supabase URL not configured') }),
          }),
        }),
      }),
    }
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch (err) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if middleware is refreshing sessions.
        }
      },
    },
  })
}
