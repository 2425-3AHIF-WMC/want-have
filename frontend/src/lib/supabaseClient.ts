// ─────────────────────────────────────────────────────────────────────────────
// Dateipfad: src/lib/supabaseClient.ts
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

// Weil deine .env.local REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY enthält,
// greift supabaseClient hier auf process.env.REACT_APP_* zu:
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Kurze Debug-Ausgabe:
console.log("▸ REACT_APP_SUPABASE_URL:", supabaseUrl);
console.log("▸ REACT_APP_SUPABASE_ANON_KEY:", supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        "❌ REACT_APP_SUPABASE_URL oder REACT_APP_SUPABASE_ANON_KEY fehlt. Bitte .env.local prüfen"
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
