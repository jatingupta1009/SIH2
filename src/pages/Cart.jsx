import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  MapPin, 
  Truck,
  Tag,
  CreditCard
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, getTotalItems, clearCart, refreshCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Debug logging
  console.log('Cart page - cartItems:', cartItems);
  console.log('Cart page - cartItems length:', cartItems.length);
  console.log('Cart page - localStorage cartItems:', localStorage.getItem('cartItems'));

  // Auto-refresh cart on page load
  React.useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Group items by vendor (since we don't have seller info in the current cart context)
  const groupedItems = cartItems.reduce((acc, item) => {
    const vendor = item.vendor;
    if (!acc[vendor]) {
      acc[vendor] = {
        vendor: vendor,
        items: []
      };
    }
    acc[vendor].items.push(item);
    return acc;
  }, {});

  const subtotal = getTotalPrice();
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const shipping = subtotal >= 500 ? 0 : 50; // Free shipping above ₹500
  const discount = appliedCoupon ? Math.round(subtotal * 0.1) : 0; // 10% discount for demo
  const grandTotal = subtotal + tax + shipping - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsApplyingCoupon(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (couponCode.toLowerCase() === 'welcome10') {
        setAppliedCoupon({
          code: couponCode,
          discount: Math.round(subtotal * 0.1),
          type: 'percentage'
        });
        setCouponCode('');
      } else {
        alert('Invalid coupon code');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      alert('Error applying coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some products to get started!</p>
          <div className="space-y-4">
            <Button onClick={() => navigate('/marketplace')}>
              Continue Shopping
            </Button>
            {/* Debug button */}
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log('Debug - Current localStorage:', localStorage.getItem('cartItems'));
                  refreshCart();
                }}
                className="text-xs"
              >
                Debug: Refresh Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-2xl font-bold">Shopping Cart ({getTotalItems()} items)</h1>
          
          {Object.values(groupedItems).map((group, groupIndex) => (
            <Card key={groupIndex}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>Sold by</span>
                  <span className="text-primary">{group.vendor}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.items.map((item) => (
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
                        <span className="font-bold">₹{parseInt(item.price.replace(/[₹,]/g, "")).toLocaleString()}</span>
                        {item.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{parseInt(item.originalPrice.replace(/[₹,]/g, "")).toLocaleString()}
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
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Coupon Section */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={isApplyingCoupon || !!appliedCoupon}
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !!appliedCoupon}
                  >
                    <Tag className="h-4 w-4 mr-1" />
                    Apply
                  </Button>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                    <span className="text-sm text-green-800">
                      Coupon "{appliedCoupon.code}" applied
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="text-green-800 hover:text-green-900"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className={shipping === 0 ? "text-green-600" : ""}>
                    {shipping === 0 ? "Free" : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleProceedToCheckout}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Proceed to Checkout
              </Button>

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
            </CardContent>
          </Card>

          {/* Continue Shopping */}
          <Button variant="outline" className="w-full" onClick={() => navigate('/marketplace')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
