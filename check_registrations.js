import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ocvstogswdggbhyojwyg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jdnN0b2dzd2RnZ2JoeW9qd3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODIzODkzODIsImV4cCI6MjAwNzk2NTM4Mn0.cdBmVsL1DzSJxhf-uD-hvJMSsg";
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  const { data, error } = await supabase.from('registrations').select('full_name').limit(10)
  if (error) console.error(error)
  else console.log('Registrations in DB:', data)
}
check()
