
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Telegram Bot API Base URL
const TELEGRAM_API = `https://api.telegram.org/bot${Deno.env.get('TELEGRAM_BOT_TOKEN')}`

// Translations
const translations = {
  en: {
    welcome: 'Welcome to FilterPro Bot! 🚰',
    welcomeDesc: 'Your premium water filter solution for Sihanoukville, Cambodia',
    channelInfo: 'Join our channel: @quickMakss',
    managerInfo: 'Contact manager: @quickMakss',
    selectLanguage: 'Select your language:',
    selectQuantity: 'How many FilterPro units would you like?',
    deliveryDetails: 'Delivery Details',
    shareLocation: 'Share your location',
    phoneNumber: 'Phone number',
    selectDate: 'Select delivery date:',
    today: 'Today',
    tomorrow: 'Tomorrow',
    selectTime: 'Select delivery time:',
    paymentMethod: 'Payment method:',
    qrPayment: 'QR Code Payment',
    cashOnDelivery: 'Cash on Delivery',
    orderSummary: 'Order Summary',
    product: 'FilterPro Water Filter',
    total: 'Total',
    noDeliveryFee: 'Free delivery in Sihanoukville!',
    confirmOrder: 'Confirm Order',
    orderConfirmed: 'Order confirmed! You will receive updates soon.',
    back: 'Back',
    next: 'Next',
    enterPhone: 'Please enter your phone number:',
    invalidPhone: 'Please enter a valid phone number starting with +855',
    locationReceived: 'Location received! ✅',
    pleaseSelectTime: 'Please select a delivery time from the options above.',
    orderSubmitted: 'Your order has been submitted! 🎉\n\nOrder details sent to @quickMakss\nYou will receive updates soon.',
    startNewOrder: 'Start New Order'
  },
  ru: {
    welcome: 'Добро пожаловать в FilterPro Bot! 🚰',
    welcomeDesc: 'Ваше премиальное решение для фильтрации воды в Сиануквиле, Камбоджа',
    channelInfo: 'Присоединяйтесь к нашему каналу: @quickMakss',
    managerInfo: 'Связаться с менеджером: @quickMakss',
    selectLanguage: 'Выберите язык:',
    selectQuantity: 'Сколько устройств FilterPro вы хотите?',
    deliveryDetails: 'Детали доставки',
    shareLocation: 'Поделиться местоположением',
    phoneNumber: 'Номер телефона',
    selectDate: 'Выберите дату доставки:',
    today: 'Сегодня',
    tomorrow: 'Завтра',
    selectTime: 'Выберите время доставки:',
    paymentMethod: 'Способ оплаты:',
    qrPayment: 'Оплата QR-кодом',
    cashOnDelivery: 'Оплата при доставке',
    orderSummary: 'Сводка заказа',
    product: 'Фильтр для воды FilterPro',
    total: 'Итого',
    noDeliveryFee: 'Бесплатная доставка в Сиануквиле!',
    confirmOrder: 'Подтвердить заказ',
    orderConfirmed: 'Заказ подтвержден! Вскоре вы получите обновления.',
    back: 'Назад',
    next: 'Далее',
    enterPhone: 'Пожалуйста, введите ваш номер телефона:',
    invalidPhone: 'Пожалуйста, введите действительный номер телефона, начинающийся с +855',
    locationReceived: 'Местоположение получено! ✅',
    pleaseSelectTime: 'Пожалуйста, выберите время доставки из вариантов выше.',
    orderSubmitted: 'Ваш заказ отправлен! 🎉\n\nДетали заказа отправлены @quickMakss\nВскоре вы получите обновления.',
    startNewOrder: 'Начать новый заказ'
  },
  zh: {
    welcome: '欢迎使用 FilterPro 机器人！🚰',
    welcomeDesc: '您在柬埔寨西哈努克港的优质净水器解决方案',
    channelInfo: '加入我们的频道：@quickMakss',
    managerInfo: '联系经理：@quickMakss',
    selectLanguage: '选择您的语言：',
    selectQuantity: '您想要多少个 FilterPro 设备？',
    deliveryDetails: '配送详情',
    shareLocation: '分享您的位置',
    phoneNumber: '电话号码',
    selectDate: '选择配送日期：',
    today: '今天',
    tomorrow: '明天',
    selectTime: '选择配送时间：',
    paymentMethod: '付款方式：',
    qrPayment: '二维码支付',
    cashOnDelivery: '货到付款',
    orderSummary: '订单摘要',
    product: 'FilterPro 净水器',
    total: '总计',
    noDeliveryFee: '西哈努克港免费配送！',
    confirmOrder: '确认订单',
    orderConfirmed: '订单已确认！您很快就会收到更新。',
    back: '返回',
    next: '下一步',
    enterPhone: '请输入您的电话号码：',
    invalidPhone: '请输入以+855开头的有效电话号码',
    locationReceived: '位置已收到！✅',
    pleaseSelectTime: '请从上面的选项中选择配送时间。',
    orderSubmitted: '您的订单已提交！🎉\n\n订单详情已发送给@quickMakss\n您很快就会收到更新。',
    startNewOrder: '开始新订单'
  },
  km: {
    welcome: 'សូមស្វាគមន៍មកកាន់ FilterPro Bot! 🚰',
    welcomeDesc: 'ដំណោះស្រាយម៉ាស៊ីនចម្រោះទឹកដ៏ប្រណីតសម្រាប់ក្រុងព្រះសីហនុ កម្ពុជា',
    channelInfo: 'ចូលរួមឆានែលរបស់យើង៖ @quickMakss',
    managerInfo: 'ទាក់ទងអ្នកគ្រប់គ្រង៖ @quickMakss',
    selectLanguage: 'ជ្រើសរើសភាសារបស់អ្នក៖',
    selectQuantity: 'តើអ្នកចង់បាន FilterPro ប៉ុន្មានគ្រឿង?',
    deliveryDetails: 'ព័ត៌មានលម្អិតនៃការដឹកជញ្ជូន',
    shareLocation: 'ចែករំលែកទីតាំងរបស់អ្នក',
    phoneNumber: 'លេខទូរស័ព្ទ',
    selectDate: 'ជ្រើសរើសកាលបរិច្ឆេទដឹកជញ្ជូន៖',
    today: 'ថ្ងៃនេះ',
    tomorrow: 'ស្អែក',
    selectTime: 'ជ្រើសរើសម៉ោងដឹកជញ្ជូន៖',
    paymentMethod: 'វិធីសាស្រ្តបង់ប្រាក់៖',
    qrPayment: 'ការបង់ប្រាក់ QR កូដ',
    cashOnDelivery: 'បង់ប្រាក់នៅពេលដឹកជញ្ជូន',
    orderSummary: 'សេចក្តីសង្ខេបនៃការបញ្ជាទិញ',
    product: 'ម៉ាស៊ីនចម្រោះទឹក FilterPro',
    total: 'សរុប',
    noDeliveryFee: 'ការដឹកជញ្ជូនឥតគិតថ្លៃនៅព្រះសីហនុ!',
    confirmOrder: 'បញ្ជាក់ការបញ្ជាទិញ',
    orderConfirmed: 'ការបញ្ជាទិញត្រូវបានបញ្ជាក់! អ្នកនឹងទទួលបានការធ្វើបច្ចុប្បន្នភាពក្នុងពេលឆាប់ៗនេះ។',
    back: 'ថយក្រោយ',
    next: 'បន្ទាប់',
    enterPhone: 'សូមបញ្ចូលលេខទូរស័ព្ទរបស់អ្នក៖',
    invalidPhone: 'សូមបញ្ចូលលេខទូរស័ព្ទត្រឹមត្រូវដែលចាប់ផ្តើមដោយ +855',
    locationReceived: 'បានទទួលទីតាំង! ✅',
    pleaseSelectTime: 'សូមជ្រើសរើសម៉ោងដឹកជញ្ជូនពីជម្រើសខាងលើ។',
    orderSubmitted: 'ការបញ្ជាទិញរបស់អ្នកត្រូវបានដាក់ស្នើ! 🎉\n\nព័ត៌មានលម្អិតនៃការបញ្ជាទិញត្រូវបានផ្ញើទៅ @quickMakss\nអ្នកនឹងទទួលបានការធ្វើបច្ចុប្បន្នភាពក្នុងពេលឆាប់ៗនេះ។',
    startNewOrder: 'ចាប់ផ្តើមការបញ្ជាទិញថ្មី'
  }
}

