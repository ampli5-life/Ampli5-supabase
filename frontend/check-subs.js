const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '/Users/rohitarya/Desktop/Supabase/frontend/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Wait we don't have service role key in local .env?
// Let's just output the env to see if we can query it using curl
console.log(supabaseUrl)
