import PaymentMethod from '@/components/PaymentMethod';

export default function PreviewPaymentMethod() {
  return <PaymentMethod language="en" quantity={1} onSelectPayment={() => {}} onBack={() => {}} />;
}
