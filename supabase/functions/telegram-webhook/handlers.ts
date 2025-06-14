
import { translations } from "./translations.ts"
import { PRICING, deliveryTimes } from "./constants.ts"
import { getUserSession, createUserSession, updateUserStep, updateSessionData, getLastOrder, saveOrder } from "./database.ts"
import { 
  sendLanguageSelection, 
  sendQuantitySelection,
  sendCustomQuantityRequest,
  sendLocationRequest,
  sendDeliveryDetails,
  sendTimeSelection,
  sendPaymentMethod,
  sendQRPayment,
  sendOrderSummary,
  sendOrderConfirmationMessages,
  sendLocationConfirmation,
  sendTimeConfirmation
} from "./telegram.ts"

const TELEGRAM_API = `https://api.telegram.org/bot${Deno.env.get('TELEGRAM_BOT_TOKEN')}`

export async function handleMessage(supabase: any, message: any) {
  const userId = message.from.id
  const chatId = message.chat.id
  const text = message.text
  
  let session = await getUserSession(supabase, userId)
  if (!session) {
    session = await createUserSession(supabase, message.from)
  }

  const lang = session.session_data?.language || 'en'

  if (text === '/start') {
    await updateUserStep(supabase, userId, 'language')
    await sendLanguageSelection(chatId, translations[lang])
  } else if (session.current_step === 'custom_quantity_input') {
    await handleCustomQuantityInput(supabase, userId, chatId, text, session)
  } else if (message.location && session.current_step === 'location_request') {
    await handleLocationReceived(supabase, userId, chatId, message.location, session)
  }
}

export async function handleCallbackQuery(supabase: any, callbackQuery: any) {
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
    await sendQuantitySelection(chatId, translations[language])
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
        await sendLocationConfirmation(chatId, t);
      } else {
        await sendLocationRequest(chatId, t);
      }
    } else {
      await updateSessionData(supabase, userId, session.session_data, 'custom_quantity_input')
      await sendCustomQuantityRequest(chatId, t)
    }
  } else if (data === 'confirm_loc_yes') {
    const lastOrder = await getLastOrder(supabase, userId)
    if (lastOrder && lastOrder.order_data.location) {
        await updateSessionData(supabase, userId, {
            ...session.session_data,
            location: lastOrder.order_data.location
        }, 'delivery_details')
        await sendDeliveryDetails(chatId, t)
    } else {
        await updateUserStep(supabase, userId, 'location_request')
        await sendLocationRequest(chatId, t)
    }
  } else if (data === 'confirm_loc_no') {
      await updateUserStep(supabase, userId, 'location_request')
      await sendLocationRequest(chatId, t)
  } else if (data.startsWith('date_')) {
    const deliveryDate = data.split('_')[1]
    
    const lastOrder = await getLastOrder(supabase, userId);
    const lastTime = lastOrder?.order_data?.deliveryTime;

    await updateSessionData(supabase, userId, {
      ...session.session_data,
      deliveryDate
    }, lastTime ? 'confirm_time' : 'time_selection')
    
    if (lastTime) {
      await sendTimeConfirmation(chatId, t, lastTime);
    } else {
      await sendTimeSelection(chatId, t);
    }
  } else if (data === 'confirm_time_yes') {
    const lastOrder = await getLastOrder(supabase, userId)
    if (lastOrder && lastOrder.order_data.deliveryTime) {
        await updateSessionData(supabase, userId, {
            ...session.session_data,
            deliveryTime: lastOrder.order_data.deliveryTime
        }, 'payment_method')
        await sendPaymentMethod(chatId, t, session.session_data.quantity)
    } else {
        await updateUserStep(supabase, userId, 'time_selection')
        await sendTimeSelection(chatId, t)
    }
  } else if (data.startsWith('time_')) {
    const timeKey = data.split('_')[1]
    const timeSlot = deliveryTimes.find(t => t.key === timeKey)
    await updateSessionData(supabase, userId, {
      ...session.session_data,
      deliveryTime: timeSlot.value
    }, 'payment_method')
    await sendPaymentMethod(chatId, t, session.session_data.quantity)
  } else if (data.startsWith('payment_')) {
    const paymentMethod = data.split('_')[1]
    await updateSessionData(supabase, userId, {
      ...session.session_data,
      paymentMethod
    }, 'summary')
    
    if (paymentMethod === 'qr') {
      await sendQRPayment(chatId, t, session.session_data.quantity)
    } else {
      await sendOrderSummary(chatId, t, session.session_data)
    }
  } else if (data === 'confirm_order') {
    await confirmOrder(supabase, userId, chatId, lang, session.session_data, session.username)
  } else if (data === 'back') {
    await handleBackButton(supabase, userId, chatId, session)
  } else if (data === 'new_order') {
    await updateUserStep(supabase, userId, 'language')
    await sendLanguageSelection(chatId, t)
  } else if (data === 'proceed_to_summary') {
    await sendOrderSummary(chatId, t, session.session_data)
  }
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

  await sendLocationRequest(chatId, t)
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

  await sendDeliveryDetails(chatId, t)
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

  const savedOrder = await saveOrder(supabase, userId, orderData)
  const orderId = savedOrder ? savedOrder.id : Math.random().toString(36).substr(2, 9);
  
  await sendOrderConfirmationMessages(chatId, t, sessionData, price, orderId, userId, username)
  
  await updateUserStep(supabase, userId, 'welcome')
}

async function handleBackButton(supabase: any, userId: number, chatId: number, session: any) {
  const lang = session.session_data?.language || 'en'
  const t = translations[lang] || translations.en
  
  switch (session.current_step) {
    case 'quantity':
      await updateUserStep(supabase, userId, 'language')
      await sendLanguageSelection(chatId, t)
      break
    case 'custom_quantity_input':
      await updateUserStep(supabase, userId, 'quantity')
      await sendQuantitySelection(chatId, t)
      break
    case 'confirm_location':
      await updateUserStep(supabase, userId, 'quantity')
      await sendQuantitySelection(chatId, t)
      break
    case 'location_request':
      await updateUserStep(supabase, userId, 'quantity')
      await sendQuantitySelection(chatId, t)
      break
    case 'delivery_details':
      await updateUserStep(supabase, userId, 'location_request')
      await sendLocationRequest(chatId, t)
      break
    case 'confirm_time':
      await updateUserStep(supabase, userId, 'delivery_details')
      await sendDeliveryDetails(chatId, t)
      break
    case 'time_selection':
      await updateUserStep(supabase, userId, 'delivery_details')
      await sendDeliveryDetails(chatId, t)
      break
    case 'payment_method':
      await updateUserStep(supabase, userId, 'time_selection')
      await sendTimeSelection(chatId, t)
      break
    case 'summary':
      await updateUserStep(supabase, userId, 'payment_method')
      await sendPaymentMethod(chatId, t, session.session_data.quantity)
      break
  }
}
