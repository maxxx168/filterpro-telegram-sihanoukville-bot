
export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface OrderData {
  language: string;
  quantity: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  phone: string;
  deliveryDate: 'today' | 'tomorrow';
  deliveryTime: string;
  paymentMethod: 'qr' | 'cash';
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'km', name: 'ខ្មែរ', flag: '🇰🇭' },
];

export const DELIVERY_TIMES = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
  '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM',
  '9:00 PM', '10:00 PM'
];
