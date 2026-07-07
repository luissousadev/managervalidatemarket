import { createClient } from "@supabase/supabase-js";

// Cliente único do Supabase, compartilhado por todos os services.
// As credenciais ficam em .env.local (NEXT_PUBLIC_* para uso no navegador).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
