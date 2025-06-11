
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { translations } from '@/utils/translations';

interface OrderConfirmationProps {
  language: string;
  onStartOver: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ 
  language, 
  onStartOver 
}) => {
  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <CardTitle className="text-xl text-green-800">
          {t.orderConfirmed}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="space-y-2">
          <Badge variant="secondary" className="w-full justify-center py-2">
            📢 Updates: @quickMakss
          </Badge>
          <Badge variant="outline" className="w-full justify-center py-2">
            👨‍💼 Manager: @quickMakss
          </Badge>
        </div>
        
        <div className="bg-white/50 rounded-lg p-4">
          <div className="text-4xl mb-2">🚚</div>
          <p className="text-sm text-gray-600">
            Your FilterPro will be delivered in Sihanoukville
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Free delivery • Premium quality • Fresh water
          </p>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={onStartOver}
        >
          🔄 Place Another Order
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrderConfirmation;
