
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { translations } from '@/utils/translations';

interface WelcomeScreenProps {
  language: string;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ language }) => {
  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
      <CardHeader className="text-center">
        <div className="text-6xl mb-4">💧</div>
        <CardTitle className="text-2xl text-blue-900 mb-2">
          Welcome to FilterPro Bot Order
        </CardTitle>
        <p className="text-blue-700 text-base mb-2">
          Your easy solution for instant clean water right at your doorstep
        </p>
        <p className="text-sm text-gray-600">
          Sihanoukville, Cambodia
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white/50 rounded-lg p-4 space-y-2">
          <Badge variant="secondary" className="w-full justify-center py-2">
            <a 
              href="https://t.me/FilterProShv" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-inherit no-underline hover:underline"
            >
              📢 Join our channel: @FilterProShv
            </a>
          </Badge>
          <Badge variant="outline" className="w-full justify-center py-2">
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
        <div className="text-center">
          <div className="text-4xl mb-2">💧</div>
          <p className="text-sm text-gray-600">FilterPro - Premium Water Filter</p>
          <p className="text-xs text-gray-500">Sihanoukville, Cambodia</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeScreen;
