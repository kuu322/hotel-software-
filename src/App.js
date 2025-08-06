import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { CartProvider } from './Components/Home/CartContext';
import Navbar from './Components/Home/Navbar';
import Footer from './Components/Home/Footer';
import Home from './Components/Home/Home';
import HotelMenu from './Components/Home/HotelMenu';
import SubProducts from './Components/Home/SubProduct';
import Cart from './Components/Home/Cart';
import LoginRegisterPopup from './Components/Home/LoginRegisterPopup';

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.LOGIN_NAME && parsedUser.LOGIN_EMAIL && parsedUser.LOGIN_PHONE && parsedUser.LOGIN_ADDRESS) {
          setUser(parsedUser);
        }
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    }
  }, []);

  // Handle PWA install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPWAPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handlePWAInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(outcome === 'accepted' ? 'User accepted PWA install' : 'User dismissed PWA install');
      setDeferredPrompt(null);
    }
    setShowPWAPrompt(false);
    setIsLoginOpen(false);
  };

  const handlePWACancel = () => {
    setShowPWAPrompt(false);
    setIsLoginOpen(false);
  };

  return (
    <CartProvider>
      <Router>
        <div className="font-sans">
          <Navbar user={user} setUser={setUser} setIsLoginOpen={setIsLoginOpen} />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hotel" element={<HotelMenu />} />
            <Route path="/SubProducts/:categoryId" element={<SubProducts />} />
            <Route path="/cart" element={<Cart setIsLoginOpen={setIsLoginOpen} />} />
            <Route path="/login" element={<LoginRegisterPopup setIsLoginOpen={setIsLoginOpen} setUser={setUser} />} />
            <Route
              path="/dashboard"
              element={
                user ? (
                  <Home />
                ) : (
                  <LoginRegisterPopup setIsLoginOpen={setIsLoginOpen} setUser={setUser} />
                )
              }
            />
            <Route
              path="/admin"
              element={
                user?.role === 'admin' ? (
                  <div>Admin Dashboard</div>
                ) : (
                  <LoginRegisterPopup setIsLoginOpen={setIsLoginOpen} setUser={setUser} />
                )
              }
            />
          </Routes>

          {isLoginOpen && (
            <LoginRegisterPopup setIsLoginOpen={setIsLoginOpen} setUser={setUser} />
          )}

          {showPWAPrompt && (
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-auto my-4 p-6 text-center z-50 fixed bottom-0 left-0 right-0">
              <h3 className="text-lg font-bold text-orange-700 mb-4">
                Install SriBhagavathi App?
              </h3>
              <p className="text-gray-600 mb-4">Add to your home screen for quick access</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handlePWAInstall}
                  className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition duration-200"
                >
                  Install
                </button>
                <button
                  onClick={handlePWACancel}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
