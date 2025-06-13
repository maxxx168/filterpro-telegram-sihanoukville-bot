
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { translations } from '@/utils/translations';
import { PRICING, QR_PAYMENT_URLS } from '@/types/bot';

interface PaymentMethodProps {
  language: string;
  quantity: number;
  customQuantity?: boolean;
  onSelectPayment: (method: 'qr' | 'cash') => void;
  onBack: () => void;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({ 
  language, 
  quantity,
  customQuantity = false,
  onSelectPayment, 
  onBack 
}) => {
  const t = translations[language as keyof typeof translations] || translations.en;
  const total = PRICING[quantity] || (quantity * 5.5);

  const handleQRPayment = () => {
    const qrUrl = customQuantity ? QR_PAYMENT_URLS.custom : QR_PAYMENT_URLS[quantity] || QR_PAYMENT_URLS[1];
    window.open(qrUrl, '_blank');
    onSelectPayment('qr');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          {t.paymentMethod}
        </CardTitle>
        <Badge variant="secondary" className="text-lg">
          {t.total}: ${total}
        </Badge>
        {customQuantity && (
          <Badge variant="outline" className="text-sm">
            Custom Quantity: {quantity}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full h-16 flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-300"
          onClick={handleQRPayment}
        >
          <div className="text-2xl mb-1">📱</div>
          <span>{t.qrPayment}</span>
        </Button>

        <Button
          variant="outline"
          className="w-full h-16 flex flex-col items-center justify-center hover:bg-green-50 hover:border-green-300"
          onClick={() => onSelectPayment('cash')}
        >
          <div className="text-2xl mb-1">💵</div>
          <span>{t.cashOnDelivery}</span>
        </Button>

        <Button 
          variant="ghost" 
          className="w-full"
          onClick={onBack}
        >
          ← {t.back}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentMethod;
