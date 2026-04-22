
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kvzyihauypmwglksywtm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2enlpaGF1eXBtd2dsa3N5d3RtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjEzMzc3NywiZXhwIjoyMDkxNzA5Nzc3fQ.QaQBqm-CV9Tn0NPNNcdBmVsL1DzSJxhf-uD-hvJMSsg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCols() {
  const { data, error } = await supabase.from('certificate_classes').insert([{code: 'DEBUG2', name: 'DEBUG2'}]).select()
  if (data && data.length > 0) {
    Object.keys(data[0]).forEach(k => console.log('COL_NAME:', k))
    await supabase.from('certificate_classes').delete().eq('code', 'DEBUG2')
  } else {
    console.error(error)
  }
}

checkCols()
