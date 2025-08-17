import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Product {
  id: string | number;
  name: string;
  price: number;
  unitPrice?: number; // Unit price for products
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  prescription?: boolean;
  ingredients?: string;
  dosage?: string;
  sideEffects?: string;
  manufacturer?: string;
  // Additional product-specific fields
  soDangKy?: string;
  dangBaoChe?: string;
  dongGoi?: string;
  hanSuDung?: string;
  quocGia?: string;
  linkChiTiet?: string;
main_category?: string;
  sub_category?: string;
  giaThuoc?: Array<{
    ngayKeKhai: string;
    donViKeKhai: string;
    dongGoi: string;
    giaKeKhai: string;
    donViTinh: string;
  }>;

  packaging?: string;
  packagingOptions?: Array<{
    description: string;
    quantity: number;
    totalPrice: number;
    unitPrice: number;
  }>;
}

export interface CartItem extends Product {
  quantity: number;
  priceDisplay?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (id: string | number, change: number) => void;
  removeFromCart: (id: string | number) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string | number, change: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          return newQuantity <= 0 ? null : { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (id: string | number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.priceDisplay?.replace(/[^\d.]/g, '') || item.price.toString());
      return total + price * item.quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      getTotalPrice,
      getTotalItems,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};