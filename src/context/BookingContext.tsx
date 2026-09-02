"use client";

import React, { createContext, useState, ReactNode, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  serviceId: string;
  serviceName: string;
  subService: string;
  capacity?: string;
  amc?: string;
  price: number;
  image: string;
  duration: string;
  rating: number;
  reviews: number;
  quantity: number;
  discountedPrice: number;
  originalPrice: number;

  service_category_id?: number;
  serviceCategoryId?: number;
  service_id?: number;
}


export interface BookingContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  selectedAddress: any | null;
  setSelectedAddress: (address: any) => void;
  acceptedTC: boolean;
  setAcceptedTC: (value: boolean) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [acceptedTC, setAcceptedTC] = useState(false);

  // const [cartItems, setCartItems] = useState<any[]>([]);
const [cartLoaded, setCartLoaded] = useState(false);
useEffect(() => {
  const savedCart = localStorage.getItem("cartItems");

  if (savedCart) {
    try {
      const parsed = JSON.parse(savedCart);
      const sanitized = parsed.map((item: any) => ({
        ...item,
        price: Math.round(Number(item.price || item.discountedPrice || 0)),
        discountedPrice: Math.round(Number(item.discountedPrice || item.price || 0)),
        originalPrice: Math.round(Number(item.originalPrice || item.price || 0)),
      }));
      setCartItems(sanitized);
    } catch (e) {
      setCartItems([]);
    }
  }

  setCartLoaded(true);
}, []);

useEffect(() => {
  if (cartLoaded) {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }
}, [cartItems, cartLoaded]);

 const addToCart = (service: any) => {
   const sanitizedService = {
     ...service,
     price: Math.round(Number(service.price || service.discountedPrice || 0)),
     discountedPrice: Math.round(Number(service.discountedPrice || service.price || 0)),
     originalPrice: Math.round(Number(service.originalPrice || service.price || 0)),
   };

   setCartItems((prev: any[]) => {
     const existingItem = prev.find((item) => item.id === sanitizedService.id);

     if (existingItem) {
       return prev.map((item) =>
         item.id === sanitizedService.id
           ? {
               ...item,
               quantity: item.quantity + 1,
             }
           : item,
       );
     }

     return [
       ...prev,
       {
         ...sanitizedService,
         quantity: 1,
       },
     ];
   });
 };

const removeFromCart = (id: number | string) => {
  setCartItems((prev: any[]) =>
    prev
      .map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item,
      )
      .filter((item) => item.quantity > 0),
  );
};

  const clearCart = () => {
    setCartItems([]);
  };

  const value: BookingContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    selectedAddress,
    setSelectedAddress,
    acceptedTC,
    setAcceptedTC,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = React.useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};
