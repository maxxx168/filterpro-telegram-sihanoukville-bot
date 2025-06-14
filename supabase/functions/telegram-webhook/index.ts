import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { PRICING, QR_PAYMENT_URLS, deliveryTimes } from "./constants.ts"
import { translations } from "./translations.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TELEGRAM_API = `https://api.telegram.org/bot${Deno.env.get('TELEGRAM_BOT_TOKEN')}`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = (await import("https://esm.sh/@supabase/supabase-js@2")).createClient(
      "https://uyjdsmdrwhrbammeivek.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5amRzbWRyd2hyYmFtbWVpdmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTc0MTksImV4cCI6MjA2NTIzMzQxOX0.posI7iBdmqfPpU88Wkduv6fVo-IgWbo2XyF1ECcFeKw"
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

async function handleMessage(supabase: any, message: any) {
  const userId = message.from.id
  const chatId = message.chat.id
  const text = message.text
  
  let session = await getUserSession(supabase, userId)
  if (!session) {
    session = await createUserSession(supabase, message.from)
  }

  const lang = session.session_data?.language || 'en'
  const t = translations[lang] || translations.en

  if (text === '/start') {
    await updateUserStep(supabase, userId, 'language')
    await sendLanguageSelection(chatId, lang)
  } else if (session.current_step === 'custom_quantity_input') {
    await handleCustomQuantityInput(supabase, userId, chatId, text, session)
  } else if (message.location && session.current_step === 'location_request') {
    await handleLocationReceived(supabase, userId, chatId, message.location, session)
  }
}

async function handleCallbackQuery(supabase: any, callbackQuery: any) {
  const userId = callbackQuery.from.id
  const chatId = callbackQuery.message.chat.id
  const data = callbackQuery.data
  
  const session = await getUserSession(supabase, userId)
  if (!session) return

  const lang = session.session_data?.language || 'en'
  const t = translations[lang] || translations.en

  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQuery.id })
  })

  if (data.startsWith('lang_')) {
    const language = data.split('_')[1]
    await updateSessionData(supabase, userId, { language }, 'quantity')
    await sendQuantitySelection(chatId, language)
  } else if (data.startsWith('qty_')) {
    const quantity = data === 'qty_custom' ? null : parseInt(data.split('_')[1])
    if (quantity) {
      const lastOrder = await getLastOrder(supabase, userId);
      const lastLocation = lastOrder?.order_data?.location;

      await updateSessionData(supabase, userId, { 
        ...session.session_data, 
        quantity,
        phone: callbackQuery.from.phone_number || null
      }, lastLocation ? 'confirm_location' : 'location_request')
      
      if (lastLocation) {
        await sendLocationConfirmation(chatId, lang);
      } else {
        await sendLocationRequest(chatId, lang);
      }
    } else {
      await updateSessionData(supabase, userId, session.session_data, 'custom_quantity_input')
      await sendCustomQuantityRequest(chatId, lang)
    }
  } else if (data === 'confirm_loc_yes') {
    const lastOrder = await getLastOrder(supabase, userId)
    if (lastOrder && lastOrder.order_data.location) {
        await updateSessionData(supabase, userId, {
            ...session.session_data,
            location: lastOrder.order_data.location
        }, 'delivery_details')
        await sendDeliveryDetails(chatId, lang)
    } else {
        await updateUserStep(supabase, userId, 'location_request')
        await sendLocationRequest(chatId, lang)
    }
  } else if (data === 'confirm_loc_no') {
      await updateUserStep(supabase, userId, 'location_request')
      await sendLocationRequest(chatId, lang)
  } else if (data.startsWith('date_')) {
    const deliveryDate = data.split('_')[1]
    
    const lastOrder = await getLastOrder(supabase, userId);
    const lastTime = lastOrder?.order_data?.deliveryTime;

    await updateSessionData(supabase, userId, {
      ...session.session_data,
      deliveryDate
    }, lastTime ? 'confirm_time' : 'time_selection')
    
    if (lastTime) {
      await sendTimeConfirmation(chatId, lang, lastTime);
    } else {
      await sendTimeSelection(chatId, lang);
    }
  } else if (data === 'confirm_time_yes') {
    const lastOrder = await getLastOrder(supabase, userId)
    if (lastOrder && lastOrder.order_data.deliveryTime) {
        await updateSessionData(supabase, userId, {
            ...session.session_data,
            deliveryTime: lastOrder.order_data.deliveryTime
        }, 'payment_method')
        await sendPaymentMethod(chatId, lang, session.session_data.quantity)
    } else {
        await updateUserStep(supabase, userId, 'time_selection')
        await sendTimeSelection(chatId, lang)
    }
  } else if (data.startsWith('time_')) {
    const timeKey = data.split('_')[1]
    const timeSlot = deliveryTimes.find(t => t.key === timeKey)
    await updateSessionData(supabase, userId, {
      ...session.session_data,
      deliveryTime: timeSlot.value
    }, 'payment_method')
    await sendPaymentMethod(chatId, lang, session.session_data.quantity)
  } else if (data.startsWith('payment_')) {
    const paymentMethod = data.split('_')[1]
    await updateSessionData(supabase, userId, {
      ...session.session_data,
      paymentMethod
    }, 'summary')
    
    if (paymentMethod === 'qr') {
      await sendQRPayment(chatId, lang, session.session_data.quantity)
    } else {
      await sendOrderSummary(chatId, lang, session.session_data)
    }
  } else if (data === 'confirm_order') {
    await confirmOrder(supabase, userId, chatId, lang, session.session_data, session.username)
  } else if (data === 'back') {
    await handleBackButton(supabase, userId, chatId, session)
  } else if (data === 'new_order') {
    await updateUserStep(supabase, userId, 'language')
    await sendLanguageSelection(chatId, lang)
  } else if (data === 'proceed_to_summary') {
    await sendOrderSummary(chatId, lang, session.session_data)
  }
}

