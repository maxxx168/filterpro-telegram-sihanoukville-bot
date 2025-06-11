
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { translations } from '@/utils/translations';

interface QuantitySelectorProps {
  language: string;
  onSelectQuantity: (quantity: number) => void;
  onBack: () => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ 
  language, 
  onSelectQuantity, 
  onBack 
}) => {
  const t = translations[language as keyof typeof translations] || translations.en;

  const quantities = [1, 2, 3];
  const pricePerUnit = 25; // USD

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          {t.selectQuantity}
        </CardTitle>
        <div className="flex items-center justify-center space-x-2 mt-2">
          <div className="text-2xl">🚰</div>
          <Badge variant="secondary">FilterPro - ${pricePerUnit}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {quantities.map((qty) => (
            <Button
              key={qty}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-300"
              onClick={() => onSelectQuantity(qty)}
            >
              <span className="text-2xl font-bold text-blue-600">{qty}</span>
              <span className="text-xs text-gray-500">${qty * pricePerUnit}</span>
            </Button>
          ))}
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-center text-green-700 text-sm">
            🚚 {t.noDeliveryFee}
          </div>
        </div>

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

export default QuantitySelector;
