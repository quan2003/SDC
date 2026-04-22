const URL = 'https://kvzyihauypmwglksywtm.supabase.co/rest/v1/subjects?select=*&limit=1';
const KEY = 'YOUR_ANON_KEY'; // I will use fetch with the key from env

async function check() {
  try {
    const response = await fetch(URL, {
      headers: {
        'apikey': process.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
      }
    });
    const data = await response.json();
    console.log('--- SUBJECTS COLUMNS ---');
    if (data && data.length > 0) {
      console.log(Object.keys(data[0]).join(', '));
    } else {
      console.log('Table is empty, trying to get schema via PostgREST metadata...');
      // If table is empty, we might need another way or just guess.
    }
  } catch (e) {
    console.error(e);
  }
}
check();
