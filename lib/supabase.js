import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://uzqlkufhmwycydquhpor.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6cWxrdWZobXd5Y3lkcXVocG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzYxMzcsImV4cCI6MjA3OTgxMjEzN30.airq3Eh7SCKMo8hrylJCt3FyP0drJGri6gXpjzb40EU"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)