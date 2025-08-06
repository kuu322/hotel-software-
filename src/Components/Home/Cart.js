import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from './CartContext';
import { motion } from 'framer-motion';

const Cart = ({ setIsLoginOpen }) => {
  const { cartItems, setCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => {
        const rate = item.rate || 0;
        const quantity = item.quantity || 1;
        const discount = item.rateEntities?.[0]?.Discount || 0;
        return total + rate * (1 - discount / 100) * quantity;
      }, 0)
      .toFixed(2);
  };

  const handleConfirmOrder = async () => {
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setIsLoginOpen(true);
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);
      if (!user.LOGIN_NAME || !user.LOGIN_EMAIL || !user.LOGIN_PHONE || !user.LOGIN_ADDRESS) {
        setIsLoginOpen(true);
        setLoading(false);
        return;
      }

      if (cartItems.length === 0) {
        setError('Your cart is empty.');
        setLoading(false);
        return;
      }

      const orderData = {
        cart_data: cartItems,
        user_data: {
          name: user.LOGIN_NAME,
          email: user.LOGIN_EMAIL,
          phone: user.LOGIN_PHONE,
          address: user.LOGIN_ADDRESS,
        },
        total: calculateTotal(),
      };

      const response = await axios.post('http://localhost:5000/place-order', orderData);
      if (response.status === 201) {
        setOrderId(response.data.order_id);
        setCart([]);
        localStorage.removeItem('cart');
      }
    } catch (error) {
      console.error('Error placing order:', error.response?.data?.error || error.message);
      setError(`Failed to place order: ${error.response?.data?.error || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-orange-50 min-h-screen py-8 px-4 sm:px-6 md:px-8">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-700 mb-8 text-center">
        Your Cart
      </h2>
      {error && <p className="text-center text-red-500 text-lg font-medium">{error}</p>}
      {cartItems.length === 0 && !orderId && (
        <p className="text-center text-gray-600 text-lg font-medium">Your cart is empty.</p>
      )}
      {cartItems.length > 0 && (
        <div className="max-w-2xl mx-auto">
          {cartItems.map((item) => (
            <motion.div
              key={item.sub_id}
              className="bg-white p-4 rounded-2xl shadow-lg mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-gray-800">{item.subName}</h3>
              <p className="text-gray-600 text-sm">Category: {item.productName}</p>
              <p className="text-orange-700 font-bold">
                ₹{(item.rate * (1 - (item.rateEntities?.[0]?.Discount || 0) / 100) * item.quantity).toFixed(2)}
              </p>
              <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
            </motion.div>
          ))}
          <motion.div
            className="mt-6 bg-white p-6 rounded-2xl shadow-lg text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Total: ₹{calculateTotal()}</h3>
            <button
              onClick={handleConfirmOrder}
              className="px-6 py-3 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition duration-300"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm Order'}
            </button>
          </motion.div>
        </div>
      )}
      {orderId && (
        <motion.div
          className="mt-6 text-center bg-green-100 p-4 rounded-2xl max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-green-600 text-lg font-semibold">Order ID: {orderId}</p>
          <p className="text-green-600 text-base font-medium">Order Confirmed! 🎉</p>
        </motion.div>
      )}
    </div>
  );
};

export default Cart;