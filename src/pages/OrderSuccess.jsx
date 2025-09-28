import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle,
  Package,
  MapPin,
  Phone,
  Mail,
  Copy,
  ExternalLink,
  Home,
  ShoppingBag,
  Download
} from 'lucide-react';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);

  useEffect(() => {
    // Get order data from localStorage
    const storedOrderData = localStorage.getItem('orderData');
    const storedCheckoutData = localStorage.getItem('checkoutData');
    
    if (storedOrderData) {
      setOrderData(JSON.parse(storedOrderData));
    }
    
    if (storedCheckoutData) {
      setCheckoutData(JSON.parse(storedCheckoutData));
    }
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const downloadReceipt = () => {
    if (!orderData || !checkoutData) return;
    
    const receiptContent = `
ORDER RECEIPT
=============

Order ID: ${orderData.orderId}
Date: ${new Date(orderData.timestamp).toLocaleDateString()}
Time: ${new Date(orderData.timestamp).toLocaleTimeString()}

CUSTOMER DETAILS:
Name: ${checkoutData.name}
Email: ${checkoutData.email}
Phone: ${checkoutData.phone}
Address: ${checkoutData.address}
City: ${checkoutData.city}
State: ${checkoutData.state}
Pincode: ${checkoutData.pincode}

PAYMENT DETAILS:
Total Amount: ₹${orderData.total.toLocaleString()}
Payment Method: Blockchain Payment
Blockchain Hash: ${orderData.blockchainHash}

Thank you for your order!
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${orderData.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!orderData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No order found</h2>
          <p className="text-muted-foreground mb-6">It seems there's no order data available.</p>
          <Button onClick={() => navigate('/marketplace')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-green-600 mb-2">Order Placed Successfully!</h1>
        <p className="text-muted-foreground">
          Your order has been confirmed and will be processed shortly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Order ID</span>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {orderData.orderId}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(orderData.orderId)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Order Date</span>
              <span className="text-sm font-medium">
                {new Date(orderData.timestamp).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Order Time</span>
              <span className="text-sm font-medium">
                {new Date(orderData.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Items</span>
              <span className="text-sm font-medium">{orderData.items} items</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Amount</span>
              <span className="text-lg font-bold text-green-600">
                ₹{orderData.total.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Blockchain Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Blockchain Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Payment Verified</span>
              </div>
              <p className="text-sm text-green-700">
                Your payment has been successfully verified on the blockchain network.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Blockchain Hash</Label>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded flex-1 break-all">
                  {orderData.blockchainHash}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(orderData.blockchainHash)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Verified on Blockchain
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Information */}
      {checkoutData && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Name:</span>
                  <span className="text-sm">{checkoutData.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{checkoutData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{checkoutData.phone}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Address:</span>
                  <p className="text-muted-foreground mt-1">
                    {checkoutData.address}
                    {checkoutData.city && `, ${checkoutData.city}`}
                    {checkoutData.state && `, ${checkoutData.state}`}
                    {checkoutData.pincode && ` - ${checkoutData.pincode}`}
                  </p>
                  {checkoutData.landmark && (
                    <p className="text-muted-foreground text-xs mt-1">
                      Landmark: {checkoutData.landmark}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Button 
          onClick={downloadReceipt}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Receipt
        </Button>
        <Button 
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2"
        >
          <ShoppingBag className="h-4 w-4" />
          Continue Shopping
        </Button>
        <Button 
          onClick={() => navigate('/')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Button>
      </div>

      {/* Additional Information */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="font-medium">What's Next?</h3>
            <p className="text-sm text-muted-foreground">
              You will receive an email confirmation shortly. Your order will be processed and shipped within 2-3 business days.
            </p>
            <p className="text-sm text-muted-foreground">
              For any queries, please contact our customer support with your Order ID: <strong>{orderData.orderId}</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderSuccess;
