import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Telegram Bot API Base URL
const TELEGRAM_API = `https://api.telegram.org/bot${Deno.env.get('TELEGRAM_BOT_TOKEN')}`

// Updated pricing structure
const PRICING = {
  1: 5.5,
  2: 11,
  3: 16.5,
  4: 22
}

// QR Payment URLs based on quantity
const QR_PAYMENT_URLS = {
  1: 'https://pay.ababank.com/wxb7ADrgnmE94LAy5',
  2: 'https://pay.ababank.com/cXB6y5w7WnzrVbBx7',
  3: 'https://pay.ababank.com/BJc9j9GqBsF1M28v9',
  4: 'https://pay.ababank.com/BJc9j9GqBsF1M28v9'
}

// Updated delivery times
const deliveryTimes = [
  { key: 'morning', label: 'Morning (9:00-12:00)', value: '9:00-12:00' },
  { key: 'afternoon', label: 'Afternoon (13:00-16:00)', value: '13:00-16:00' },
  { key: 'evening', label: 'Evening (16:00-22:00)', value: '16:00-22:00' }
]

// Translations
const translations = {
  en: {
    welcome: 'Welcome to FilterPro Bot! 🚰',
    welcomeDesc: 'Your premium water filter solution for Sihanoukville, Cambodia',
    channelInfo: 'Join our channel: @FilterProShv',
    managerInfo: 'Contact manager: @FilterProOrder',
    selectLanguage: 'Select your language:',
    selectQuantity: 'How many FilterPro units would you like?',
    customQuantity: 'Custom Quantity',
    enterCustomQuantity: 'Please enter the quantity you want (number only):',
    invalidQuantity: 'Please enter a valid number.',
    deliveryDetails: 'Delivery Details',
    shareContact: 'Share Contact',
    shareLocation: 'Share Location',
    phoneNumber: 'Phone number',
    selectDate: 'Select delivery date:',
    today: 'Today',
    tomorrow: 'Tomorrow',
    selectTime: 'Select delivery time:',
    morning: 'Morning (9:00-12:00)',
    afternoon: 'Afternoon (13:00-16:00)',
    evening: 'Evening (16:00-22:00)',
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
    enterPhone: 'Please share your contact or enter your phone number:',
    invalidPhone: 'Please enter a valid phone number starting with +855',
    locationReceived: 'Location received! ✅',
    contactReceived: 'Contact received! ✅',
    pleaseSelectTime: 'Please select a delivery time from the options above.',
    orderSubmitted: 'Your order has been submitted! 🎉\n\nOrder details sent to @FilterProOrder\nYou will receive updates soon.',
    startNewOrder: 'Start New Order',
    payWithQR: 'Click the link below to pay with QR code:'
  },
  ru: {
    welcome: 'Добро пожаловать в FilterPro Bot! 🚰',
    welcomeDesc: 'Ваше премиальное решение для фильтрации воды в Сиануквиле, Камбоджа',
    channelInfo: 'Присоединяйтесь к нашему каналу: @FilterProShv',
    managerInfo: 'Связаться с менеджером: @FilterProOrder',
    selectLanguage: 'Выберите язык:',
    selectQuantity: 'Сколько устройств FilterPro вы хотите?',
    customQuantity: 'Другое количество',
    enterCustomQuantity: 'Пожалуйста, введите желаемое количество (только число):',
    invalidQuantity: 'Пожалуйста, введите правильное число.',
    deliveryDetails: 'Детали доставки',
    shareContact: 'Поделиться контактом',
    shareLocation: 'Поделиться местоположением',
    phoneNumber: 'Номер телефона',
    selectDate: 'Выберите дату доставки:',
    today: 'Сегодня',
    tomorrow: 'Завтра',
    selectTime: 'Выберите время доставки:',
    morning: 'Утром (9:00-12:00)',
    afternoon: 'Днём (13:00-16:00)',
    evening: 'Вечером (16:00-22:00)',
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
    enterPhone: 'Пожалуйста, поделитесь контактом или введите номер телефона:',
    invalidPhone: 'Пожалуйста, введите действительный номер телефона, начинающийся с +855',
    locationReceived: 'Местоположение получено! ✅',
    contactReceived: 'Контакт получен! ✅',
    pleaseSelectTime: 'Пожалуйста, выберите время доставки из вариантов выше.',
    orderSubmitted: 'Ваш заказ отправлен! 🎉\n\nДетали заказа отправлены @FilterProOrder\nВскоре вы получите обновления.',
    startNewOrder: 'Начать новый заказ',
    payWithQR: 'Нажмите на ссылку ниже для оплаты QR-кодом:'
  },
  zh: {
    welcome: '欢迎使用 FilterPro 机器人！🚰',
    welcomeDesc: '您在柬埔寨西哈努克港的优质净水器解决方案',
    channelInfo: '加入我们的频道：@FilterProShv',
    managerInfo: '联系经理：@FilterProOrder',
    selectLanguage: '选择您的语言：',
    selectQuantity: '您想要多少个 FilterPro 设备？',
    customQuantity: '自定义数量',
    enterCustomQuantity: '请输入您想要的数量（仅数字）：',
    invalidQuantity: '请输入有效数字。',
    deliveryDetails: '配送详情',
    shareContact: '分享联系方式',
    shareLocation: '分享位置',
    phoneNumber: '电话号码',
    selectDate: '选择配送日期：',
    today: '今天',
    tomorrow: '明天',
    selectTime: '选择配送时间：',
    morning: '上午 (9:00-12:00)',
    afternoon: '下午 (13:00-16:00)',
    evening: '晚上 (16:00-22:00)',
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
    enterPhone: '请分享您的联系方式或输入电话号码：',
    invalidPhone: '请输入以+855开头的有效电话号码',
    locationReceived: '位置已收到！✅',
    contactReceived: '联系方式已收到！✅',
    pleaseSelectTime: '请从上面的选项中选择配送时间。',
    orderSubmitted: '您的订单已提交！🎉\n\n订单详情已发送给@FilterProOrder\n您很快就会收到更新。',
    startNewOrder: '开始新订单',
    payWithQR: '点击下面的链接用二维码支付：'
  },
  km: {
    welcome: 'សូមស្វាគមន៍មកកាន់ FilterPro Bot! 🚰',
    welcomeDesc: 'ដំណោះស្រាយម៉ាស៊ីនចម្រោះទឹកដ៏ប្រណីតសម្រាប់ក្រុងព្រះសីហនុ កម្ពុជា',
    channelInfo: 'ចូលរួមឆានែលរបស់យើង៖ @FilterProShv',
    managerInfo: 'ទាក់ទងអ្នកគ្រប់គ្រង៖ @FilterProOrder',
    selectLanguage: 'ជ្រើសរើសភាសារបស់អ្នក៖',
    selectQuantity: 'តើអ្នកចង់បាន FilterPro ប៉ុន្មានគ្រឿង?',
    customQuantity: 'ចំនួនផ្សេង',
    enterCustomQuantity: 'សូមបញ្ចូលចំនួនដែលអ្នកចង់បាន (តែលេខប៉ុណ្ណោះ)៖',
    invalidQuantity: 'សូមបញ្ចូលលេខត្រឹមត្រូវ។',
    deliveryDetails: 'ព័ត៌មានលម្អិតនៃការដឹកជញ្ជូន',
    shareContact: 'ចែករំលែកទំនាក់ទំនង',
    shareLocation: 'ចែករំលែកទីតាំង',
    phoneNumber: 'លេខទូរស័ព្ទ',
    selectDate: 'ជ្រើសរើសកាលបរិច្ឆេទដឹកជញ្ជូន៖',
    today: 'ថ្ងៃនេះ',
    tomorrow: 'ស្អែក',
    selectTime: 'ជ្រើសរើសម៉ោងដឹកជញ្ជូន៖',
    morning: 'ព្រឹក (9:00-12:00)',
    afternoon: 'រសៀល (13:00-16:00)',
    evening: 'ល្ងាច (16:00-22:00)',
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
    enterPhone: 'សូមចែករំលែកទំនាក់ទំនង ឬបញ្ចូលលេខទូរស័ព្ទរបស់អ្នក៖',
    invalidPhone: 'សូមបញ្ចូលលេខទូរស័ព្ទត្រឹមត្រូវដែលចាប់ផ្តើមដោយ +855',
    locationReceived: 'បានទទួលទីតាំង! ✅',
    contactReceived: 'បានទទួលទំនាក់ទំនង! ✅',
    pleaseSelectTime: 'សូមជ្រើសរើសម៉ោងដឹកជញ្ជូនពីជម្រើសខាងលើ។',
    orderSubmitted: 'ការបញ្ជាទិញរបស់អ្នកត្រូវបានដាក់ស្នើ! 🎉\n\nព័ត៌មានលម្អិតនៃការបញ្ជាទិញត្រូវបានផ្ញើទៅ @FilterProOrder\nអ្នកនឹងទទួលបានការធ្វើបច្ចុប្បន្នភាពក្នុងពេលឆាប់ៗនេះ។',
    startNewOrder: 'ចាប់ផ្តើមការបញ្ជាទិញថ្មី',
    payWithQR: 'ចុចលើតំណខាងក្រោមដើម្បីបង់ប្រាក់ដោយ QR កូដ៖'
  }
}

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
  
  let session = await getUserSession(supabase, userId)
  if (!session) {
    session = await createUserSession(supabase, message.from)
  }

  const lang = session.session_data?.language || 'en'
  const t = translations[lang] || translations.en

  if (text === '/start') {
    await updateUserStep(supabase, userId, 'language')
    await sendLanguageSelection(chatId)
  } else if (session.current_step === 'phone_input') {
    await handlePhoneInput(supabase, userId, chatId, text, session)
  } else if (session.current_step === 'custom_quantity_input') {
    await handleCustomQuantityInput(supabase, userId, chatId, text, session)
  } else if (message.contact && session.current_step === 'contact_request') {
    await handleContactReceived(supabase, userId, chatId, message.contact, session)
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
      await updateSessionData(supabase, userId, { 
        ...session.session_data, 
        quantity 
      }, 'contact_request')
      await sendContactRequest(chatId, lang)
    } else {
      await updateSessionData(supabase, userId, session.session_data, 'custom_quantity_input')
      await sendCustomQuantityRequest(chatId, lang)
    }
  } else if (data.startsWith('date_')) {
    const deliveryDate = data.split('_')[1]
    await updateSessionData(supabase, userId, {
      ...session.session_data,
      deliveryDate
    }, 'time_selection')
    await sendTimeSelection(chatId, lang)
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
    await confirmOrder(supabase, userId, chatId, lang, session.session_data)
  } else if (data === 'back') {
    await handleBackButton(supabase, userId, chatId, session)
  } else if (data === 'new_order') {
    await updateUserStep(supabase, userId, 'language')
    await sendLanguageSelection(chatId)
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
      text: `🚰 *${t.product}*\n\n${t.selectQuantity}\n\n🚚 ${t.noDeliveryFee}`,
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
    customQuantity: true
  }, 'contact_request')

  await sendContactRequest(chatId, lang)
}

