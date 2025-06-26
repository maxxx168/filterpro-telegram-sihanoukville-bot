
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
    <Card className="w-full max-w-md mx-auto bg-card border-border">
      <CardHeader className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <CardTitle className="text-xl text-foreground">
          {t.orderConfirmed}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="space-y-2">
          <Badge variant="secondary" className="w-full justify-center py-2">
            📢 {t.channelInfo}
          </Badge>
          <Badge variant="outline" className="w-full justify-center py-2">
            👨‍💼 {t.managerInfo}
          </Badge>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <div className="text-4xl mb-2">🚚</div>
          <p className="text-sm text-foreground font-medium">
            {t.deliveryRegistered}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t.deliveryBenefits}
          </p>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={onStartOver}
        >
          🔄 {t.startNewOrder}
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrderConfirmation;
