export const prerender = false;
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async function get() {
  const { data: images, error } = await supabase.from('gallery-storage').select('image_url, file_name');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(images), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
