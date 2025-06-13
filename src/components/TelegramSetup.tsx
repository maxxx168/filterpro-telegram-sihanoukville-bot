
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const TelegramSetup: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSettingWebhook, setIsSettingWebhook] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const botToken = '8044639726:AAE9GaAznkWPEiPjYru8kTUNq0zGi8HYXMw';
  const webhookEndpoint = 'https://uyjdsmdrwhrbammeivek.supabase.co/functions/v1/telegram-webhook';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  const setWebhook = async () => {
    setIsSettingWebhook(true);
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/setWebhook`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: webhookEndpoint,
            allowed_updates: ['message', 'callback_query']
          })
        }
      );
      
      const result = await response.json();
      
      if (result.ok) {
        toast({
          title: "Webhook Set Successfully! 🎉",
          description: "Your Telegram bot is now ready to receive messages",
        });
        setWebhookUrl(webhookEndpoint);
      } else {
        toast({
          title: "Error",
          description: result.description || "Failed to set webhook",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set webhook",
        variant: "destructive"
      });
    } finally {
      setIsSettingWebhook(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>

      <Card className="bg-[#0b0f16] border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            🤖 Telegram Bot Setup
            <Badge variant="secondary" className="bg-gray-700 text-gray-200">FilterPro Bot</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <h3 className="font-semibold text-blue-300 mb-2">✅ Bot Implementation Complete</h3>
            <p className="text-blue-200 text-sm">
              Your Telegram bot is fully implemented with all features from the web interface:
            </p>
            <ul className="text-blue-200 text-sm mt-2 space-y-1">
              <li>• Multi-language support (EN, RU, ZH, KM)</li>
              <li>• Order flow: Language → Quantity → Delivery → Payment → Confirmation</li>
              <li>• Location sharing and phone number collection</li>
              <li>• Order notifications sent to @FilterProOrder</li>
              <li>• Database storage for sessions and orders</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Bot Token:</label>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                  value={botToken} 
                  readOnly 
                  className="font-mono text-sm bg-gray-800 border-gray-600 text-gray-200"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(botToken)}
                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300">Webhook URL:</label>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                  value={webhookEndpoint} 
                  readOnly 
                  className="font-mono text-sm bg-gray-800 border-gray-600 text-gray-200"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(webhookEndpoint)}
                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={setWebhook}
              disabled={isSettingWebhook}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSettingWebhook ? 'Setting Webhook...' : '🔗 Set Webhook'}
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={() => window.open(`https://t.me/filterproshv_bot`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Bot in Telegram
            </Button>
          </div>

          {webhookUrl && (
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
              <h4 className="font-semibold text-green-300">🎉 Webhook Active!</h4>
              <p className="text-green-200 text-sm">
                Your bot is now ready to receive messages. Users can start chatting with it!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-[#0b0f16] border-gray-700">
        <CardHeader>
          <CardTitle className="text-blue-400">📱 Bot Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h4 className="font-semibold mb-2 text-gray-200">For Users:</h4>
                <ol className="text-sm space-y-1 text-gray-300">
                  <li>1. Search for your bot in Telegram</li>
                  <li>2. Send /start command</li>
                  <li>3. Follow the ordering process</li>
                  <li>4. Complete delivery details</li>
                  <li>5. Confirm order</li>
                </ol>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h4 className="font-semibold mb-2 text-gray-200">Order Notifications:</h4>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li>• Orders sent to @FilterProOrder</li>
                  <li>• Includes all customer details</li>
                  <li>• Payment method specified</li>
                  <li>• Location and delivery time</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TelegramSetup;
