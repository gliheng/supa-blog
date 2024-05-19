import { createClient } from '@supabase/supabase-js'

let supabase: ReturnType<typeof createClient>;
export function useSupabase() {
  if (supabase) return supabase;

  const { supabase: { project, anon } } = useAppConfig();
  const client = createClient(`https://${project}.supabase.co`, anon);
  supabase = client;
  return client;
}
