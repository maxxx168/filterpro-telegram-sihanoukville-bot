
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { OrderData } from '@/types/bot';

interface DeliveryInfoProps {
  orderData: OrderData;
}

const DeliveryInfo: React.FC<DeliveryInfoProps> = ({ orderData }) => {
  const isLoggedIn = !!localStorage.getItem('telegram_user_id');

  return (
    <>
      <Separator className="bg-gray-600" />
      <div className="space-y-2 text-sm">
        {!isLoggedIn && orderData.phone && (
          <div className="flex justify-between">
            <span className="text-gray-400">📱 Phone:</span>
            <span className="text-gray-200">{orderData.phone}</span>
          </div>
        )}
        {!isLoggedIn && orderData.telegramId && (
          <div className="flex justify-between">
            <span className="text-gray-400">💬 Telegram Username:</span>
            <span className="text-gray-200">@{orderData.telegramId.replace('@', '')}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-400">📍 Location:</span>
          <span className="text-gray-200">{orderData.location?.address || '10°36\'37.4"N 103°31\'44.2"E'}</span>
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
    </>
  );
};

export default DeliveryInfo;
