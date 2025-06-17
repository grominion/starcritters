import { createClient } from '@supabase/supabase-js'

// Les informations de connexion de notre Supabase local (celles de 'supabase start')
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// On crée et on exporte le "téléphone" Supabase pour l'utiliser dans toute l'application
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
