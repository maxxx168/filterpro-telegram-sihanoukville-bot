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
  customQuantity?: boolean;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'km', name: 'ខ្មែរ', flag: '🇰🇭' },
];

// Updated pricing structure to match bot
export const PRICING = {
  1: 5.5,
  2: 11,
  3: 16.5,
  4: 22
};

// QR Payment URLs based on quantity (matching bot)
export const QR_PAYMENT_URLS = {
  1: 'https://pay.ababank.com/wxb7ADrgnmE94LAy5',
  2: 'https://pay.ababank.com/cXB6y5w7WnzrVbBx7',
  3: 'https://pay.ababank.com/BJc9j9GqBsF1M28v9',
  4: 'https://pay.ababank.com/BJc9j9GqBsF1M28v9'
};

// Updated delivery times to match bot (3 time slots)
export const DELIVERY_TIMES = [
  { key: 'morning', label: 'Morning (9:00-12:00)', value: '9:00-12:00' },
  { key: 'afternoon', label: 'Afternoon (13:00-16:00)', value: '13:00-16:00' },
  { key: 'evening', label: 'Evening (16:00-22:00)', value: '16:00-22:00' }
];