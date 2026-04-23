import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// USE_MOCK: fallback to demo data when env vars are missing
export const USE_MOCK = !supabaseUrl || !supabaseKey;

// Use localStorage adapter to avoid IndexedDB Web Locks conflicts
// (fixes: "AbortError: Lock broken by another request with the 'steal' option")
const localStorageAdapter = {
  getItem: (key) => {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  setItem: (key, value) => {
    try { localStorage.setItem(key, value); } catch {}
  },
  removeItem: (key) => {
    try { localStorage.removeItem(key); } catch {}
  },
};

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: localStorageAdapter,
        storageKey: 'sdc-supabase-auth',
        lock: undefined, // Disable Web Locks, prevents IndexedDB lock conflicts
      },
    })
  : null;

// Secondary client specifically for Admin powers (bypasses RLS)
// DO NOT use this for normal user operations, ONLY for creating/deleting accounts
export const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        storage: localStorageAdapter,
        storageKey: 'sdc-supabase-admin-auth',
        lock: undefined, // Disable Web Locks
      }
    })
  : null;

export default supabase;
