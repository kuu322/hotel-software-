import React from 'react';
import lemon from '../assets/lemon.jpg';
import rose from '../assets/rose.jpg';
import mango from '../assets/mango.jpg';

const JuiceMenu = () => {
  const juices = [
    { name: 'Lemon Juice', img: lemon },
    { name: 'Rose Milk', img: rose },
    { name: 'Mango Juice', img: mango },
  ];

  return (
    <div className="bg-yellow-50 py-10 px-4 text-center min-h-screen">
      <h2 className="text-3xl font-bold text-red-700 mb-6">Juice Menu 🧃</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto">
        {juices.map((item, i) => (
          <div key={i} className="bg-white rounded-lg shadow overflow-hidden hover:scale-105 transition">
            <img src={item.img} alt={item.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-red-800">{item.name}</h3>
              <p className="text-sm text-gray-600 mt-1">Chilled & refreshing!</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JuiceMenu;
