import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft,
  CreditCard,
  Smartphone,
  Shield,
  CheckCircle,
  Loader2,
  Copy,
  ExternalLink,
  Clock,
  Lock,
  Eye,
  EyeOff,
  QrCode
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import QRCode from '@/components/ui/qr-code';

const Payment = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [blockchainHash, setBlockchainHash] = useState('');
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    cardName: ''
  });
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrTimer, setQrTimer] = useState(20);
  const [showCVV, setShowCVV] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [upiMethod, setUpiMethod] = useState('manual'); // 'manual' or 'qr'

  const subtotal = getTotalPrice();
  const tax = Math.round(subtotal * 0.18);
  const shipping = subtotal >= 500 ? 0 : 50;
  const grandTotal = subtotal + tax + shipping;

  // Generate random blockchain hash
  const generateBlockchainHash = () => {
    const chars = '0123456789ABCDEF';
    let hash = '0x';
    for (let i = 0; i < 40; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setPaymentData(prev => ({
      ...prev,
      cardNumber: value
    }));
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setPaymentData(prev => ({
      ...prev,
      expiryDate: value
    }));
  };

  const handleCVVChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setPaymentData(prev => ({
      ...prev,
      cvv: value
    }));
  };

  const validatePaymentData = () => {
    if (!consentAccepted) {
      alert('Please accept the payment consent');
      return false;
    }

    if (paymentMethod === 'card') {
      if (!paymentData.cardName || paymentData.cardName.trim() === '') {
        alert('Please enter the name on card');
        return false;
      }
      if (!paymentData.cardNumber || paymentData.cardNumber.replace(/\s/g, '').length !== 16) {
        alert('Please enter a valid 16-digit card number');
        return false;
      }
      if (!paymentData.expiryDate || paymentData.expiryDate.length !== 5) {
        alert('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      if (!paymentData.cvv || paymentData.cvv.length !== 3) {
        alert('Please enter a valid 3-digit CVV');
        return false;
      }
    } else if (paymentMethod === 'upi') {
      if (!paymentData.upiId || !paymentData.upiId.includes('@')) {
        alert('Please enter a valid UPI ID');
        return false;
      }
    }
    return true;
  };

  const handleUPIPayment = () => {
    if (!validatePaymentData()) return;
    
    if (upiMethod === 'qr') {
      setShowQRCode(true);
      setQrTimer(20);
      
      // Start countdown timer
      const timer = setInterval(() => {
        setQrTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowQRCode(false);
            // Show success screen first
            setShowSuccessScreen(true);
            
            // Then show blockchain verification after 2 seconds
            setTimeout(() => {
              setShowSuccessScreen(false);
              const hash = generateBlockchainHash();
              setBlockchainHash(hash);
              setIsVerified(true);
              
              setTimeout(() => {
                const orderData = {
                  orderId: `ORD-${Date.now()}`,
                  total: grandTotal,
                  items: cartItems.length,
                  blockchainHash: hash,
                  timestamp: new Date().toISOString()
                };
                localStorage.setItem('orderData', JSON.stringify(orderData));
                clearCart();
                navigate('/order-success');
              }, 2000);
            }, 2000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Manual UPI ID entry - show success screen immediately
      setShowSuccessScreen(true);
      
      // Then show blockchain verification after 2 seconds
      setTimeout(() => {
        setShowSuccessScreen(false);
        const hash = generateBlockchainHash();
        setBlockchainHash(hash);
        setIsVerified(true);
        
        setTimeout(() => {
          const orderData = {
            orderId: `ORD-${Date.now()}`,
            total: grandTotal,
            items: cartItems.length,
            blockchainHash: hash,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('orderData', JSON.stringify(orderData));
          clearCart();
          navigate('/order-success');
        }, 2000);
      }, 2000);
    }
  };

  const handlePayment = async () => {
    if (!validatePaymentData()) return;

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate blockchain hash
      const hash = generateBlockchainHash();
      setBlockchainHash(hash);
      
      // Show verification message
      setIsVerified(true);
      
      // Wait 2 seconds then redirect
      setTimeout(() => {
        // Store order data in localStorage for success page
        const orderData = {
          orderId: `ORD-${Date.now()}`,
          total: grandTotal,
          items: cartItems.length,
          blockchainHash: hash,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('orderData', JSON.stringify(orderData));
        
        // Clear cart and redirect
        clearCart();
        navigate('/order-success');
      }, 2000);
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No items to pay for</h2>
          <p className="text-muted-foreground mb-6">Add some products to proceed with payment!</p>
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

                  {/* Payment Method Badge */}
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {paymentMethod === 'card' ? (
                        <>
                          <CreditCard className="h-3 w-3" />
                          Card Payment
                        </>
                      ) : (
                        <>
                          <Smartphone className="h-3 w-3" />
                          UPI Payment
                        </>
                      )}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Payment Form - Right Side */}
          <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/checkout')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Payment</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Method Selection */}
              <div className="space-y-3">
                <div className="flex gap-4">
                  <Button
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('card')}
                    className="flex-1"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Credit/Debit Card
                  </Button>
                  <Button
                    variant={paymentMethod === 'upi' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('upi')}
                    className="flex-1"
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    UPI
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Card Payment Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      name="cardName"
                      value={paymentData.cardName}
                      onChange={handleInputChange}
                      placeholder="Enter name as it appears on card"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        value={paymentData.expiryDate}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <div className="relative">
                        <Input
                          id="cvv"
                          name="cvv"
                          value={paymentData.cvv}
                          onChange={handleCVVChange}
                          placeholder="123"
                          maxLength={3}
                          type={showCVV ? "text" : "password"}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCVV(!showCVV)}
                        >
                          {showCVV ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Save Card Option */}
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="saveCard" 
                      checked={saveCard}
                      onCheckedChange={setSaveCard}
                    />
                    <Label htmlFor="saveCard" className="text-sm">
                      Save card for future payments
                    </Label>
                  </div>
                </div>
              )}

              {/* UPI Payment Form */}
              {paymentMethod === 'upi' && (
                <div className="space-y-4">
                  {/* UPI Method Selection */}
                  <div className="space-y-3">
                    <Label>Choose UPI Payment Method</Label>
                    <div className="flex gap-4">
                      <Button
                        variant={upiMethod === 'manual' ? 'default' : 'outline'}
                        onClick={() => setUpiMethod('manual')}
                        className="flex-1"
                      >
                        <Smartphone className="h-4 w-4 mr-2" />
                        Enter UPI ID
                      </Button>
                      <Button
                        variant={upiMethod === 'qr' ? 'default' : 'outline'}
                        onClick={() => setUpiMethod('qr')}
                        className="flex-1"
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        Scan QR Code
                      </Button>
                    </div>
                  </div>

                  {/* Manual UPI ID Entry */}
                  {upiMethod === 'manual' && (
                    <div className="space-y-2">
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input
                        id="upiId"
                        name="upiId"
                        value={paymentData.upiId}
                        onChange={handleInputChange}
                        placeholder="yourname@paytm"
                      />
                      <p className="text-sm text-muted-foreground">
                        Enter your UPI ID (e.g., yourname@paytm, yourname@phonepe)
                      </p>
                    </div>
                  )}

                  {/* QR Code Option Info */}
                  {upiMethod === 'qr' && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800">
                        <QrCode className="h-4 w-4" />
                        <span className="text-sm font-medium">QR Code Payment</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        A QR code will be generated for 20 seconds. Scan it with your UPI app to complete the payment.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Processing Status */}
              {isProcessing && (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-lg font-medium">Transaction sent to blockchain...</p>
                  <p className="text-sm text-muted-foreground">Please wait while we verify your payment</p>
                </div>
              )}

              {/* Payment Verified */}
              {isVerified && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-green-600">✅ Payment Verified on Blockchain</p>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Blockchain Hash:</p>
                    <div className="flex items-center gap-2 justify-center">
                      <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                        {blockchainHash}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(blockchainHash)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Consent */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-900">Payment Consent</h4>
                    <p className="text-sm text-blue-800">
                      By proceeding, you authorize this payment of ₹{grandTotal.toLocaleString()} to be processed through our secure blockchain payment system. 
                      Your payment information is encrypted and secure.
                    </p>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="consent" 
                        checked={consentAccepted}
                        onCheckedChange={setConsentAccepted}
                      />
                      <Label htmlFor="consent" className="text-sm text-blue-800">
                        I authorize this payment and agree to the terms
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              {!isProcessing && !isVerified && !showQRCode && (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={paymentMethod === 'upi' ? handleUPIPayment : handlePayment}
                  disabled={!consentAccepted}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Pay ₹{grandTotal.toLocaleString()}
                </Button>
              )}

              {/* UPI QR Code */}
              {showQRCode && (
                <div className="text-center py-8">
                  <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                    <img 
                      src="/assets/qr-code.png" 
                      alt="UPI QR Code" 
                      className="mx-auto w-40 h-40 object-contain mb-4"
                    />
                    <p className="text-sm text-gray-600 mb-2">Scan QR code with your UPI app</p>
                    <div className="flex items-center justify-center gap-2 text-orange-600">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Expires in {qrTimer} seconds</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Amount: ₹{grandTotal.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Merchant: Jharkhand Marketplace
                  </p>
                </div>
              )}

              {/* Success Screen */}
              {showSuccessScreen && (
                <div className="text-center py-8">
                  <div className="bg-green-50 p-8 rounded-lg border-2 border-green-200">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-green-800 mb-2">Payment Successful!</h3>
                    <p className="text-green-700 mb-4">
                      Your payment of ₹{grandTotal.toLocaleString()} has been processed successfully.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Verifying on blockchain...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">Blockchain Secured</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your payment is processed through blockchain technology for maximum security.
                </p>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
