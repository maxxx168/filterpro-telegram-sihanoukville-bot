
export const TELEGRAM_API = `https://api.telegram.org/bot${Deno.env.get('TELEGRAM_BOT_TOKEN')}`

export const PRICING = {
  1: 5.5,
  2: 11,
  3: 16.5,
  4: 22
};

export const QR_PAYMENT_URLS = {
  1: 'https://pay.ababank.com/iHeoEF1oWqsJguGn9',
  2: 'https://pay.ababank.com/BJc9j9GqBsF1M28v9',
  3: 'https://pay.ababank.com/cXB6y5w7WnzrVbBx7',
  4: 'https://pay.ababank.com/wxb7ADrgnmE94LAy5',
  custom: 'https://pay.ababank.com/KDugruTSgyhv8q4r6'
};

export const deliveryTimes = [
  { key: 'morning', label: 'Morning (9:00-12:00)', value: '9:00-12:00' },
  { key: 'afternoon', label: 'Afternoon (13:00-16:00)', value: '13:00-16:00' },
  { key: 'evening', label: 'Evening (16:00-22:00)', value: '16:00-22:00' }
];
