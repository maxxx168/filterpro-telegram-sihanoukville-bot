
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { translations } from '@/utils/translations';
import { DELIVERY_TIMES } from '@/types/bot';

interface DeliveryDetailsProps {
  language: string;
  onComplete: (details: {
    phone: string;
    location: any;
    deliveryDate: 'today' | 'tomorrow';
    deliveryTime: string;
  }) => void;
  onBack: () => void;
}

const DeliveryDetails: React.FC<DeliveryDetailsProps> = ({ 
  language, 
  onComplete, 
  onBack 
}) => {
  const t = translations[language as keyof typeof translations] || translations.en;
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState<any>(null);
  const [deliveryDate, setDeliveryDate] = useState<'today' | 'tomorrow'>('today');
  const [deliveryTime, setDeliveryTime] = useState('');

  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Sihanoukville, Cambodia'
          });
        },
        (error) => {
          console.log('Location error:', error);
          // Fallback to manual address
          setLocation({
            latitude: 10.6096,
            longitude: 103.5310,
            address: 'Sihanoukville, Cambodia'
          });
        }
      );
    } else {
      setLocation({
        latitude: 10.6096,
        longitude: 103.5310,
        address: 'Sihanoukville, Cambodia'
      });
    }
  };

  const canProceed = phone && location && deliveryTime;

  const handleNext = () => {
    if (canProceed) {
      onComplete({
        phone,
        location,
        deliveryDate,
        deliveryTime
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          {t.deliveryDetails}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">{t.phoneNumber}</label>
          <Input
            type="tel"
            placeholder="+855..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">{t.shareLocation}</label>
          <Button
            variant={location ? "default" : "outline"}
            className="w-full"
            onClick={handleLocationShare}
          >
            {location ? '📍 Location shared' : '📍 Share location'}
          </Button>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">{t.selectDate}</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={deliveryDate === 'today' ? 'default' : 'outline'}
              onClick={() => setDeliveryDate('today')}
            >
              {t.today}
            </Button>
            <Button
              variant={deliveryDate === 'tomorrow' ? 'default' : 'outline'}
              onClick={() => setDeliveryDate('tomorrow')}
            >
              {t.tomorrow}
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">{t.selectTime}</label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {DELIVERY_TIMES.map((time) => (
              <Button
                key={time}
                variant={deliveryTime === time ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDeliveryTime(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            className="flex-1"
            onClick={onBack}
          >
            ← {t.back}
          </Button>
          <Button 
            className="flex-1"
            onClick={handleNext}
            disabled={!canProceed}
          >
            {t.next} →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryDetails;
