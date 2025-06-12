
import React from 'react';
import TelegramSetup from '@/components/TelegramSetup';

const TelegramBot = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            🤖 Telegram Bot Management
          </h1>
          <p className="text-muted-foreground">
            FilterPro Bot - Complete implementation and setup
          </p>
        </div>
        
        <TelegramSetup />
      </div>
    </div>
  );
};

export default TelegramBot;
