import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function checkTelegramAuth(params: URLSearchParams, botToken: string): boolean {
  const authData: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    if (key !== "hash") {
      authData[key] = value;
    }
  }
  const dataCheckString = Object.keys(authData)
    .sort()
    .map(key => `${key}=${authData[key]}`)
    .join('\n');

  const encoder = new TextEncoder();
  const secret = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(botToken)
  );
  const key = new Uint8Array(secret);

  const hmac = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(dataCheckString)
  );
  const hex = Array.from(new Uint8Array(hmac)).map(b => b.toString(16).padStart(2, "0")).join("");
  return hex === params.get("hash");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const params = url.searchParams

    // --- ADD THIS: Secure hash verification ---
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN') ?? '';
    const isValid = await checkTelegramAuth(params, botToken);
    if (!isValid) {
      return new Response('Invalid Telegram login', { status: 403, headers: corsHeaders });
    }
    // -----------------------------------------

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