const deliveryTimes = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
  '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM',
  '9:00 PM', '10:00 PM'
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
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
  
  // Get or create user session
  let session = await getUserSession(supabase, userId)
  if (!session) {
    session = await createUserSession(supabase, message.from)
  }

  if (text === '/start') {
    await updateUserStep(supabase, userId, 'language')
    await sendLanguageSelection(chatId)
  } else if (session.current_step === 'phone_input') {
    await handlePhoneInput(supabase, userId, chatId, text, session)
  } else if (message.location && session.current_step === 'delivery_details') {
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

  // Answer callback query
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
    const quantity = parseInt(data.split('_')[1])
    await updateSessionData(supabase, userId, { 
      ...session.session_data, 
      quantity 
    }, 'delivery_details')
    await sendDeliveryDetails(chatId, lang)
  } else if (data.startsWith('date_')) {
    const deliveryDate = data.split('_')[1]
    await updateSessionData(supabase, userId, {
      ...session.session_data,
      deliveryDate
    }, 'time_selection')
    await sendTimeSelection(chatId, lang)
  } else if (data.startsWith('time_')) {
    const deliveryTime = data.split('_')[1]
    await updateSessionData(supabase, userId, {
      ...session.session_data,
      deliveryTime
    }, 'payment_method')
    await sendPaymentMethod(chatId, lang, session.session_data.quantity)
  } else if (data.startsWith('payment_')) {
    const paymentMethod = data.split('_')[1]
    await updateSessionData(supabase, userId, {
      ...session.session_data,
      paymentMethod
    }, 'summary')
    await sendOrderSummary(chatId, lang, userId, session.session_data)
  } else if (data === 'confirm_order') {
    await confirmOrder(supabase, userId, chatId, lang, session.session_data)
  } else if (data === 'back') {
    await handleBackButton(supabase, userId, chatId, session)
  } else if (data === 'new_order') {
    await updateUserStep(supabase, userId, 'language')
    await sendLanguageSelection(chatId)
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

async function sendLanguageSelection(chatId: number) {
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
      text: `🚰 *FilterPro Bot*\n\n${translations.en.welcomeDesc}\n\n📢 ${translations.en.channelInfo}\n👨‍💼 ${translations.en.managerInfo}\n\n${translations.en.selectLanguage}`,
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
        { text: '1 ($25)', callback_data: 'qty_1' },
        { text: '2 ($50)', callback_data: 'qty_2' },
        { text: '3 ($75)', callback_data: 'qty_3' }
      ],
      [{ text: `← ${t.back}`, callback_data: 'back' }]
    ]
  }

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `🚰 *${t.product}*\n\n${t.selectQuantity}\n\n🚚 ${t.noDeliveryFee}`,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    })
  })
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
      text: `📦 *${t.deliveryDetails}*\n\n${t.selectDate}`,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    })
  })
}