async function getUserSession(supabase: any, userId: number) {
  const { data } = await supabase
    .from('bot_sessions')
    .select('*')
    .eq('telegram_user_id', userId)
    .single()
  
  return data
}

async function createUserSession(supabase: any, user: any) {
  const { data } = await supabase
    .from('bot_sessions')
    .insert({
      telegram_user_id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      language_code: user.language_code
    })
    .select()
    .single()
  
  return data
}

async function updateUserStep(supabase: any, userId: number, step: string) {
  await supabase
    .from('bot_sessions')
    .update({ current_step: step })
    .eq('telegram_user_id', userId)
}

async function updateSessionData(supabase: any, userId: number, sessionData: any, nextStep: string) {
  await supabase
    .from('bot_sessions')
    .update({ 
      session_data: sessionData,
      current_step: nextStep
    })
    .eq('telegram_user_id', userId)
}

async function sendLanguageSelection(chatId: number, language: string) {
  const t = translations[language] || translations.en;
  const keyboard = {
    inline_keyboard: [
      [
        { text: '🇺🇸 English', callback_data: 'lang_en' },
        { text: '🇷🇺 Русский', callback_data: 'lang_ru' }
      ],
      [
        { text: '🇨🇳 中文', callback_data: 'lang_zh' },
        { text: '🇰🇭 ខ្មែរ', callback_data: 'lang_km' }
      ]
    ]
  }

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `*${t.selectLanguage}*`,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    })
  })
}

async function sendQuantitySelection(chatId: number, language: string) {
  const t = translations[language] || translations.en
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: `1 ($${PRICING[1]})`, callback_data: 'qty_1' },
        { text: `2 ($${PRICING[2]})`, callback_data: 'qty_2' }
      ],
      [
        { text: `3 ($${PRICING[3]})`, callback_data: 'qty_3' },
        { text: `4 ($${PRICING[4]})`, callback_data: 'qty_4' }
      ],
      [{ text: `📝 ${t.customQuantity}`, callback_data: 'qty_custom' }],
      [{ text: `← ${t.back}`, callback_data: 'back' }]
    ]
  }

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `*${t.selectQuantity}*`,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    })
  })
}

async function sendCustomQuantityRequest(chatId: number, language: string) {
  const t = translations[language] || translations.en
  
  const keyboard = {
    inline_keyboard: [
      [{ text: `← ${t.back}`, callback_data: 'back' }]
    ]
  }

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `📝 ${t.enterCustomQuantity}`,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    })
  })
}

async function handleCustomQuantityInput(supabase: any, userId: number, chatId: number, text: string, session: any) {
  const lang = session.session_data?.language || 'en'
  const t = translations[lang] || translations.en

  const quantity = parseInt(text)
  if (isNaN(quantity) || quantity <= 0) {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `❌ ${t.invalidQuantity}`,
        parse_mode: 'Markdown'
      })
    })
    return
  }

  await updateSessionData(supabase, userId, {
    ...session.session_data,
    quantity: quantity,
    customQuantity: true,
    phone: session.phone_number || null
  }, 'location_request')

  await sendLocationRequest(chatId, lang)
}

async function sendLocationRequest(chatId: number, language: string) {
  const t = translations[language] || translations.en
  
  const keyboard = {
    keyboard: [[{
      text: `📍 ${t.shareLocation}`,
      request_location: true
    }]],
    one_time_keyboard: true,
    resize_keyboard: true
  }

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `📍 ${t.shareLocation}`,
      reply_markup: keyboard
    })
  })
}

