import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Truck,
  Shield,
  Lock,
  CheckCircle
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, getTotalItems } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Jharkhand',
    pincode: '',
    landmark: ''
  });
  const [saveAddress, setSaveAddress] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const subtotal = getTotalPrice();
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const shipping = subtotal >= 500 ? 0 : 50; // Free shipping above ₹500
  const grandTotal = subtotal + tax + shipping;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.pincode) {
      alert('Please fill in all required fields');
      return;
    }

    if (!termsAccepted) {
      alert('Please accept the terms and conditions');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store form data in localStorage for payment page
      localStorage.setItem('checkoutData', JSON.stringify(formData));
      
      // Navigate to payment page
      navigate('/payment');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No items in cart</h2>
          <p className="text-muted-foreground mb-6">Add some products to proceed with checkout!</p>
          <Button onClick={() => navigate('/marketplace')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
          {/* Order Summary - Left Side */}
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="text-sm font-medium">
                            ₹{parseInt(item.price.replace(/[₹,]/g, "")).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
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
                      <span>Taxes (18% GST)</span>
                      <span>₹{tax.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <Truck className="h-4 w-4" />
                      <span className="text-sm font-medium">Secure Checkout</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Your information is secure and will be processed through blockchain technology.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Checkout Form - Right Side */}
          <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/cart')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Checkout</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your 10-digit phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your complete address"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Enter state"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="Enter pincode"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="landmark">Landmark (Optional)</Label>
                  <Input
                    id="landmark"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    placeholder="Enter nearby landmark"
                  />
                </div>

                {/* Save Address Option */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="saveAddress" 
                    checked={saveAddress}
                    onCheckedChange={setSaveAddress}
                  />
                  <Label htmlFor="saveAddress" className="text-sm">
                    Save this address for future orders
                  </Label>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={termsAccepted}
                    onCheckedChange={setTermsAccepted}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the <span className="text-blue-600 underline cursor-pointer">Terms and Conditions</span> and <span className="text-blue-600 underline cursor-pointer">Privacy Policy</span>
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Processing...' : 'Continue to Payment'}
                </Button>
              </form>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
