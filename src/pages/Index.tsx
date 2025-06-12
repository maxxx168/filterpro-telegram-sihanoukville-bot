
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import WelcomeScreen from '@/components/WelcomeScreen';
import LanguageSelector from '@/components/LanguageSelector';
import QuantitySelector from '@/components/QuantitySelector';
import DeliveryDetails from '@/components/DeliveryDetails';
import PaymentMethod from '@/components/PaymentMethod';
import OrderSummary from '@/components/OrderSummary';
import OrderConfirmation from '@/components/OrderConfirmation';
import { OrderData } from '@/types/bot';

type Step = 'welcome' | 'language' | 'quantity' | 'delivery' | 'payment' | 'summary' | 'confirmation';

const Index = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [orderData, setOrderData] = useState<Partial<OrderData>>({});

  const handleLanguageSelect = (language: string) => {
    setOrderData({ ...orderData, language });
    setCurrentStep('quantity');
  };

  const handleQuantitySelect = (quantity: number) => {
    setOrderData({ ...orderData, quantity });
    setCurrentStep('delivery');
  };

  const handleDeliveryComplete = (details: any) => {
    setOrderData({ 
      ...orderData, 
      location: details.location,
      phone: details.phone,
      deliveryDate: details.deliveryDate,
      deliveryTime: details.deliveryTime
    });
    setCurrentStep('payment');
  };

  const handlePaymentSelect = (paymentMethod: 'qr' | 'cash') => {
    setOrderData({ ...orderData, paymentMethod });
    setCurrentStep('summary');
  };

  const handleOrderConfirm = () => {
    toast({
      title: "Order Confirmed! 🎉",
      description: "Your FilterPro order has been sent to our team. You'll receive updates on Telegram.",
    });
    setCurrentStep('confirmation');
  };

  const handleStartOver = () => {
    setOrderData({});
    setCurrentStep('welcome');
  };

  const goBack = () => {
    switch (currentStep) {
      case 'language':
        setCurrentStep('welcome');
        break;
      case 'quantity':
        setCurrentStep('language');
        break;
      case 'delivery':
        setCurrentStep('quantity');
        break;
      case 'payment':
        setCurrentStep('delivery');
        break;
      case 'summary':
        setCurrentStep('payment');
        break;
      default:
        break;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="space-y-6">
            <WelcomeScreen language={orderData.language || 'en'} />
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setCurrentStep('language')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                🚀 Start Order
              </button>
              <a 
                href="/telegram"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors text-center no-underline"
              >
                🤖 Telegram Bot Setup
              </a>
            </div>
          </div>
        );
      case 'language':
        return <LanguageSelector onSelectLanguage={handleLanguageSelect} />;
      case 'quantity':
        return (
          <QuantitySelector
            language={orderData.language!}
            onSelectQuantity={handleQuantitySelect}
            onBack={goBack}
          />
        );
      case 'delivery':
        return (
          <DeliveryDetails
            language={orderData.language!}
            onComplete={handleDeliveryComplete}
            onBack={goBack}
          />
        );
      case 'payment':
        return (
          <PaymentMethod
            language={orderData.language!}
            quantity={orderData.quantity!}
            onSelectPayment={handlePaymentSelect}
            onBack={goBack}
          />
        );
      case 'summary':
        return (
          <OrderSummary
            language={orderData.language!}
            orderData={orderData as OrderData}
            onConfirm={handleOrderConfirm}
            onBack={goBack}
          />
        );
      case 'confirmation':
        return (
          <OrderConfirmation
            language={orderData.language!}
            onStartOver={handleStartOver}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 p-4">
      <div className="container mx-auto max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-900 mb-2">
            FilterPro Bot
          </h1>
          <p className="text-blue-700 text-sm">
            🇰🇭 Sihanoukville Water Filter Delivery
          </p>
        </div>
        
        {renderStep()}
        
        <div className="mt-8 text-center text-xs text-gray-500">
          Bot ID: 8044639726:AAE9GaAznkWPEiPjYru8kTUNq0zGi8HYXMw
        </div>
      </div>
    </div>
  );
};

export default Index;
