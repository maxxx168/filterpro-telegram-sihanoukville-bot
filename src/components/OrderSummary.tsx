import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { translations } from '@/utils/translations';
import { OrderData, PRICING, QR_PAYMENT_URLS } from '@/types/bot';
import { supabase } from '@/integrations/supabase/client';

interface OrderSummaryProps {
  language: string;
  orderData: OrderData;
  onConfirm: () => void;
  onBack: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  language, 
  orderData,
  onConfirm, 
  onBack 
}) => {
  const t = translations[language as keyof typeof translations] || translations.en;
  const total = PRICING[orderData.quantity] || (orderData.quantity * 5.5);

  const sendOrderToManager = async (orderId: string) => {
    try {
      const telegramUserId = localStorage.getItem('telegram_user_id');
      const orderDetails = `📋 NEW FILTERPRO ORDER [${orderId}]

🚰 Product: FilterPro Water Filter
🔢 Quantity: ${orderData.quantity}${orderData.customQuantity ? ' (Custom)' : ''}
💰 Total: $${total}

👤 Customer Info:
${telegramUserId ? `📱 Telegram ID: ${telegramUserId}` : `📱 Phone: ${orderData.phone}`}

📍 Delivery Details:
Location: ${orderData.location?.address || 'Sihanoukville, Cambodia'}
📅 Date: ${orderData.deliveryDate}
⏰ Time: ${orderData.deliveryTime}

💳 Payment: ${orderData.paymentMethod === 'qr' ? 'QR Code Payment' : 'Cash on Delivery'}

[Contact Customer](https://t.me/FilterProOrder)`;

      // Send to @FilterProOrder channel/user
      await fetch(`https://api.telegram.org/bot8044639726:AAE9GaAznkWPEiPjYru8kTUNq0zGi8HYXMw/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: '@FilterProOrder',
          text: orderDetails,
          parse_mode: 'Markdown'
        })
      });

      console.log('Order notification sent to @FilterProOrder successfully');
    } catch (error) {
      console.error('Error sending order to manager:', error);
    }
  };

  const saveOrderToDatabase = async () => {
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

  const handleConfirm = async () => {
    const orderId = await saveOrderToDatabase();
    await sendOrderToManager(orderId);
    onConfirm();
  };

  const getQRPaymentUrl = () => {
    return orderData.customQuantity ? QR_PAYMENT_URLS.custom : (QR_PAYMENT_URLS[orderData.quantity] || QR_PAYMENT_URLS[1]);
  };

  const isLoggedIn = !!localStorage.getItem('telegram_user_id');

  return (
    <Card className="w-full max-w-md mx-auto bg-[#0b0f16] border-gray-700">
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-blue-400">
          📋 {t.orderSummary}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {isLoggedIn && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">📱 Telegram ID:</span>
              <span className="text-sm text-gray-200">{localStorage.getItem('telegram_user_id')}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">🚰 {t.product}:</span>
            <Badge variant="secondary" className="bg-gray-700 text-gray-200">
              {orderData.quantity}x
              {orderData.customQuantity && ' (Custom)'}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">💰 Price per unit:</span>
            <span className="text-sm text-gray-200">${orderData.customQuantity ? '5.5' : (PRICING[orderData.quantity] / orderData.quantity).toFixed(1)}</span>
          </div>

          <Separator className="bg-gray-600" />

          <div className="flex justify-between items-center font-semibold">
            <span className="text-gray-200">💰 {t.total}:</span>
            <span className="text-lg text-blue-400">${total}</span>
          </div>

          <div className="bg-green-900/30 border border-green-700 rounded-lg p-2 text-center">
            <span className="text-green-400 text-sm">✅ {t.noDeliveryFee}</span>
          </div>
        </div>

        <Separator className="bg-gray-600" />

        <div className="space-y-2 text-sm">
          {!isLoggedIn && (
            <div className="flex justify-between">
              <span className="text-gray-400">📱 Phone:</span>
              <span className="text-gray-200">{orderData.phone}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-400">📍 Location:</span>
            <span className="text-gray-200">{orderData.location?.address || 'Sihanoukville, Cambodia'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">📅 Date:</span>
            <span className="text-gray-200">{orderData.deliveryDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">⏰ Time:</span>
            <span className="text-gray-200">{orderData.deliveryTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">💳 Payment:</span>
            <span className="text-gray-200">{orderData.paymentMethod === 'qr' ? 'QR Code Payment' : 'Cash on Delivery'}</span>
          </div>
          <div className="text-center">
            <a 
              href="https://t.me/FilterProOrder" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline text-sm"
            >
              📞 Contact Manager
            </a>
          </div>
        </div>

        {orderData.paymentMethod === 'qr' && (
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
            <p className="text-blue-300 text-sm mb-2">{t.payWithQR}</p>
            <a 
              href={getQRPaymentUrl()} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline text-sm break-all"
            >
              {getQRPaymentUrl()}
            </a>
          </div>
        )}

        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            className="flex-1 text-gray-300 hover:text-white hover:bg-gray-700"
            onClick={onBack}
          >
            ← {t.back}
          </Button>
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleConfirm}
          >
            ✅ {t.confirmOrder}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
