
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TELEGRAM_API = `https://api.telegram.org/bot${Deno.env.get('TELEGRAM_BOT_TOKEN')}`
const CHAT_ID = -1002863245380

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { orderDetails, orderId } = await req.json()

    if (!orderDetails) {
      throw new Error('Missing orderDetails in request body')
    }

    const finalOrderId = orderId || 'unknown'

    // Extract links from order details
    const supabaseLinkMatch = orderDetails.match(/\[View Order in Supabase\]\(([^)]+)\)/)
    const mapsLinkMatch = orderDetails.match(/\[Delivery Location\]\(([^)]+)\)/)
    
    const supabaseLink = supabaseLinkMatch ? supabaseLinkMatch[1] : `https://supabase.com/dashboard/project/uyjdsmdrwhrbammeivek/editor/tables/telegram_orders`
    const mapsLink = mapsLinkMatch ? mapsLinkMatch[1] : 'https://maps.google.com/?q=10.6104,103.5282'

    // Create inline keyboard with manager actions
    const keyboard = {
      inline_keyboard: [
        [
          { text: '📋 View in Supabase', url: supabaseLink },
          { text: '🗺️ View Location', url: mapsLink }
        ],
        [
          { text: '💬 Contact Customer', url: 'https://t.me/FilterProOrder' }
        ],
        [
          { text: '✅ Mark as Completed', callback_data: `complete_${finalOrderId}` }
        ]
      ]
    }

    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: orderDetails,
        parse_mode: 'Markdown',
        reply_markup: keyboard
      })
    })

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Telegram API error:', errorData);
        throw new Error(errorData.description || 'Failed to send message to Telegram');
    }

    console.log('Notification sent successfully to @FilterProOrder');

    return new Response(JSON.stringify({ message: 'Notification sent' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in send-order-notification function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
