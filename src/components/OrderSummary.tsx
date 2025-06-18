
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { OrderData } from '@/types/bot';
import OrderHeader from './order-summary/OrderHeader';
import OrderDetails from './order-summary/OrderDetails';
import DeliveryInfo from './order-summary/DeliveryInfo';
import PaymentInfo from './order-summary/PaymentInfo';
import OrderActions from './order-summary/OrderActions';
import { saveOrderToDatabase, sendOrderNotification } from '@/utils/orderNotification';

interface OrderSummaryProps {
  language: string;
  orderData: OrderData;
  onConfirm: () => void;
  onBack: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  language, 
  orderData,
  onConfirm, 
  onBack 
}) => {
  const handleConfirm = async () => {
    const orderId = await saveOrderToDatabase(orderData);
    await sendOrderNotification(orderData, orderId);
    onConfirm();
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-[#0b0f16] border-gray-700">
      <OrderHeader language={language} />
      <CardContent className="space-y-4">
        <OrderDetails language={language} orderData={orderData} />
        <DeliveryInfo orderData={orderData} />
        <PaymentInfo language={language} orderData={orderData} />
        <OrderActions 
          language={language} 
          onBack={onBack} 
          onConfirm={handleConfirm} 
        />
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