async function sendTimeSelection(chatId: number, language: string) {
  const t = translations[language] || translations.en
  
  const keyboard = {
    inline_keyboard: []
  }
  
  // Create rows of time buttons (4 per row)
  for (let i = 0; i < deliveryTimes.length; i += 4) {
    const row = deliveryTimes.slice(i, i + 4).map(time => ({
      text: time,
      callback_data: `time_${time}`
    }))
    keyboard.inline_keyboard.push(row)
  }
  
  keyboard.inline_keyboard.push([{ text: `← ${t.back}`, callback_data: 'back' }])

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
  const total = quantity * 25
  
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
      text: `💳 *${t.paymentMethod}*\n\n${t.total}: *$${total}*\n\n🚚 ${t.noDeliveryFee}`,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    })
  })
}

async function sendOrderSummary(chatId: number, language: string, userId: number, sessionData: any) {
  const t = translations[language] || translations.en
  const total = sessionData.quantity * 25
  
  let summaryText = `📋 *${t.orderSummary}*\n\n`
  summaryText += `🚰 ${t.product}: ${sessionData.quantity}x\n`
  summaryText += `💰 ${t.total}: *$${total}*\n\n`
  summaryText += `📅 ${sessionData.deliveryDate === 'today' ? t.today : t.tomorrow}\n`
  summaryText += `⏰ ${sessionData.deliveryTime}\n`
  summaryText += `💳 ${sessionData.paymentMethod === 'qr' ? t.qrPayment : t.cashOnDelivery}\n\n`
  summaryText += `🚚 ${t.noDeliveryFee}`

  // Request phone number
  await updateUserStep(supabase, userId, 'phone_input')
  
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
      text: summaryText,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    })
  })

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `📱 ${t.enterPhone}`,
      parse_mode: 'Markdown'
    })
  })
}

