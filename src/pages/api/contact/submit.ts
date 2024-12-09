// Disable prerendering since this is a dynamic API route
export const prerender = false;
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string | null;
    const email = formData.get('email') as string | null;
    const message = formData.get('message') as string | null;

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
    }

    const { error } = await supabase.from('contacts').insert([{ name, email, message }]);

    if (error) {
      return new Response(JSON.stringify({ error: 'Failed to save contact' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 });
  }
};
