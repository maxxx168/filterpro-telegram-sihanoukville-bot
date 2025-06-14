
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { handleMessage, handleCallbackQuery } from "./handlers.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = (await import("https://esm.sh/@supabase/supabase-js@2")).createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const update = await req.json()
    console.log('Received update:', JSON.stringify(update, null, 2))

    if (update.message) {
      await handleMessage(supabase, update.message)
    } else if (update.callback_query) {
      await handleCallbackQuery(supabase, update.callback_query)
    }

    return new Response('OK', { headers: corsHeaders })
  } catch (error) {
    console.error('Error processing update:', error)
    return new Response('Error', { status: 500, headers: corsHeaders })
  }
})
