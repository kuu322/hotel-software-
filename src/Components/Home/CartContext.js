import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // ✅ Load cart from localStorage on page load
  useEffect(() => {
    try {
      const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
      if (Array.isArray(storedCart)) {
        setCartItems(storedCart);
      } else {
        setCartItems([]); // Reset if data is corrupted
      }
    } catch {
      setCartItems([]);
    }
  }, []);

  // ✅ Update localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ Add Product to Cart
  const addToCart = (item) => {
    setCartItems((prevCart) => [...prevCart, item]);
  };

  // ✅ Remove only one instance of the product
  const removeFromCart = (id) => {
    setCartItems((prevCart) => {
      const index = prevCart.findIndex((item) => item.sub_id === id);
      if (index !== -1) {
        const newCart = [...prevCart];
        newCart.splice(index, 1);
        return newCart;
      }
      return prevCart;
    });
  };

  // ✅ Calculate Total Amount
  const calculateTotal = () => {
    return Array.isArray(cartItems)
      ? cartItems.reduce((acc, item) => acc + item.rate * item.quantity, 0).toFixed(2)
      : 0;
  };

  return (
    <CartContext.Provider
      value={{ cartItems, setCartItems, addToCart, removeFromCart, calculateTotal }}
    >
      {children}
    </CartContext.Provider>
  );
};
