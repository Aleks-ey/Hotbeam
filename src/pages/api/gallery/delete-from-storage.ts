// With `output: 'hybrid'` configured:
export const prerender = false;
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { file_name } = await request.json();

    if (!file_name) {
      return new Response(JSON.stringify({ error: 'File name is required' }), { status: 400 });
    }

    // Delete the image from the Supabase storage bucket
    const { error: deleteError } = await supabase.storage.from('gallery-images').remove([`private/${file_name}`]);

    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 });
    }

    // Delete the image metadata from the database (if necessary)
    const { error: dbError } = await supabase.from('gallery-storage').delete().match({ file_name });

    if (dbError) {
      return new Response(JSON.stringify({ error: dbError.message }), { status: 501 });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 502 });
  }
};
