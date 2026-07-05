import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kljdhkmxkbecgdwclqux.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_P-L2dwzgEZDhCtaLJGzvZw_0JJsK42-'

export const supabase = createClient(supabaseUrl, supabaseKey)