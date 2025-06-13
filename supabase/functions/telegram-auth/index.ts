
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const params = url.searchParams

    // Extract Telegram auth data
    const id = params.get('id')
    const first_name = params.get('first_name')
    const last_name = params.get('last_name')
    const username = params.get('username')
    const photo_url = params.get('photo_url')
    const auth_date = params.get('auth_date')
    const hash = params.get('hash')

    console.log('Telegram auth received:', {
      id,
      first_name,
      last_name,
      username,
      photo_url,
      auth_date,
      hash
    })

    // Store user session or redirect to main app
    const redirectUrl = `${url.origin}/?telegram_auth=success&user_id=${id}&username=${username}&first_name=${first_name}`
    
    return Response.redirect(redirectUrl, 302)
  } catch (error) {
    console.error('Error processing Telegram auth:', error)
    return new Response('Error processing authentication', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})
