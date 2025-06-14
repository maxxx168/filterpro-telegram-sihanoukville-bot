
import { TELEGRAM_API, PRICING, QR_PAYMENT_URLS, deliveryTimes } from "./constants.ts"

export async function sendLanguageSelection(chatId: number, t: any) {
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

export async function sendQuantitySelection(chatId: number, t: any) {
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

export async function sendCustomQuantityRequest(chatId: number, t: any) {
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

export async function sendLocationRequest(chatId: number, t: any) {
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

export async function sendDeliveryDetails(chatId: number, t: any) {
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

export async function sendTimeSelection(chatId: number, t: any) {
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

export async function sendPaymentMethod(chatId: number, t: any, quantity: number) {
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

export async function sendQRPayment(chatId: number, t: any, quantity: number, isCustom: boolean = false) {
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

export async function sendOrderSummary(chatId: number, t: any, sessionData: any) {
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

export async function sendOrderConfirmationMessages(chatId: number, t: any, sessionData: any, price: number, orderId: string, userId: number, username?: string) {
  const supabaseLink = `https://supabase.com/dashboard/project/uyjdsmdrwhrbammeivek/editor/tables/telegram_orders/rows?filter=id%3Aeq%3A${orderId}`
  const customerContactLink = `tg://user?id=${userId}`
  const locationLink = sessionData.location ? `https://maps.google.com/?q=${sessionData.location.latitude},${sessionData.location.longitude}` : 'Not provided';
  const customerIdentifier = sessionData.phone ? sessionData.phone : (username ? `@${username}` : userId);
  
  const orderDetails = `*New Order: [${orderId}]*
  
🔢 Quantity: ${sessionData.quantity}
💰 Total: $${price}
📅 Date: ${sessionData.deliveryDate === 'today' ? t.today : t.tomorrow}
⏰ Time: ${sessionData.deliveryTime}
💳 Payment: ${sessionData.paymentMethod === 'qr' ? t.qrPayment : t.cashOnDelivery}
📍 [Delivery Location](${locationLink})

👤 Customer: ${customerIdentifier}`

  const managerKeyboard = {
    inline_keyboard: [
      [
        { text: 'View in Supabase', url: supabaseLink },
        { text: 'Contact Customer', url: customerContactLink }
      ],
      [
        { text: '✅ Mark as Completed', callback_data: `complete_${orderId}` }
      ]
    ]
  }

  // Message to manager/channel
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: -1002863245380, // Manager Chat ID
      text: orderDetails,
      parse_mode: 'Markdown',
      reply_markup: managerKeyboard
    })
  })

  // Message to customer
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
}

export async function sendLocationConfirmation(chatId: number, t: any) {
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

export async function sendTimeConfirmation(chatId: number, t: any, lastTime: string) {
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
