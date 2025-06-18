
import React from 'react';
import { Button } from '@/components/ui/button';
import { translations } from '@/utils/translations';

interface OrderActionsProps {
  language: string;
  onBack: () => void;
  onConfirm: () => void;
}

const OrderActions: React.FC<OrderActionsProps> = ({ language, onBack, onConfirm }) => {
  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="flex space-x-2">
      <Button 
        variant="ghost" 
        className="flex-1 text-gray-300 hover:text-white hover:bg-gray-700"
        onClick={onBack}
      >
        ← {t.back}
      </Button>
      <Button 
        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        onClick={onConfirm}
      >
        ✅ {t.confirmOrder}
      </Button>
    </div>
  );
};

export default OrderActions;
