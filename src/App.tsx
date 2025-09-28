import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Itinerary from "./pages/Itinerary";
import CulturalInsights from "./pages/CulturalInsights";
import Marketplace from "./pages/Marketplace";
import Hotels from "./pages/Hotels";
import Events from "./pages/Events";
import Safety from "./pages/Safety";
import Journal from "./pages/Journal";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/itinerary" element={<Itinerary />} />
            <Route path="/cultural-insights" element={<CulturalInsights />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/events" element={<Events />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

          <Route path="/" element={<Index />} />

          <Route path="/itinerary" element={<Itinerary />} />

          <Route path="/cultural-insights" element={<CulturalInsights />} />

          <Route path="/marketplace" element={<Marketplace />} />

          <Route path="/events" element={<Events />} />

          <Route path="/safety" element={<Safety />} />

          <Route path="/journal" element={<Journal />} />

          <Route path="/login" element={<Login />} />

            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/order-success" element={<OrderSuccess />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}

          <Route path="*" element={<NotFound />} />

        </Routes>

      </BrowserRouter>

      </CartProvider>
    </TooltipProvider>

  </QueryClientProvider>

);



export default App;



          <Route path="/" element={<Index />} />

          <Route path="/itinerary" element={<Itinerary />} />

          <Route path="/cultural-insights" element={<CulturalInsights />} />

          <Route path="/marketplace" element={<Marketplace />} />

          <Route path="/events" element={<Events />} />

          <Route path="/safety" element={<Safety />} />

          <Route path="/journal" element={<Journal />} />

          <Route path="/login" element={<Login />} />

            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/order-success" element={<OrderSuccess />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}

          <Route path="*" element={<NotFound />} />

        </Routes>

      </BrowserRouter>

      </CartProvider>
    </TooltipProvider>

  </QueryClientProvider>

);



export default App;


