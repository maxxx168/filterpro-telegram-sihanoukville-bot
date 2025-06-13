
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { translations } from '@/utils/translations';
import { DELIVERY_TIMES } from '@/types/bot';

interface DeliveryDetailsProps {
  language: string;
  onComplete: (details: any) => void;
  onBack: () => void;
}

const DeliveryDetails: React.FC<DeliveryDetailsProps> = ({ 
  language, 
  onComplete, 
  onBack 
}) => {
  const t = translations[language as keyof typeof translations] || translations.en;
  const [phone, setPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<'today' | 'tomorrow' | ''>('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [location, setLocation] = useState({
    latitude: 10.6098,
    longitude: 103.4879,
    address: 'Sihanoukville, Cambodia'
  });

  const isLoggedIn = !!localStorage.getItem('telegram_user_id');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn && !phone.trim()) {
      alert(t.enterPhone);
      return;
    }
    
    if (!deliveryDate) {
      alert(t.selectDate);
      return;
    }
    
    if (!deliveryTime) {
      alert(t.selectTime);
      return;
    }

    onComplete({
      phone: isLoggedIn ? `+855${localStorage.getItem('telegram_user_id')}` : phone,
      location,
      deliveryDate,
      deliveryTime
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-[#0b0f16] border-gray-700">
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-blue-400">
          {t.deliveryDetails}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoggedIn && (
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                📱 {t.phoneNumber}
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+855..."
                className="bg-[#02050e] border-gray-600 text-gray-200 placeholder-gray-400"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-300 mb-3 block">
              📅 {t.selectDate}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={deliveryDate === 'today' ? 'default' : 'outline'}
                className={deliveryDate === 'today' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                }
                onClick={() => setDeliveryDate('today')}
              >
                {t.today}
              </Button>
              <Button
                type="button"
                variant={deliveryDate === 'tomorrow' ? 'default' : 'outline'}
                className={deliveryDate === 'tomorrow' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                }
                onClick={() => setDeliveryDate('tomorrow')}
              >
                {t.tomorrow}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-3 block">
              ⏰ {t.selectTime}
            </label>
            <div className="space-y-2">
              {DELIVERY_TIMES.map((time) => (
                <Button
                  key={time.key}
                  type="button"
                  variant={deliveryTime === time.value ? 'default' : 'outline'}
                  className={`w-full ${deliveryTime === time.value 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setDeliveryTime(time.value)}
                >
                  {t[time.key as keyof typeof t] || time.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
            <div className="text-center">
              <div className="text-2xl mb-1">📍</div>
              <p className="text-blue-300 text-sm">{location.address}</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              type="button"
              variant="ghost" 
              className="flex-1 text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={onBack}
            >
              ← {t.back}
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t.next} →
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DeliveryDetails;
