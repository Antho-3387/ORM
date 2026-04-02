import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ahlkrhnrkzxoxnrmnwjw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_n7zK3ovSUrKdn0xgwVzMNA_30O1UkCq'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
