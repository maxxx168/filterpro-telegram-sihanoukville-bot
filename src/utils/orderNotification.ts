
import { supabase } from '@/integrations/supabase/client';
import { OrderData, PRICING } from '@/types/bot';

export const saveOrderToDatabase = async (orderData: OrderData) => {
  try {
    const telegramUserId = localStorage.getItem('telegram_user_id');
    
    const { data, error } = await supabase
      .from('telegram_orders')
      .insert({
        telegram_user_id: telegramUserId ? parseInt(telegramUserId) : 0,
        order_data: orderData as any,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error('Error saving order:', error);
    return Math.random().toString(36).substr(2, 9);
  }
};

export const sendOrderNotification = async (orderData: OrderData, orderId: string) => {
  const telegramUserId = localStorage.getItem('telegram_user_id');
  const isLoggedIn = !!telegramUserId;
  const total = PRICING[orderData.quantity] || (orderData.quantity * 5.5);
  
  // Create Google Maps link with actual coordinates
  const mapsLink = orderData.location ? 
    `https://maps.google.com/?q=${orderData.location.latitude},${orderData.location.longitude}` : 
    'https://maps.google.com/?q=10.6104,103.5282';

  // Create Supabase order link for inline button only
  const supabaseLink = `https://supabase.com/dashboard/project/uyjdsmdrwhrbammeivek/editor/tables/telegram_orders/rows?filter=id%3Aeq%3A${orderId}`;

  // Format order details without UUID and Supabase link in message, with flow indicator
  const orderDetails = `📋 NEW FILTERPRO ORDER

*New order from Webapp*

🔢 Quantity: ${orderData.quantity}${orderData.customQuantity ? ' (Custom)' : ''}
💰 Total: $${total}
👤 Customer Info: ${isLoggedIn ? `📱 Telegram ID: ${telegramUserId}` : ''}${!isLoggedIn && orderData.phone ? `📱 Phone: ${orderData.phone}` : ''}${!isLoggedIn && orderData.telegramId ? `\n💬 Telegram Username: @${orderData.telegramId.replace('@', '')}` : ''}
📍 Delivery Details:
Location: ${orderData.location?.address || '10°36\'37.4"N 103°31\'44.2"E'}
📅 Date: ${orderData.deliveryDate}
⏰ Time: ${orderData.deliveryTime}
💳 Payment: ${orderData.paymentMethod === 'qr' ? 'QR Code Payment' : 'Cash on Delivery'}

[Delivery Location](${mapsLink})
[Contact Customer](https://t.me/FilterProOrder)`;

  try {
    const { error } = await supabase.functions.invoke('send-order-notification', {
      body: { orderDetails, orderId, supabaseLink },
    });
    if (error) throw error;
    console.log('Order notification sent to manager successfully via edge function.');
  } catch (error) {
    console.error('Error sending order to manager:', error);
    
    // Create a simplified version without buttons for manual forwarding
    const simplifiedOrderDetails = `📋 NEW FILTERPRO ORDER

*New order from Webapp*

🔢 Quantity: ${orderData.quantity}${orderData.customQuantity ? ' (Custom)' : ''}
💰 Total: $${total}
👤 Customer Info: ${isLoggedIn ? `📱 Telegram ID: ${telegramUserId}` : ''}${!isLoggedIn && orderData.phone ? `📱 Phone: ${orderData.phone}` : ''}${!isLoggedIn && orderData.telegramId ? `\n💬 Telegram Username: @${orderData.telegramId.replace('@', '')}` : ''}
📍 Delivery Details:
Location: ${orderData.location?.address || '10°36\'37.4"N 103°31\'44.2"E'}
📅 Date: ${orderData.deliveryDate}
⏰ Time: ${orderData.deliveryTime}
💳 Payment: ${orderData.paymentMethod === 'qr' ? 'QR Code Payment' : 'Cash on Delivery'}

Delivery Location: ${mapsLink}
Contact Customer: https://t.me/FilterProOrder
View Order in Supabase: ${supabaseLink}`;

    console.log('Simplified order details for manual forwarding:', simplifiedOrderDetails);
  }
};
