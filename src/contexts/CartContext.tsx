import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  id: number;
  title: string;
  price: string;
  originalPrice: string | null;
  image: string;
  vendor: string;
  location: string;
  quantity: number;
  category: string;
  seller?: {
    id: string;
    name: string;
    shopName: string;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  // Initialize with localStorage data if available
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCartItems = localStorage.getItem('cartItems');
      console.log('CartContext - Initializing with localStorage:', savedCartItems);
      if (savedCartItems) {
        try {
          const parsedItems = JSON.parse(savedCartItems);
          console.log('CartContext - Initial parsed items:', parsedItems);
          return parsedItems;
        } catch (error) {
          console.error('Error loading cart items from localStorage:', error);
        }
      }
    }
    return [];
  });

  // Save cart items to localStorage whenever cartItems changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('CartContext - Saving to localStorage:', cartItems);
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = (product: any) => {
    console.log('CartContext - Adding product to cart:', product);
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      let newItems;
      if (existingItem) {
        newItems = prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...prev, {
          id: product.id,
          title: product.title,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          vendor: product.vendor,
          location: product.location,
          quantity: 1,
          category: product.category
        }];
      }
      console.log('CartContext - New cart items:', newItems);
      return newItems;
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = parseInt(item.price.replace(/[₹,]/g, ""));
      return total + (price * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const refreshCart = () => {
    if (typeof window !== 'undefined') {
      const savedCartItems = localStorage.getItem('cartItems');
      console.log('CartContext - Manual refresh from localStorage:', savedCartItems);
      if (savedCartItems) {
        try {
          const parsedItems = JSON.parse(savedCartItems);
          console.log('CartContext - Manual refresh parsed items:', parsedItems);
          setCartItems(parsedItems);
        } catch (error) {
          console.error('Error refreshing cart items from localStorage:', error);
        }
      }
    }
  };

  // Add test function to window for debugging
  if (typeof window !== 'undefined') {
    (window as any).testCart = {
      addTestItem: () => {
        const testItem = {
          id: 999,
          title: 'Test Item',
          price: '₹100',
          originalPrice: null,
          image: 'https://via.placeholder.com/150',
          vendor: 'Test Vendor',
          location: 'Test Location',
          quantity: 1,
          category: 'Test'
        };
        addToCart(testItem);
      },
      getCartItems: () => cartItems,
      getLocalStorage: () => localStorage.getItem('cartItems'),
      refreshCart: refreshCart
    };
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
