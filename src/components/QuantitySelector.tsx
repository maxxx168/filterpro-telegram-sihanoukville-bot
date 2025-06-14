import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { translations } from '@/utils/translations';
import { PRICING } from '@/types/bot';

interface QuantitySelectorProps {
  language: string;
  onSelectQuantity: (quantity: number, isCustom?: boolean) => void;
  onBack: () => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ 
  language, 
  onSelectQuantity, 
  onBack 
}) => {
  const t = translations[language as keyof typeof translations] || translations.en;
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customQuantity, setCustomQuantity] = useState('');

  const quantities = [1, 2, 3, 4];

  const handleCustomSubmit = () => {
    const qty = parseInt(customQuantity);
    if (isNaN(qty) || qty <= 0) {
      alert(t.invalidQuantity);
      return;
    }
    onSelectQuantity(qty, true);
  };

  if (showCustomInput) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {t.customQuantity}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t.enterCustomQuantity}
            </label>
            <Input
              type="number"
              value={customQuantity}
              onChange={(e) => setCustomQuantity(e.target.value)}
              placeholder="5"
              min="1"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              className="flex-1"
              onClick={() => setShowCustomInput(false)}
            >
              ← {t.back}
            </Button>
            <Button 
              className="flex-1"
              onClick={handleCustomSubmit}
            >
              {t.next} →
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          {t.selectQuantity}
        </CardTitle>
        <div className="flex items-center justify-center space-x-2 mt-2">
          <div className="text-2xl">🚰</div>
          <Badge variant="secondary">{t.product}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {quantities.map((qty) => (
            <Button
              key={qty}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-300"
              onClick={() => onSelectQuantity(qty)}
            >
              <span className="text-2xl font-bold text-blue-600">{qty}</span>
              <span className="text-xs text-gray-500">${PRICING[qty] || (qty * 5.5)}</span>
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full h-16 flex flex-col items-center justify-center hover:bg-green-50 hover:border-green-300"
          onClick={() => setShowCustomInput(true)}
        >
          <div className="text-2xl mb-1">📝</div>
          <span>{t.customQuantity}</span>
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

export default QuantitySelector;
