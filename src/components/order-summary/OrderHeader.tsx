
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { translations } from '@/utils/translations';

interface OrderHeaderProps {
  language: string;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({ language }) => {
  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <CardHeader className="text-center">
      <CardTitle className="text-xl text-blue-400">
        📋 {t.orderSummary}
      </CardTitle>
    </CardHeader>
  );
};

export default OrderHeader;
