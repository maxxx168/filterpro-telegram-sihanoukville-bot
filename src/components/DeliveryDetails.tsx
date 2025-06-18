
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { translations } from '@/utils/translations';

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
  const [phone, setPhone] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [location, setLocation] = useState<any>(null);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();
  
  const t = translations[language as keyof typeof translations] || translations.en;
  const isLoggedIn = !!localStorage.getItem('telegram_user_id');

  const formatCoordinates = (lat: number, lng: number) => {
    const latDeg = Math.floor(Math.abs(lat));
    const latMin = Math.floor((Math.abs(lat) - latDeg) * 60);
    const latSec = ((Math.abs(lat) - latDeg - latMin / 60) * 3600).toFixed(1);
    const latDir = lat >= 0 ? 'N' : 'S';

    const lngDeg = Math.floor(Math.abs(lng));
    const lngMin = Math.floor((Math.abs(lng) - lngDeg) * 60);
    const lngSec = ((Math.abs(lng) - lngDeg - lngMin / 60) * 3600).toFixed(1);
    const lngDir = lng >= 0 ? 'E' : 'W';

    return `${latDeg}°${latMin}'${latSec}"${latDir} ${lngDeg}°${lngMin}'${lngSec}"${lngDir}`;
  };

  const handleLocationRequest = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location services",
        variant: "destructive"
      });
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const formattedAddress = formatCoordinates(latitude, longitude);
        setLocation({
          latitude,
          longitude,
          address: formattedAddress
        });
        setIsGettingLocation(false);
        toast({
          title: "Location received! ✅",
          description: "Your location has been captured successfully",
        });
      },
      (error) => {
        setIsGettingLocation(false);
        console.error('Geolocation error:', error);
        toast({
          title: "Location access denied",
          description: "Please allow location access to continue with the order",
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleSubmit = () => {
    if (!isLoggedIn && !phone && !telegramId) {
      toast({
        title: "Contact info required",
        description: "Please enter your phone number or Telegram ID.",
        variant: "destructive"
      });
      return;
    }

    if (!location) {
      toast({
        title: "Location required",
        description: "Please share your location",
        variant: "destructive"
      });
      return;
    }

    if (!deliveryDate || !deliveryTime) {
      toast({
        title: "Delivery details required",
        description: "Please select delivery date and time",
        variant: "destructive"
      });
      return;
    }

    onComplete({
      phone: isLoggedIn ? null : phone,
      telegramId: isLoggedIn ? null : telegramId,
      location,
      deliveryDate,
      deliveryTime
    });
  };

  const deliveryTimes = [
    { key: 'morning', label: 'Morning (9:00-12:00)', value: '9:00-12:00' },
    { key: 'afternoon', label: 'Afternoon (13:00-16:00)', value: '13:00-16:00' },
    { key: 'evening', label: 'Evening (16:00-22:00)', value: '16:00-22:00' }
  ];

  return (
    <Card className="w-full max-w-md mx-auto bg-[#0b0f16] border-gray-700">
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-blue-400">
          📦 {t.deliveryDetails}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isLoggedIn && (
           <>
            <div className="text-sm text-center text-gray-400">
              Please provide a way to contact you:
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">{t.phoneNumber}:</label>
              <Input
                type="tel"
                placeholder="+855..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-gray-800 border-gray-600 text-gray-200"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Separator className="flex-1 bg-gray-600" />
              <span className="text-xs text-gray-500">OR</span>
              <Separator className="flex-1 bg-gray-600" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Telegram Username:</label>
              <Input
                type="text"
                placeholder="@username"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                className="bg-gray-800 border-gray-600 text-gray-200"
              />
            </div>
            <Separator className="bg-gray-600" />
          </>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">📍 Location:</label>
          <Button
            variant="outline"
            className="w-full bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700"
            onClick={handleLocationRequest}
            disabled={isGettingLocation}
          >
            {isGettingLocation 
              ? 'Getting location...' 
              : location 
                ? '✅ Location received'
                : '📍 Share Location'
            }
          </Button>
          {location && (
            <p className="text-xs text-gray-400">
              Location: {location.address}
            </p>
          )}
        </div>

        <Separator className="bg-gray-600" />

        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">📅 Delivery Date:</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={deliveryDate === 'today' ? 'default' : 'outline'}
              className={deliveryDate === 'today' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700'
              }
              onClick={() => setDeliveryDate('today')}
            >
              📅 {t.today}
            </Button>
            <Button
              variant={deliveryDate === 'tomorrow' ? 'default' : 'outline'}
              className={deliveryDate === 'tomorrow' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700'
              }
              onClick={() => setDeliveryDate('tomorrow')}
            >
              📅 {t.tomorrow}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">⏰ Delivery Time:</label>
          <div className="space-y-2">
            {deliveryTimes.map((time) => (
              <Button
                key={time.key}
                variant={deliveryTime === time.value ? 'default' : 'outline'}
                className={`w-full text-left ${
                  deliveryTime === time.value
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700'
                }`}
                onClick={() => setDeliveryTime(time.value)}
              >
                {time.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex space-x-2 pt-4">
          <Button 
            variant="ghost" 
            className="flex-1 text-gray-300 hover:text-white hover:bg-gray-700"
            onClick={onBack}
          >
            ← {t.back}
          </Button>
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSubmit}
          >
            {t.next} →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryDetails;
