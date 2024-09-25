// With `output: 'hybrid'` configured:
export const prerender = false;
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const { file_name, image_url } = await request.json();

  if (!file_name || !image_url) {
    return new Response(JSON.stringify({ error: 'Invalid data received' }), { status: 400 });
  }

  // Insert the image into the gallery-display table
  const { error: insertError } = await supabase.from('gallery-display').insert([{ image_url, file_name }]);

  if (insertError) {
    return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
  }

  // Remove the image from the gallery-storage table
  const { error: deleteError } = await supabase.from('gallery-storage').delete().match({ file_name });

  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
