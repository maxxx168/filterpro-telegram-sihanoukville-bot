
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { translations } from '@/utils/translations';
import { OrderData } from '@/types/bot';

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
  const pricePerUnit = 25;
  const total = orderData.quantity * pricePerUnit;

  const sendOrderToTelegram = async () => {
    const orderDetails = `
🚰 NEW FILTERPRO ORDER

📦 Product: FilterPro Water Filter
🔢 Quantity: ${orderData.quantity}
💰 Total: $${total}

📍 Location: ${orderData.location?.address || 'Sihanoukville, Cambodia'}
📱 Phone: ${orderData.phone}

📅 Delivery Date: ${orderData.deliveryDate}
⏰ Delivery Time: ${orderData.deliveryTime}

💳 Payment: ${orderData.paymentMethod === 'qr' ? 'QR Code' : 'Cash on Delivery'}

Bot Token: 8044639726:AAE9GaAznkWPEiPjYru8kTUNq0zGi8HYXMw
    `;

    console.log('Order details to send:', orderDetails);
    // In a real implementation, this would send to the Telegram bot
    // For now, we'll just log it and show success
  };

  const handleConfirm = () => {
    sendOrderToTelegram();
    onConfirm();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          {t.orderSummary}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">{t.product}</span>
            <Badge variant="secondary">x{orderData.quantity}</Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Price per unit</span>
            <span className="text-sm">${pricePerUnit}</span>
          </div>

          <Separator />

          <div className="flex justify-between items-center font-semibold">
            <span>{t.total}</span>
            <span className="text-lg">${total}</span>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
            <span className="text-green-700 text-sm">✅ {t.noDeliveryFee}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">📱 Phone:</span>
            <span>{orderData.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">📅 Date:</span>
            <span>{orderData.deliveryDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">⏰ Time:</span>
            <span>{orderData.deliveryTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">💳 Payment:</span>
            <span>{orderData.paymentMethod === 'qr' ? 'QR Code' : 'Cash on Delivery'}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            className="flex-1"
            onClick={onBack}
          >
            ← {t.back}
          </Button>
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700"
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
