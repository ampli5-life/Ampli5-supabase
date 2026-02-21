import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

fetch(`${url}/rest/v1/subscriptions?select=*`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }
})
    .then(r => r.json())
    .then(data => {
        console.log('Subscriptions:', JSON.stringify(data, null, 2));
    })
    .catch(console.error);
