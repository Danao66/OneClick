import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Netlify Scheduled Function — runs every 5 minutes
// Prevents Supabase free-tier cold starts
export default async (req) => {
  try {
    const start = Date.now();
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const duration = Date.now() - start;
    console.log(`[keep-alive] Supabase ping OK — ${duration}ms, profiles: ${count}`);

    return new Response(JSON.stringify({ status: 'ok', duration, count }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[keep-alive] Supabase ping FAILED:', err.message);
    return new Response(JSON.stringify({ status: 'error', message: err.message }), {
      status: 500,
    });
  }
};

export const config = {
  schedule: '*/5 * * * *',
};
