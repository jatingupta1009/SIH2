import { useState, useEffect } from 'react';
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
  ArrowRight,
  CreditCard
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { cartApi } from '@/api/cartApi';
import { checkoutApi } from '@/api/checkoutApi';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [cartData, setCartData] = useState(null);

  // Group items by seller
  const groupedItems = cartItems.reduce((acc, item) => {
    const sellerId = item.seller.id;
    if (!acc[sellerId]) {
      acc[sellerId] = {
        seller: item.seller,
        items: []
      };
    }
    acc[sellerId].items.push(item);
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
      // TODO: Implement actual coupon validation API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
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

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    setIsCheckingOut(true);
    try {
      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          variant: item.variant
        })),
        shippingAddress: {
          name: 'John Doe',
          phone: '9876543210',
          address: '123 Main Street',
          city: 'Ranchi',
          state: 'Jharkhand',
          pincode: '834001',
          landmark: 'Near Railway Station'
        },
        paymentMethod: 'razorpay',
        coupon: appliedCoupon?.code
      };

      // Create order
      const orderResponse = await checkoutApi.createOrder(orderData);
      
      // Initialize Razorpay
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
        amount: orderResponse.amount * 100, // Amount in paise
        currency: 'INR',
        name: 'Jharkhand Marketplace',
        description: `Payment for order ${orderResponse.orderNumber}`,
        order_id: orderResponse.razorpayOrderId,
        handler: async function (response) {
          try {
            // Verify payment
            await checkoutApi.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            
            // Clear cart and redirect to success page
            clearCart();
            alert('Payment successful! Order placed.');
            // TODO: Navigate to order confirmation page
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        notes: {
          order_id: orderResponse.orderId
        },
        theme: {
          color: '#059669'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some products to get started!</p>
          <Button onClick={() => window.history.back()}>
            Continue Shopping
          </Button>
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
                  <span className="text-primary">{group.seller.name}</span>
                  <Badge variant="secondary">{group.seller.shopName}</Badge>
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
                        <span className="font-bold">₹{item.price.toLocaleString()}</span>
                        {item.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{item.originalPrice.toLocaleString()}
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
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
              </Button>

              {/* Security Notice */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <Truck className="h-4 w-4" />
                  <span className="text-sm font-medium">Secure Payment</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your payment is secured by Razorpay. We never store your payment details.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Continue Shopping */}
          <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
