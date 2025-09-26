import apiClient from './apiClient';

export const cartApi = {
  // Get user's cart
  getCart: async () => {
    const response = await apiClient.get('/cart');
    return response.data;
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1, variant = null) => {
    const response = await apiClient.post('/cart', {
      productId,
      quantity,
      variant
    });
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (productId, quantity) => {
    const response = await apiClient.put(`/cart/${productId}`, {
      quantity
    });
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (productId) => {
    const response = await apiClient.delete(`/cart/${productId}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async () => {
    const response = await apiClient.delete('/cart');
    return response.data;
  },

  // Sync localStorage cart with server
  syncCart: async (items) => {
    const response = await apiClient.post('/cart/sync', { items });
    return response.data;
  }
};
