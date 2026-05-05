// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_PUBLISHABLE_KEY = import.meta.env
  .VITE_SUPABASE_PUBLISHABLE_KEY as string

// Implement in-memory storage fallback for restricted browsers/incognito mode
class MemoryStorage {
  private store = new Map<string, string>()
  getItem(key: string) {
    return this.store.get(key) || null
  }
  setItem(key: string, value: string) {
    this.store.set(key, value)
  }
  removeItem(key: string) {
    this.store.delete(key)
  }
  clear() {
    this.store.clear()
  }
}

const getStorage = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const testKey = '__supabase_test_key__'
      window.localStorage.setItem(testKey, testKey)
      window.localStorage.removeItem(testKey)
      return window.localStorage
    }
  } catch (error) {
    console.warn(
      'localStorage is blocked or unavailable, falling back to memory storage. Error:',
      error,
    )
  }
  return new MemoryStorage()
}

// Import the supabase client like this:
// import { supabase } from "@/lib/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: getStorage(),
      persistSession: true,
      autoRefreshToken: true,
    },
  },
)