async function handleLocationReceived(supabase: any, userId: number, chatId: number, location: any, session: any) {
  const lang = session.session_data?.language || 'en'
  const t = translations[lang] || translations.en

  await updateSessionData(supabase, userId, {
    ...session.session_data,
    location: {
      latitude: location.latitude,
      longitude: location.longitude,
      address: 'Sihanoukville, Cambodia'
    }
  }, 'delivery_details')

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `✅ ${t.locationReceived}`,
      reply_markup: { remove_keyboard: true }
    })
  })

  await sendDeliveryDetails(chatId, lang)
}

async function sendDeliveryDetails(chatId: number, language: string) {
  const t = translations[language] || translations.en
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: `📅 ${t.today}`, callback_data: 'date_today' },
        { text: `📅 ${t.tomorrow}`, callback_data: 'date_tomorrow' }
      ],
      [{ text: `← ${t.back}`, callback_data: 'back' }]
    ]
  }

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `*${t.selectDate}*`,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    })
  })
}

async function sendTimeSelection(chatId: number, language: string) {
  const t = translations[language] || translations.en
  
  const keyboard = {
    inline_keyboard: [
      [{ text: `🌅 ${t.morning}`, callback_data: 'time_morning' }],
      [{ text: `☀️ ${t.afternoon}`, callback_data: 'time_afternoon' }],
      [{ text: `🌆 ${t.evening}`, callback_data: 'time_evening' }],
      [{ text: `← ${t.back}`, callback_data: 'back' }]
    ]
  }

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `⏰ *${t.selectTime}*`,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    })
  })
}

async function sendPaymentMethod(chatId: number, language: string, quantity: number) {
  const t = translations[language] || translations.en
  const price = PRICING[quantity] || (quantity * 5.5)
  
  const keyboard = {
    inline_keyboard: [
      [{ text: `📱 ${t.qrPayment}`, callback_data: 'payment_qr' }],
      [{ text: `💵 ${t.cashOnDelivery}`, callback_data: 'payment_cash' }],
      [{ text: `← ${t.back}`, callback_data: 'back' }]
    ]
  }

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `*💳 ${t.total}: $${price}*\n*${t.paymentMethod}*\n\n_if you plan to pay by cash, let the bot know if need to prepare some change_`,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    })
  })
}

async function sendQRPayment(chatId: number, language: string, quantity: number, isCustom: boolean = false) {
  const t = translations[language] || translations.en
  const qrUrl = isCustom ? QR_PAYMENT_URLS.custom : (QR_PAYMENT_URLS[quantity] || QR_PAYMENT_URLS[1])
  
  const keyboard = {
    inline_keyboard: [
      [{ text: '💳 Pay Now', url: qrUrl }],
      [{ text: `✅ ${t.confirmOrder}`, callback_data: 'proceed_to_summary' }],
      [{ text: `← ${t.back}`, callback_data: 'back' }]
    ]
  }

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `📱 *${t.qrPayment}*\n\n${t.payWithQR}\n\n${qrUrl}`,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    })
  })
}

async function sendOrderSummary(chatId: number, language: string, sessionData: any) {
  const t = translations[language] || translations.en
  const price = PRICING[sessionData.quantity] || (sessionData.quantity * 5.5)
  
  let summaryText = `📋 *${t.orderSummary}*\n\n`
  summaryText += `🚰 ${t.product}: ${sessionData.quantity}x\n`
  summaryText += `💰 ${t.total}: *$${price}*\n\n`
  if (sessionData.phone) {
    summaryText += `📱 Phone: ${sessionData.phone}\n`
  }
  summaryText += `📅 ${sessionData.deliveryDate === 'today' ? t.today : t.tomorrow}\n`
  summaryText += `⏰ ${sessionData.deliveryTime}\n`
  summaryText += `💳 ${sessionData.paymentMethod === 'qr' ? t.qrPayment : t.cashOnDelivery}\n\n`
  summaryText += `${t.noDeliveryFee}`

  const keyboard = {
    inline_keyboard: [
      [{ text: `✅ ${t.confirmOrder}`, callback_data: 'confirm_order' }],
      [{ text: `← ${t.back}`, callback_data: 'back' }]
    ]
  }

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: summaryText,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    })
  })
}

