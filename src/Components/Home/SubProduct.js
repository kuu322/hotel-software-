import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';
import { CartContext } from './CartContext'; // Correct path to src/CartContext.js
import { motion, AnimatePresence } from 'framer-motion';

const SubProducts = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, cartItems, setCart } = useContext(CartContext);
  const [quantities, setQuantities] = useState({});
  const [showConfirmOrder, setShowConfirmOrder] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [user, setUser] = useState(null);

  // Fetch user data from localStorage
  useEffect(() => {
    const validateUserData = (data) => {
      const requiredFields = ['LOGIN_NAME', 'LOGIN_EMAIL', 'LOGIN_PHONE', 'LOGIN_ADDRESS'];
      return requiredFields.every(field => Boolean(data?.[field]));
    };

    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setError('Please log in to continue.');
        navigate('/login'); // Redirect to login page
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      if (validateUserData(parsedUser)) {
        setUser(parsedUser);
      } else {
        setError('Incomplete user data. Please update your profile.');
        navigate('/login');
      }
    } catch (err) {
      console.error('Error reading user data:', err.message);
      setError('Failed to load user data. Please log in again.');
      navigate('/login');
    }
  }, [navigate]);

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('http://localhost:5000/all-data');
        const data = Array.isArray(response.data) ? response.data : response.data.categories;
        const selectedCategory = data.find((cat) => cat.pro_id === Number(categoryId));
        if (!selectedCategory) {
          throw new Error('Category not found');
        }
        setCategory(selectedCategory);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch menu items.');
        setLoading(false);
      }
    };
    fetchCategory();
  }, [categoryId]);

  // Show "Confirm Order" button when cart has items
  useEffect(() => {
    setShowConfirmOrder(cartItems.length > 0);
  }, [cartItems]);

  const handleDecrease = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) - 1),
    }));
  };

  const handleIncrease = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 1) + 1,
    }));
  };

  const handleQuantityChange = (id, value) => {
    const newValue = Math.max(1, parseInt(value) || 1);
    setQuantities((prev) => ({
      ...prev,
      [id]: newValue,
    }));
  };

  const handleBlur = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: prev[id] || 1,
    }));
  };

  const handleAddToCart = (subProduct) => {
    if (!addToCart) {
      alert('Cart functionality is not available.');
      return;
    }

    const defaultRate = subProduct.rateEntities?.[0];
    if (!defaultRate) {
      alert('No price available for this item.');
      return;
    }

    const item = {
      sub_id: subProduct.sub_id,
      subName: subProduct.subName,
      productName: category.name,
      quantity: quantities[subProduct.sub_id] || 1,
      rate: defaultRate.rate,
      rateEntities: [{ Discount: defaultRate.Discount || 0 }],
      childimg: `http://localhost:5000/subimages/${subProduct.childimg}`,
    };

    addToCart(item);
  };

  // Calculate total cart price with discounts
  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => {
        const rate = item.rate || 0;
        const quantity = item.quantity || 1;
        const discount = item.rateEntities?.[0]?.Discount || 0;
        const discountedRate = rate * (1 - discount / 100);
        return total + discountedRate * quantity;
      }, 0)
      .toFixed(2);
  };

  // Handle Confirm Order
  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (!user) {
      setError('Please log in to place an order.');
      navigate('/login');
      return;
    }

    try {
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
        setShowConfirmOrder(false);
      }
    } catch (error) {
      console.error('Error placing order:', error.response?.data?.error || error.message);
      setError(`Failed to place order: ${error.response?.data?.error || 'Please try again.'}`);
    }
  };

  return (
    <div className="bg-orange-50 min-h-screen py-8 px-4 sm:px-6 md:px-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 flex items-center text-orange-700 hover:text-orange-900 hover:bg-orange-200 rounded-full transition-colors duration-300"
      >
        <FaTimes className="mr-2" /> Back to Menu
      </button>

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-700 mb-8 text-center">
        {category ? category.name : 'Our Menu'}
      </h2>

      {loading && <p className="text-center text-orange-600 text-lg animate-pulse">Loading menu items...</p>}
      {error && <p className="text-center text-red-500 text-lg font-medium">{error}</p>}

      {!loading && !category && (
        <p className="text-center text-gray-600 text-lg font-medium">
          🍽️ No items found for this category.
        </p>
      )}

      {!loading && category && (
        <>
          {user && (
            <div className="mb-6 bg-white p-4 rounded-2xl shadow-md border border-gray-200">
              <div className="text-left">
                <h3 className="text-lg sm:text-xl font-bold text-orange-700">
                  Welcome, <span className="text-orange-600">{user.LOGIN_NAME}</span>
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mt-2">
                  Delivery to: {user.LOGIN_ADDRESS}
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {category.subProducts.map((subProduct) => (
              <motion.div
                key={subProduct.sub_id}
                className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={`http://localhost:5000/subimages/${subProduct.childimg}`}
                  alt={subProduct.subName}
                  className="w-full h-48 sm:h-56 object-cover rounded-xl"
                  onError={(e) => (e.target.src = '/images/fallback.jpg')}
                  loading="lazy"
                />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mt-4">{subProduct.subName}</h3>
                <p className="text-gray-600 text-sm sm:text-base">{category.name}</p>
                <p className="text-orange-700 font-bold text-base sm:text-lg mt-2">
                  ₹{(subProduct.rateEntities?.[0]?.rate * (1 - (subProduct.rateEntities?.[0]?.Discount || 0) / 100)).toFixed(2)}
                  {subProduct.rateEntities?.[0]?.Discount > 0 && (
                    <span className="text-green-600 text-sm ml-2">
                      ({subProduct.rateEntities[0].Discount}% OFF)
                    </span>
                  )}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  {subProduct.rateEntities?.[0]?.Discount > 0 && (
                    <span className="line-through">₹{subProduct.rateEntities[0].rate}</span>
                  )}
                </p>

                <div className="flex items-center mt-4 space-x-2">
                  <span className="text-sm sm:text-base text-gray-600">Quantity</span>
                  <button
                    className="text-xl sm:text-2xl px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300 transition duration-200"
                    onClick={() => handleDecrease(subProduct.sub_id)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="w-12 text-center text-base sm:text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-md"
                    value={quantities[subProduct.sub_id] || 1}
                    min="1"
                    max="99"
                    onChange={(e) => handleQuantityChange(subProduct.sub_id, e.target.value)}
                    onBlur={() => handleBlur(subProduct.sub_id)}
                  />
                  <button
                    className="text-xl sm:text-2xl px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300 transition duration-200"
                    onClick={() => handleIncrease(subProduct.sub_id)}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => handleAddToCart(subProduct)}
                  className="w-full mt-4 py-3 rounded-full bg-orange-500 text-white font-semibold text-sm sm:text-base hover:bg-orange-600 transition duration-300"
                  disabled={!addToCart || !subProduct.rateEntities?.[0]}
                >
                  Add to Cart
                </button>
              </motion.div>
            ))}
          </div>

          {/* Confirm Order Section */}
          {showConfirmOrder && (
            <motion.div
              className="mt-10 text-center bg-white p-6 rounded-2xl shadow-lg max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
                Total: ₹{calculateTotal()}
              </h3>
              <button
                onClick={handleConfirmOrder}
                className="px-6 py-3 rounded-full bg-green-600 text-white font-semibold text-sm sm:text-base hover:bg-green-700 transition duration-300"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm Order'}
              </button>
            </motion.div>
          )}

          {/* Display Order ID */}
          {orderId && (
            <motion.div
              className="mt-4 text-center bg-green-100 p-4 rounded-2xl max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-green-600 text-base sm:text-lg font-semibold">
                Order ID: {orderId}
              </p>
              <p className="text-green-600 text-sm sm:text-base font-medium">
                Order Confirmed! 🎉
              </p>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default SubProducts;