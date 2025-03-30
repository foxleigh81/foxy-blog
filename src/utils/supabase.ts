import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Create a single supabase client for the entire app
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
);
