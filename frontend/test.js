import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/rohitarya/Desktop/Supabase/frontend/.env' });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function run() {
  const { data: { session }, error } = await supabase.auth.signInWithPassword({
    email: 'test200@test.com',
    password: 'test123456'
  });
  
  if (error) { console.error('Sign in failed', error.message); return; }
  
  console.log('Inserting sub for', session.user.id);
  const { error: insErr } = await supabase.from('subscriptions').insert({
    user_id: session.user.id,
    stripe_subscription_id: 'sub_test_debug_' + Date.now(),
    plan_id: 'silver',
    status: 'ACTIVE'
  });
  console.log('Insert error:', insErr);
}
run();