async function handlePhoneInput(supabase: any, userId: number, chatId: number, phoneText: string, session: any) {
  const lang = session.session_data?.language || 'en'
  const t = translations[lang] || translations.en

  if (!phoneText.startsWith('+855') || phoneText.length < 10) {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `❌ ${t.invalidPhone}`,
        parse_mode: 'Markdown'
      })
    })
    return
  }

  await updateSessionData(supabase, userId, {
    ...session.session_data,
    phone: phoneText
  }, 'location_request')

  // Request location
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
  }, 'final_confirmation')

  // Show final confirmation
  const keyboard = {
    inline_keyboard: [
      [{ text: `✅ ${t.confirmOrder}`, callback_data: 'confirm_order' }],
      [{ text: `← ${t.back}`, callback_data: 'back' }]
    ],
    remove_keyboard: true
  }

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `✅ ${t.locationReceived}\n\n${t.confirmOrder}?`,
      reply_markup: keyboard
    })
  })
}

async function confirmOrder(supabase: any, userId: number, chatId: number, language: string, sessionData: any) {
  const t = translations[language] || translations.en

  // Save order to database
  const orderData = {
    language: sessionData.language,
    quantity: sessionData.quantity,
    deliveryDate: sessionData.deliveryDate,
    deliveryTime: sessionData.deliveryTime,
    paymentMethod: sessionData.paymentMethod,
    phone: sessionData.phone,
    location: sessionData.location
  }

  await supabase
    .from('telegram_orders')
    .insert({
      telegram_user_id: userId,
      order_data: orderData,
      status: 'pending'
    })

  // Send order details to manager
  const total = sessionData.quantity * 25
  const orderDetails = `🚰 *NEW FILTERPRO ORDER*\n\n📦 Product: FilterPro Water Filter\n🔢 Quantity: ${sessionData.quantity}\n💰 Total: $${total}\n\n📍 Location: ${sessionData.location?.address || 'Sihanoukville, Cambodia'}\n📱 Phone: ${sessionData.phone}\n\n📅 Delivery Date: ${sessionData.deliveryDate}\n⏰ Delivery Time: ${sessionData.deliveryTime}\n\n💳 Payment: ${sessionData.paymentMethod === 'qr' ? 'QR Code' : 'Cash on Delivery'}\n\nUser ID: ${userId}`

  // Send to manager (replace with actual manager chat ID)
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: '@quickMakss', // Send to channel
      text: orderDetails,
      parse_mode: 'Markdown'
    })
  })

  // Confirm to user
  const keyboard = {
    inline_keyboard: [
      [{ text: `🔄 ${t.startNewOrder}`, callback_data: 'new_order' }]
    ],
    remove_keyboard: true
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

  // Reset user session
  await updateUserStep(supabase, userId, 'welcome')
}

async function handleBackButton(supabase: any, userId: number, chatId: number, session: any) {
  const lang = session.session_data?.language || 'en'
  
  switch (session.current_step) {
    case 'quantity':
      await updateUserStep(supabase, userId, 'language')
      await sendLanguageSelection(chatId)
      break
    case 'delivery_details':
      await updateUserStep(supabase, userId, 'quantity')
      await sendQuantitySelection(chatId, lang)
      break
    case 'time_selection':
      await updateUserStep(supabase, userId, 'delivery_details')
      await sendDeliveryDetails(chatId, lang)
      break
    case 'payment_method':
      await updateUserStep(supabase, userId, 'time_selection')
      await sendTimeSelection(chatId, lang)
      break
    case 'summary':
    case 'phone_input':
      await updateUserStep(supabase, userId, 'payment_method')
      await sendPaymentMethod(chatId, lang, session.session_data.quantity)
      break
  }
}