async function sendContactRequest(chatId: number, language: string) {
  const t = translations[language] || translations.en
  
  const keyboard = {
    keyboard: [[{
      text: `📱 ${t.shareContact}`,
      request_contact: true
    }]],
    one_time_keyboard: true,
    resize_keyboard: true
  }

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `📱 ${t.enterPhone}`,
      reply_markup: keyboard
    })
  })
}

async function handleContactReceived(supabase: any, userId: number, chatId: number, contact: any, session: any) {
  const lang = session.session_data?.language || 'en'
  const t = translations[lang] || translations.en

  await updateSessionData(supabase, userId, {
    ...session.session_data,
    phone: contact.phone_number
  }, 'location_request')

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `✅ ${t.contactReceived}`,
      reply_markup: { remove_keyboard: true }
    })
  })

  await sendLocationRequest(chatId, lang)
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
      text: `📦 *${t.deliveryDetails}*\n\n${t.selectDate}`,
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
      text: `💳 *${t.paymentMethod}*\n\n${t.total}: *$${price}*\n\n🚚 ${t.noDeliveryFee}`,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    })
  })
}

async function sendQRPayment(chatId: number, language: string, quantity: number) {
  const t = translations[language] || translations.en
  const qrUrl = QR_PAYMENT_URLS[quantity] || QR_PAYMENT_URLS[1]
  
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
  summaryText += `📱 Phone: ${sessionData.phone}\n`
  summaryText += `📅 ${sessionData.deliveryDate === 'today' ? t.today : t.tomorrow}\n`
  summaryText += `⏰ ${sessionData.deliveryTime}\n`
  summaryText += `💳 ${sessionData.paymentMethod === 'qr' ? t.qrPayment : t.cashOnDelivery}\n\n`
  summaryText += `🚚 ${t.noDeliveryFee}`

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

async function confirmOrder(supabase: any, userId: number, chatId: number, language: string, sessionData: any) {
  const t = translations[language] || translations.en

  const orderData = {
    language: sessionData.language,
    quantity: sessionData.quantity,
    deliveryDate: sessionData.deliveryDate,
    deliveryTime: sessionData.deliveryTime,
    paymentMethod: sessionData.paymentMethod,
    phone: sessionData.phone,
    location: sessionData.location,
    customQuantity: sessionData.customQuantity || false
  }

  await supabase
    .from('telegram_orders')
    .insert({
      telegram_user_id: userId,
      order_data: orderData,
      status: 'pending'
    })

  const price = PRICING[sessionData.quantity] || (sessionData.quantity * 5.5)
  const orderDetails = `🚰 *NEW FILTERPRO ORDER*\n\n📦 Product: FilterPro Water Filter\n🔢 Quantity: ${sessionData.quantity}${sessionData.customQuantity ? ' (Custom)' : ''}\n💰 Total: $${price}\n\n📍 Location: ${sessionData.location?.address || 'Sihanoukville, Cambodia'}\n📱 Phone: ${sessionData.phone}\n\n📅 Delivery Date: ${sessionData.deliveryDate}\n⏰ Delivery Time: ${sessionData.deliveryTime}\n\n💳 Payment: ${sessionData.paymentMethod === 'qr' ? 'QR Code' : 'Cash on Delivery'}\n\nUser ID: ${userId}`

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: '@FilterProOrder',
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

async function handleBackButton(supabase: any, userId: number, chatId: number, session: any) {
  const lang = session.session_data?.language || 'en'
  
  switch (session.current_step) {
    case 'quantity':
      await updateUserStep(supabase, userId, 'language')
      await sendLanguageSelection(chatId)
      break
    case 'contact_request':
    case 'custom_quantity_input':
      await updateUserStep(supabase, userId, 'quantity')
      await sendQuantitySelection(chatId, lang)
      break
    case 'location_request':
      await updateUserStep(supabase, userId, 'contact_request')
      await sendContactRequest(chatId, lang)
      break
    case 'delivery_details':
      await updateUserStep(supabase, userId, 'location_request')
      await sendLocationRequest(chatId, lang)
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
      await updateUserStep(supabase, userId, 'payment_method')
      await sendPaymentMethod(chatId, lang, session.session_data.quantity)
      break
  }
}
