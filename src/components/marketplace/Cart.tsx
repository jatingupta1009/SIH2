import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingCart, MapPin, Truck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, getTotalItems, clearCart } = useCart();

  const handleCheckout = () => {
    // Navigate first, then close modal
    navigate('/cart');
    // Small delay to ensure navigation happens before modal closes
    setTimeout(() => {
          onClose();
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({getTotalItems()} items)
          </DialogTitle>
        </DialogHeader>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">Add some products to get started!</p>
            <Button onClick={onClose}>Continue Shopping</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold line-clamp-2">{item.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold">{item.price}</span>
                      {item.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {item.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span>₹{getTotalPrice()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>₹{Math.round(getTotalPrice() * 0.18)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{getTotalPrice() + Math.round(getTotalPrice() * 0.18)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={clearCart} className="flex-1">
                Clear Cart
              </Button>
              <Button 
                onClick={handleCheckout} 
                className="flex-1"
              >
                Proceed to Checkout
              </Button>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <Truck className="h-4 w-4" />
                <span className="text-sm font-medium">Secure Payment</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Your payment is secured by blockchain technology. We never store your payment details.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Cart;
