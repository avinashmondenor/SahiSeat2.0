import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return url.startsWith('http')
  } catch {
    return false
  }
}

const isValidSupabase = isValidUrl(supabaseUrl) && supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'

export const supabase = isValidSupabase
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : ({
      auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithOAuth: async () => ({ error: new Error('Supabase URL not configured') }),
        signInWithOtp: async () => ({ error: new Error('Supabase URL not configured') }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: new Error('Supabase URL not configured') }),
          }),
        }),
        update: () => ({
          eq: async () => ({ error: new Error('Supabase URL not configured') }),
        }),
      }),
    } as any)
