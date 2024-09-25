// With `output: 'hybrid'` configured:
export const prerender = false;
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: 'File is required' }), { status: 400 });
    }

    // Upload the file to Supabase Storage
    const { error } = await supabase.storage.from('gallery-images').upload(`private/${file.name}`, file);

    if (error) {
      return new Response(JSON.stringify({ error: 'Error uploading file' }), { status: 500 });
    }

    // Get the public URL of the uploaded file
    const { data: publicUrlData } = supabase.storage.from('gallery-images').getPublicUrl(`private/${file.name}`);

    // Insert image metadata into the Supabase DB
    const { error: dbError } = await supabase
      .from('gallery-storage')
      .insert([{ image_url: publicUrlData.publicUrl, file_name: file.name }]);

    if (dbError) {
      return new Response(JSON.stringify({ error: 'Error inserting image into database' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error processing upload:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 });
  }
};
