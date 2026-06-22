import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kljdhkmxkbecgdwclqux.supabase.co'
const supabaseKey = 'sb_publishable_P-L2dwzgEZDhCtaLJGzvZw_0JJsK42-'

export const supabase = createClient(supabaseUrl, supabaseKey)