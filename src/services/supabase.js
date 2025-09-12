import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a mock client if environment variables are not set
let supabase = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  })
} else {
  console.warn('Supabase environment variables not configured. Using mock data for development.')
  // Create a mock client that throws errors for any operation
  supabase = {
    from: () => ({
      select: () => ({ error: new Error('Supabase not configured') }),
      insert: () => ({ error: new Error('Supabase not configured') }),
      update: () => ({ error: new Error('Supabase not configured') }),
      delete: () => ({ error: new Error('Supabase not configured') })
    }),
    auth: {
      signInAnonymously: () => ({ error: new Error('Supabase not configured') })
    },
    rpc: () => ({ error: new Error('Supabase not configured') })
  }
}

export { supabase }

// Function to check if Supabase is properly connected
export const checkSupabaseConnection = async () => {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not configured')
    return { 
      connected: false,
      error: 'Supabase environment variables not configured'
    }
  }

  try {
    // Try to query a simple table to test the connection
    const { error } = await supabase
      .from('categories')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection test failed:', error)
      return {
        connected: false,
        error: error.message
      }
    }
    
    return { connected: true }
  } catch (error) {
    console.error('Error testing Supabase connection:', error)
    return {
      connected: false,
      error: error.message
    }
  }
}

// Enable anonymous auth for likes functionality
export const signInAnonymously = async () => {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured, skipping anonymous auth')
    return null
  }

  try {
    // Since anonymous sign-ins are disabled, we'll use a guest ID from localStorage instead
    let guestId = localStorage.getItem('blog_guest_id')
    
    if (!guestId) {
      // Create a random ID for the guest if none exists
      guestId = crypto.randomUUID()
      localStorage.setItem('blog_guest_id', guestId)
    }
    
    return { user: { id: guestId } }
  } catch (error) {
    console.error('Error with guest authentication:', error)
    return null
  }
}

export default supabase