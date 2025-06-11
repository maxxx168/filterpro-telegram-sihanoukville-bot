
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LANGUAGES, Language } from '@/types/bot';
import { translations } from '@/utils/translations';

interface LanguageSelectorProps {
  onSelectLanguage: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelectLanguage }) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          {translations.en.selectLanguage}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {LANGUAGES.map((lang: Language) => (
          <Button
            key={lang.code}
            variant="outline"
            className="w-full text-left justify-start h-12 text-lg"
            onClick={() => onSelectLanguage(lang.code)}
          >
            <span className="mr-3 text-xl">{lang.flag}</span>
            {lang.name}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default LanguageSelector;
