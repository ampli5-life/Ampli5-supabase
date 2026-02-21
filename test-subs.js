const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
fetch(`${url}/rest/v1/subscriptions?select=*`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
