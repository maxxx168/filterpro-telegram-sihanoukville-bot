import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TelegramBot from "./pages/TelegramBot";
import NotFound from "./pages/NotFound";
// Preview screens (now in __previews__)
import PreviewWelcomeScreen from './__previews__/PreviewWelcomeScreen';
import PreviewLanguageSelector from './__previews__/PreviewLanguageSelector';
import PreviewQuantitySelector from './__previews__/PreviewQuantitySelector';
import PreviewDeliveryDetails from './__previews__/PreviewDeliveryDetails';
import PreviewPaymentMethod from './__previews__/PreviewPaymentMethod';
import PreviewOrderSummary from './__previews__/PreviewOrderSummary';
import PreviewOrderConfirmation from './__previews__/PreviewOrderConfirmation';
import PreviewNotFound from './__previews__/PreviewNotFound';
import PreviewTelegramSetup from './__previews__/PreviewTelegramSetup';
import PreviewTelegramBot from './__previews__/PreviewTelegramBot';
import PreviewIndex from './__previews__/PreviewIndex';
import PreviewRoot from './__previews__/PreviewRoot';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/telegram" element={<TelegramBot />} />
          {/* Preview routes only in development */}
          {import.meta.env.DEV && (
            <>
              <Route path="/PreviewWelcomeScreen" element={<PreviewWelcomeScreen />} />
              <Route path="/PreviewLanguageSelector" element={<PreviewLanguageSelector />} />
              <Route path="/PreviewQuantitySelector" element={<PreviewQuantitySelector />} />
              <Route path="/PreviewDeliveryDetails" element={<PreviewDeliveryDetails />} />
              <Route path="/PreviewPaymentMethod" element={<PreviewPaymentMethod />} />
              <Route path="/PreviewOrderSummary" element={<PreviewOrderSummary />} />
              <Route path="/PreviewOrderConfirmation" element={<PreviewOrderConfirmation />} />
              <Route path="/PreviewNotFound" element={<PreviewNotFound />} />
              <Route path="/PreviewTelegramSetup" element={<PreviewTelegramSetup />} />
              <Route path="/PreviewTelegramBot" element={<PreviewTelegramBot />} />
              <Route path="/PreviewIndex" element={<PreviewIndex />} />
              <Route path="/PreviewRoot" element={<PreviewRoot />} />
            </>
          )}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
