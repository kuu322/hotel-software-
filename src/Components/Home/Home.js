// src/Components/Home/Home.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from './CartContext'; // Correct path
import hotelImg from '../assets/hotel.jpg';
// import banner2 from '../../img/banner2.png';
import Logo from '../assets/logo.png';
import { Helmet } from 'react-helmet';

const checkProductStock = async (subId, buyQuantity = 1) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/check-subproduct-stock?sub_id=${subId}&buy_quantity=${buyQuantity}`
    );
    return response.data;
  } catch (error) {
    console.error('Error checking stock:', error);
    return { status: 'error', message: 'Failed to check stock.' };
  }
};

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const cartContext = useContext(CartContext);
  const { addToCart } = cartContext || {};
  const [quantities, setQuantities] = useState({});
  const [selectedWeights, setSelectedWeights] = useState({});
  const [selectedRates, setSelectedRates] = useState({});
  const [stockStatus, setStockStatus] = useState({});

  // Define fetchData outside useEffect
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get('http://localhost:5000/all-data');
      const data = response.data; // API returns array directly

      const stockData = {};
      const defaultWeights = {};
      const defaultRates = {};

      for (const category of data) {
        for (const sub of category.subProducts) {
          const stockCheck = await checkProductStock(sub.sub_id, 1);
          stockData[sub.sub_id] = stockCheck.status;
          if (sub.rateEntities && sub.rateEntities.length > 0) {
            defaultWeights[sub.sub_id] = sub.rateEntities[0].quantity;
            defaultRates[sub.sub_id] = sub.rateEntities[0].rate;
          }
        }
      }

      setStockStatus(stockData);
      setCategories(data);
      setSelectedWeights(defaultWeights);
      setSelectedRates(defaultRates);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load products. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('CartContext:', cartContext); // Debug
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchData} // Now defined
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (id, value) => {
    const newValue = Math.max(1, parseInt(value) || 1);
    const stockCheck = await checkProductStock(id, newValue);
    if (stockCheck.status === 'insufficient_stock') {
      alert(`👉 ${stockCheck.message}`);
      return;
    }
    setQuantities((prev) => ({
      ...prev,
      [id]: newValue,
    }));
  };

  const handleWeightChange = (subProductId, weight) => {
    setSelectedWeights((prev) => ({
      ...prev,
      [subProductId]: weight,
    }));

    const sub = categories
      .flatMap((category) => category.subProducts)
      .find((sub) => sub.sub_id === subProductId);

    if (sub) {
      const selectedRateEntity = sub.rateEntities.find((rate) => rate.quantity === weight);
      if (selectedRateEntity) {
        setSelectedRates((prev) => ({
          ...prev,
          [subProductId]: selectedRateEntity.rate,
        }));
      }
    }
  };

  const handleDecrease = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) - 1),
    }));
  };

  const handleIncrease = async (id) => {
    const newValue = (quantities[id] || 1) + 1;
    const stockCheck = await checkProductStock(id, newValue);
    if (stockCheck.status === 'insufficient_stock') {
      alert(`👉 ${stockCheck.message}`);
      return;
    }
    setQuantities((prev) => ({
      ...prev,
      [id]: newValue,
    }));
  };

  const handleAddToCart = async (sub) => {
    if (!addToCart) {
      console.error('addToCart is undefined. Ensure CartProvider is set up.');
      alert('Cart functionality is not available.');
      return;
    }

    const stockCheck = await checkProductStock(sub.sub_id, quantities[sub.sub_id] || 1);
    if (stockCheck.status === 'sold_out') {
      alert('This product is currently sold out');
      setStockStatus((prev) => ({
        ...prev,
        [sub.sub_id]: 'sold_out',
      }));
      return;
    }

    if (stockCheck.status === 'insufficient_stock') {
      alert(stockCheck.message);
      return;
    }

    if (!sub.rateEntities || sub.rateEntities.length === 0) {
      alert('No rates available for this product.');
      return;
    }

    const defaultRateEntity = sub.rateEntities[0];
    const selectedWeight = selectedWeights[sub.sub_id] || defaultRateEntity.quantity;
    const selectedRate = selectedRates[sub.sub_id] || defaultRateEntity.rate;

    const item = {
      sub_id: sub.sub_id,
      subName: sub.subName,
      productName: categories.find((cat) => cat.subProducts.includes(sub))?.name || 'Unknown',
      weight: selectedWeight,
      childimg: sub.childimg,
      rate: selectedRate,
      quantity: quantities[sub.sub_id] || 1,
    };

    addToCart(item);
  };

  return (
    <>
      <Helmet>
        <title>Pure Veg Home Food & Brahmin Meals in Puducherry | Shribhagavathi Foods</title>
        <meta
          name="description"
          content="Looking for pure vegetarian food, Iyer meals, or Brahmin-style home food delivery in Puducherry? Shribhagavathi Foods offers hygienic, homemade South Indian veg meals in Lawspet and nearby areas."
        />
        <meta
          name="keywords"
          content="veg food Puducherry, pure veg hotel Puducherry, vegetarian food delivery near me, Brahmin food home delivery Puducherry, iyer food near me, homemade food Puducherry, lawspet veg food, veg lunch service, South Indian veg meals Puducherry, Shribhagavathi Foods"
        />
        <meta name="author" content="Shribhagavathi Foods" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://shribhagavathifoods.com/" />
        <meta property="og:title" content="Shribhagavathi Foods - Best Veg Food in Puducherry" />
        <meta property="og:description" content="Pure veg Brahmin-style meals and Iyer food delivered in Lawspet and Puducherry. Order now!" />
        <meta property="og:url" content="https://shribhagavathifoods.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://shribhagavathifoods.com/images/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pure Veg Food & Iyer Meals | Puducherry | Shribhagavathi Foods" />
        <meta name="twitter:description" content="Get hygienic Brahmin-style vegetarian food delivered to your doorstep in Lawspet, Puducherry." />
        <meta name="twitter:image" content="https://shribhagavathifoods.com/images/og-image.jpg" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Restaurant',
            'name': 'Shribhagavathi Foods',
            'image': 'https://shribhagavathifoods.com/images/logo.jpg',
            'address': {
              '@type': 'PostalAddress',
              'streetAddress': 'Lawspet, Puducherry',
              'addressLocality': 'Puducherry',
              'addressRegion': 'PY',
              'postalCode': '605008',
              'addressCountry': 'IN'
            },
            'telephone': '+919751109239',
            'servesCuisine': 'South Indian Vegetarian',
            'url': 'https://shribhagavathifoods.com',
            'priceRange': '₹100 - ₹1000',
            'openingHours': 'Mo-Su 08:00-22:00'
          })}
        </script>
      </Helmet>

      <div className="bg-yellow-50 min-h-screen font-sans overflow-x-hidden w-full">
        {/* Banner Section */}
        <div className="w-full px-2 sm:px-4 py-6 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
            <div className="w-full">
              <img
                src={hotelImg}
                alt="Best Organic Products"
                className="w-full h-[250px] object-cover rounded-xl shadow-lg hover:shadow-2xl transition duration-300"
                loading="lazy"
              />
            </div>
            <div className="w-full flex justify-center px-4">
              <img
                src={Logo}
                alt="Sri Bagavadhi Foods Logo"
                className="h-[250px] max-w-full object-contain"
                loading="lazy"
              />
            </div>
            {/* <div className="w-full">
              <img
                src={banner2}
                alt="Home-made Specialities"
                className="w-full h-[250px] object-cover rounded-xl shadow-lg hover:shadow-2xl transition duration-300"
                loading="lazy"
              />
            </div> */}
          </div>
        </div>

        {/* Store Selection */}
        <h2 className="text-3xl sm:text-4xl font-bold text-red-700 mb-6 text-center">Choose Your Store</h2>
        <div className="px-2 sm:px-4 py-6">
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto justify-center">


            {/* Dynamic Cards from API */}
            {categories.map((category) => (
              <div
                key={category.pro_id}
                className="cursor-pointer bg-white shadow-lg rounded-xl overflow-hidden hover:scale-105 transition"
                onClick={() => navigate(`/SubProducts/${category.pro_id}`)}
                role="button"
                tabIndex="0"
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/SubProducts/${category.pro_id}`)}
              >
                <img
                  src={`http://localhost:5000/images/${category.img}`}
                  alt={`${category.name} storefront`}
                  className="w-full h-56 object-cover"
                  onError={(e) => (e.target.src = '/path/to/fallback-image.jpg')}
                  loading="lazy"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-red-700">{category.name}</h3>
                  <p className="text-gray-600 mt-2">{category.subProducts[0]?.subName || 'Explore products!'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Products Section */}
      </div>
    </>
  );
}