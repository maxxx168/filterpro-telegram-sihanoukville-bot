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
  const [showLogo, setShowLogo] = useState(() => true);

  const handleLanguageSelect = (language: string) => {
    setOrderData({ ...orderData, language });
    setCurrentStep('quantity');
  };

  const handleStartOrder = () => {
    setShowLogo(false);
    setCurrentStep('language');
  };

  const handleQuantitySelect = (quantity: number, isCustom = false) => {
    setOrderData({ 
      ...orderData, 
      quantity,
      customQuantity: isCustom
    });
    setCurrentStep('delivery');
  };

  const handleDeliveryComplete = (details: any) => {
    setOrderData({ 
      ...orderData, 
      location: details.location,
      phone: details.phone,
      telegramId: details.telegramId,
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
            <div className="flex flex-col gap-3 mt-4">
              <button 
                onClick={handleStartOrder}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                🚀 Start Order
              </button>
            <div className="flex flex-col gap-3 mt-4">
              <a 
                href="https://t.me/FilterProShv" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-700 text-gray-200 px-8 py-3 rounded-lg font-medium text-center no-underline hover:underline"
              >
                📢 Join our channel: @FilterProShv
              </a>
              <a 
                href="https://t.me/FilterProOrder" 
                target="_blank" 
                rel="noopener noreferrer"
                className="border border-gray-600 text-gray-300 px-8 py-3 rounded-lg font-medium text-center no-underline hover:underline"
              >
                👨‍💼 Contact manager: @FilterProOrder
              </a>
            </div>
          </div>
          </div>
        )
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
            customQuantity={orderData.customQuantity}
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
    <div className="min-h-screen bg-[#02050e] p-4">
      <div className="container mx-auto max-w-lg">
        {showLogo && (
          <div className="text-center mb-6">
            <img 
              src="/lovable-uploads/10f097f0-b96d-4750-bd44-c82ae374d0d2.png" 
              alt="FilterPro Sediment Cartridge" 
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            />
          </div>
        )}
        {renderStep()}
      </div>
    </div>
  );
};

export default Index;
