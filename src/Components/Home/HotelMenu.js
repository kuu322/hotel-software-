import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import idli from '../assets/idli.jpg';
import dosa from '../assets/dosa.jpg';
import meals from '../assets/meals.jpg';

const HotelMenu = () => {
  const navigate = useNavigate();

  // Food items with price
  const initialItems = [
    { name: 'Idli & Sambar', img: idli, price: 10 },
    { name: 'Dosa & Chutney', img: dosa, price: 20 },
    { name: 'Veg Meals', img: meals, price: 60 },
  ];

  // State to track quantity per item
  const [quantities, setQuantities] = useState(initialItems.map(() => 0));

  // Handlers
  const increment = (index) => {
    const newQuantities = [...quantities];
    newQuantities[index]++;
    setQuantities(newQuantities);
  };

  const decrement = (index) => {
    const newQuantities = [...quantities];
    newQuantities[index] = Math.max(0, newQuantities[index] - 1);
    setQuantities(newQuantities);
  };

  return (
    <div className="bg-yellow-50 py-10 px-4 text-center min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="mb-6 text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
      >
        ⬅️ Back to Store Selection
      </button>

      <h2 className="text-3xl font-bold text-red-700 mb-6">Hotel Menu 🍽️</h2>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto">
        {initialItems.map((item, index) => {
          const qty = quantities[index];
          const total = item.price * qty;

          return (
            <div key={index} className="bg-white rounded-lg shadow hover:scale-105 transition overflow-hidden">
              <img src={item.img} alt={item.name} className="w-full h-48 object-cover" />
              <div className="p-4 text-left">
                <h3 className="text-lg font-semibold text-red-800">{item.name}</h3>
                <p className="text-sm text-gray-700">Price: ₹{item.price} per piece</p>

                {/* Controls */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decrement(index)}
                      className="bg-gray-300 hover:bg-gray-400 px-2 py-1 rounded"
                    >
                      ➖
                    </button>
                    <span className="text-lg">{qty}</span>
                    <button
                      onClick={() => increment(index)}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                    >
                      ➕
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Total: ₹{total}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HotelMenu;
