
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { translations } from '@/utils/translations';

interface WelcomeScreenProps {
  language: string;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ language }) => {
  const t = translations[language as keyof typeof translations] || translations.en;

  // Telegram Login Widget Component
  const TelegramLoginWidget = () => {
    React.useEffect(() => {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', 'FilterProBot');
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-auth-url', 'https://uyjdsmdrwhrbammeivek.supabase.co/functions/v1/telegram-auth');
      script.setAttribute('data-request-access', 'write');
      script.async = true;
      
      const container = document.getElementById('telegram-login-widget');
      if (container) {
        container.innerHTML = '';
        container.appendChild(script);
      }

      return () => {
        if (container && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }, []);

    return <div id="telegram-login-widget" className="flex justify-center mb-4"></div>;
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-[#0b0f16] border-gray-700">
      <CardHeader className="text-center">
        <div className="text-6xl mb-4">💧</div>
        <CardTitle className="text-2xl text-blue-400 mb-2">
          Welcome to FilterPro Bot Order
        </CardTitle>
        <p className="text-blue-300 text-base mb-2">
          Your easy solution for instant clean & clear water for all your family, right at your doorstep in just a few clicks !
        </p>
        <p className="text-sm text-gray-400">
          Sihanoukville, Cambodia
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-[#02050e]/50 rounded-lg p-4 space-y-2">
          <Badge variant="secondary" className="w-full justify-center py-2 bg-gray-700 text-gray-200">
            <a 
              href="https://t.me/FilterProShv" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-inherit no-underline hover:underline"
            >
              📢 Join our channel: @FilterProShv
            </a>
          </Badge>
          <Badge variant="outline" className="w-full justify-center py-2 border-gray-600 text-gray-300">
            <a 
              href="https://t.me/FilterProOrder" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-inherit no-underline hover:underline"
            >
              👨‍💼 Contact manager: @FilterProOrder
            </a>
          </Badge>
        </div>
        
        <TelegramLoginWidget />
      </CardContent>
    </Card>
  );
};

export default WelcomeScreen;
