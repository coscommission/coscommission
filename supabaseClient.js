// supabaseClient.js
const SUPABASE_URL = "https://yqxhungbzarfrccpbohy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxeGh1bmdiemFyZnJjY3Bib2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMTc2MjQsImV4cCI6MjA4Mjg5MzYyNH0.ySCcPDOIGx-XJ0GIHhFzIAQtbhlZTj6rBzXk1pseaY8";

window.supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
