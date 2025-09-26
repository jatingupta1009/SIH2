import apiClient from './apiClient';

export const checkoutApi = {
  // Create order and Razorpay order
  createOrder: async (orderData) => {
    const response = await apiClient.post('/checkout/create-order', orderData);
    return response.data;
  },

  // Verify payment signature
  verifyPayment: async (paymentData) => {
    const response = await apiClient.post('/checkout/verify', paymentData);
    return response.data;
  },

  // Get user orders
  getUserOrders: async (page = 1, limit = 10, status = null) => {
    const params = { page, limit };
    if (status) params.status = status;
    
    const response = await apiClient.get('/checkout/orders', { params });
    return response.data;
  },

  // Get order details
  getOrderDetails: async (orderId) => {
    const response = await apiClient.get(`/checkout/orders/${orderId}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    const response = await apiClient.post(`/checkout/orders/${orderId}/cancel`);
    return response.data;
  },

  // Process refund (admin only)
  processRefund: async (orderId, refundData) => {
    const response = await apiClient.post(`/checkout/orders/${orderId}/refund`, refundData);
    return response.data;
  }
};
