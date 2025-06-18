
import React from 'react';
import { translations } from '@/utils/translations';
import { OrderData, QR_PAYMENT_URLS } from '@/types/bot';

interface PaymentInfoProps {
  language: string;
  orderData: OrderData;
}

const PaymentInfo: React.FC<PaymentInfoProps> = ({ language, orderData }) => {
  const t = translations[language as keyof typeof translations] || translations.en;

  const getQRPaymentUrl = () => {
    return orderData.customQuantity ? QR_PAYMENT_URLS.custom : (QR_PAYMENT_URLS[orderData.quantity] || QR_PAYMENT_URLS[1]);
  };

  if (orderData.paymentMethod !== 'qr') {
    return null;
  }

  return (
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
  );
};

export default PaymentInfo;
