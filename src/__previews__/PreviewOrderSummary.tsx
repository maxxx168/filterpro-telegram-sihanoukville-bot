import OrderSummary from '@/components/OrderSummary';
import { OrderData } from '@/types/bot';

const mockOrderData: Partial<OrderData> = {
  quantity: 1,
  paymentMethod: 'cash',
};

export default function PreviewOrderSummary() {
  return <OrderSummary language="en" orderData={mockOrderData as OrderData} onConfirm={() => {}} onBack={() => {}} />;
}
