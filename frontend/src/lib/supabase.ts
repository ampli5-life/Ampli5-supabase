import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

// #region agent log
if (typeof fetch !== "undefined") fetch('http://127.0.0.1:7244/ingest/a06809ba-2f2d-4027-ad1b-0c709d05e1cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.ts:init',message:'Supabase env check',data:{hasUrl:!!supabaseUrl,hasAnonKey:!!supabaseAnonKey,urlPrefix:supabaseUrl ? supabaseUrl.slice(0,36)+'...' : ''},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
// #endregion

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getSupabaseUrl(): string {
  return supabaseUrl;
}
