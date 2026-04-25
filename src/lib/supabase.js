import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("ERREUR CRITIQUE: Les clés Supabase sont introuvables. Vérifiez le fichier .env.local");
}

// Create a singleton to prevent the yellow GoTrueClient warning during development hot-reloads
const globalForSupabase = globalThis;

export const supabase =
  globalForSupabase.supabase ||
  createClient(supabaseUrl || "", supabaseKey || "");

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabase = supabase;
}