import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Variables d'environnement Supabase manquantes (URL ou Anon Key). Assurez-vous d'avoir un fichier .env.local correct.");
}

// On crée et on exporte le "téléphone" Supabase pour l'utiliser dans toute l'application
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
