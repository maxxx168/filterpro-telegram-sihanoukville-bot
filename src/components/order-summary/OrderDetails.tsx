
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { translations } from '@/utils/translations';
import { OrderData, PRICING } from '@/types/bot';

interface OrderDetailsProps {
  language: string;
  orderData: OrderData;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ language, orderData }) => {
  const t = translations[language as keyof typeof translations] || translations.en;
  const total = PRICING[orderData.quantity] || (orderData.quantity * 5.5);
  const isLoggedIn = !!localStorage.getItem('telegram_user_id');

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {isLoggedIn && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">📱 Telegram ID:</span>
            <span className="text-sm text-gray-200">{localStorage.getItem('telegram_user_id')}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">🔢 Quantity:</span>
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
          <span className="text-green-400 text-sm">✅ Free delivery</span>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