async function confirmOrder(supabase: any, userId: number, chatId: number, language: string, sessionData: any, username?: string) {
  const t = translations[language] || translations.en
  const price = PRICING[sessionData.quantity] || (sessionData.quantity * 5.5)

  const orderData = {
    language: sessionData.language,
    quantity: sessionData.quantity,
    deliveryDate: sessionData.deliveryDate,
    deliveryTime: sessionData.deliveryTime,
    paymentMethod: sessionData.paymentMethod,
    phone: sessionData.phone || null,
    telegramId: username,
    location: sessionData.location,
    customQuantity: sessionData.customQuantity || false
  }

  const { data: savedOrder, error } = await supabase
    .from('telegram_orders')
    .insert({
      telegram_user_id: userId,
      order_data: orderData,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving order to db:', error)
  }

  const orderId = savedOrder ? savedOrder.id : Math.random().toString(36).substr(2, 9);
  
  const orderDetails = `📋 NEW FILTERPRO ORDER [${orderId}]

🚰 Product: FilterPro Water Filter
🔢 Quantity: ${sessionData.quantity}${sessionData.customQuantity ? ' (Custom)' : ''}
💰 Total: $${price}

👤 Customer Info:
${userId ? `📱 Telegram ID: ${userId}` : ''}
${username ? `\n💬 Telegram Username: @${username}` : ''}
${sessionData.phone ? `\n📱 Phone: ${sessionData.phone}` : ''}

📍 Delivery Details:
Location: ${sessionData.location?.address || 'Sihanoukville, Cambodia'}
📅 Date: ${sessionData.deliveryDate === 'today' ? t.today : t.tomorrow}
⏰ Time: ${sessionData.deliveryTime}

💳 Payment: ${sessionData.paymentMethod === 'qr' ? t.qrPayment : t.cashOnDelivery}

[Contact Customer](https://t.me/FilterProOrder)`

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: -1002863245380,
      text: orderDetails,
      parse_mode: 'Markdown'
    })
  })

  const keyboard = {
    inline_keyboard: [
      [{ text: `🔄 ${t.startNewOrder}`, callback_data: 'new_order' }]
    ]
  }

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `🎉 ${t.orderSubmitted}`,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    })
  })

  await updateUserStep(supabase, userId, 'welcome')
}

async function sendLocationConfirmation(chatId: number, language: string) {
  const t = translations[language] || translations.en;
  const text = t.sameLocationQuestion;
  const yesText = t.yesSamePlace;
  const noText = t.noNewPlace;

  const keyboard = {
    inline_keyboard: [
      [
        { text: `✅ ${yesText}`, callback_data: 'confirm_loc_yes' },
        { text: `🔄 ${noText}`, callback_data: 'confirm_loc_no' }
      ],
      [{ text: `← ${t.back}`, callback_data: 'back' }]
    ]
  };

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `📍 *${text}*`,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    })
  });
}

async function sendTimeConfirmation(chatId: number, language: string, lastTime: string) {
  const t = translations[language] || translations.en
  const question = `${t.sameTimeQuestion} ${lastTime}. ${t.sameTimeQuestionEnd}`
  const yesText = t.yesSameTime

  const keyboard = {
    inline_keyboard: [
      [{ text: `✅ ${yesText}`, callback_data: `confirm_time_yes` }],
      [{ text: `🌅 ${t.morning}`, callback_data: 'time_morning' }],
      [{ text: `☀️ ${t.afternoon}`, callback_data: 'time_afternoon' }],
      [{ text: `🌆 ${t.evening}`, callback_data: 'time_evening' }],
      [{ text: `← ${t.back}`, callback_data: 'back' }]
    ]
  }

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `⏰ *${question}*`,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    })
  })
}

async function handleBackButton(supabase: any, userId: number, chatId: number, session: any) {
  const lang = session.session_data?.language || 'en'
  
  switch (session.current_step) {
    case 'quantity':
      await updateUserStep(supabase, userId, 'language')
      await sendLanguageSelection(chatId, lang)
      break
    case 'custom_quantity_input':
      await updateUserStep(supabase, userId, 'quantity')
      await sendQuantitySelection(chatId, lang)
      break
    case 'confirm_location':
      await updateUserStep(supabase, userId, 'quantity')
      await sendQuantitySelection(chatId, lang)
      break
    case 'location_request':
      await updateUserStep(supabase, userId, 'quantity')
      await sendQuantitySelection(chatId, lang)
      break
    case 'delivery_details':
      await updateUserStep(supabase, userId, 'location_request')
      await sendLocationRequest(chatId, lang)
      break
    case 'confirm_time':
      await updateUserStep(supabase, userId, 'delivery_details')
      await sendDeliveryDetails(chatId, lang)
      break
    case 'time_selection':
      await updateUserStep(supabase, userId, 'time_selection')
      await sendTimeSelection(chatId, lang)
      break
    case 'payment_method':
      await updateUserStep(supabase, userId, 'time_selection')
      await sendTimeSelection(chatId, lang)
      break
    case 'summary':
      await updateUserStep(supabase, userId, 'payment_method')
      await sendPaymentMethod(chatId, lang, session.session_data.quantity)
      break
  }
}

async function getLastOrder(supabase: any, userId: number) {
  const { data } = await supabase
    .from('telegram_orders')
    .select('order_data')
    .eq('telegram_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data
}
