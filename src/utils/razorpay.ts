// Razorpay utility functions
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: {
    address?: string;
  };
  theme?: {
    color?: string;
  };
}

export const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve();
    };
    document.body.appendChild(script);
  });
};

export const createRazorpayOrder = async (amount: number, currency: string = 'INR') => {
  try {
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise
        currency,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    const data = await response.json();
    return data.order_id;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    // For demo purposes, return a mock order ID
    return 'order_' + Math.random().toString(36).substr(2, 9);
  }
};

export const initiatePayment = async (options: RazorpayOptions) => {
  try {
    await loadRazorpayScript();
    
    if (!window.Razorpay) {
      throw new Error('Razorpay not loaded');
    }

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error('Payment initiation failed:', error);
    throw error;
  }
};

export const formatAmount = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const calculateTax = (amount: number, taxRate: number = 0.18): number => {
  return Math.round(amount * taxRate);
};

export const getTotalAmount = (amount: number, taxRate: number = 0.18): number => {
  return amount + calculateTax(amount, taxRate);
};
