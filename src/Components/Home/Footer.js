import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-red-700 text-white text-sm mt-8">
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Company Info */}
        <div>
          <h2 className="text-lg font-bold mb-2">🍛 MRK Hotel</h2>
          <p>Village-style food served with love. Order anytime, enjoy anywhere!</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1">
            <li><a href="#" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">Contact</a></li>
            <li><a href="#" className="hover:underline">Privacy Policy</a></li>
            <li><a href="#" className="hover:underline">Terms & Conditions</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="font-semibold mb-2">Contact</h3>
          <p>Email: <a href="mailto:support@mrkhotel.com" className="underline">support@mrkhotel.com</a></p>
          <p>Phone: <a href="tel:+919876543210" className="underline">+91 98765 43210</a></p>
          <p>Location: Tamil Nadu, India</p>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-red-800 text-center py-3 mt-4">
        © {new Date().getFullYear()} MRK Hotel. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
