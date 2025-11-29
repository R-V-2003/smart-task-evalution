import { createClient } from '@supabase/supabase-js';

let cachedSupabase: any = null;

function initializeSupabase() {
  if (cachedSupabase) return cachedSupabase;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Check if credentials are configured (not using placeholder values)
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === 'your_supabase_url_here' || 
      supabaseAnonKey === 'your_supabase_anon_key_here') {
    return null;
  }
  
  try {
    cachedSupabase = createClient(supabaseUrl, supabaseAnonKey);
    return cachedSupabase;
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    return null;
  }
}

// Lazy proxy that initializes on first use
export const supabase = new Proxy({} as any, {
  get: (target, prop) => {
    const client = initializeSupabase();
    if (!client) {
      console.warn('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
      return null;
    }
    return (client as any)[prop];
  }
});

export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  code: string;
  language: string;
  created_at: string;
};

export type Evaluation = {
  id: string;
  task_id: string;
  user_id: string;
  score: number;
  strengths: string[];
  improvements: string[];
  full_report: string;
  is_paid: boolean;
  created_at: string;
};

export type Payment = {
  id: string;
  evaluation_id: string;
  user_id: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  stripe_payment_id: string;
  created_at: string;
};
