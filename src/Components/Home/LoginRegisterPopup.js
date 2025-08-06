import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginRegisterPopup = ({ setIsLoginOpen, setUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    LOGIN_ID: "",
    LOGIN_NAME: "",
    LOGIN_PHONE: "",
    LOGIN_ADDRESS: "",
    LOGIN_EMAIL: "",
    LOGIN_PASSWORD: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Capture beforeinstallprompt event for PWA installation
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPWAPrompt(true); // Show prompt when event fires
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Reset form on tab switch
  useEffect(() => {
    setFormData({
      LOGIN_ID: "",
      LOGIN_NAME: "",
      LOGIN_PHONE: "",
      LOGIN_ADDRESS: "",
      LOGIN_EMAIL: "",
      LOGIN_PASSWORD: "",
      confirmPassword: "",
    });
    setErrorMessage("");
    setSuccessMessage("");
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = () => {
    if (activeTab === "login") {
      if (!formData.LOGIN_EMAIL) return "Email is required";
      if (!validateEmail(formData.LOGIN_EMAIL)) return "Invalid email format";
      if (!formData.LOGIN_PASSWORD) return "Password is required";
    } else {
      if (!formData.LOGIN_NAME?.trim()) return "Full name is required";
      if (!formData.LOGIN_EMAIL) return "Email is required";
      if (!validateEmail(formData.LOGIN_EMAIL)) return "Invalid email format";
      if (!formData.LOGIN_PHONE) return "Phone number is required";
      if (!validatePhone(formData.LOGIN_PHONE)) return "Invalid phone number format (10 digits required)";
      if (!formData.LOGIN_ADDRESS?.trim()) return "Address is required";
      if (!formData.LOGIN_PASSWORD) return "Password is required";
      if (formData.LOGIN_PASSWORD.length < 6) return "Password must be at least 6 characters long";
      if (formData.LOGIN_PASSWORD !== formData.confirmPassword) return "Passwords do not match";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(`❌ ${validationError}`);
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === "login") {
        // Admin check
        if (
          formData.LOGIN_EMAIL.trim() === "admin@bhagavathi.com" &&
          formData.LOGIN_PASSWORD === "admin123"
        ) {
          const adminData = {
            role: "admin",
            LOGIN_EMAIL: formData.LOGIN_EMAIL.trim(),
          };
          handleSuccessfulAuth(adminData, "Admin", "/admin");
          return;
        }

        // Normal user login
        const response = await axios.post("http://localhost:5000/check-login", {
          LOGIN_EMAIL: formData.LOGIN_EMAIL.trim(),
          LOGIN_PASSWORD: formData.LOGIN_PASSWORD,
        });

        if (response.data.success && response.data.user) {
          handleSuccessfulAuth(response.data.user, "Login", "/dashboard");
        } else {
          handleError("Invalid email or password");
        }
      } else {
        // Registration
        const cleanedFormData = {
          ...formData,
          LOGIN_NAME: formData.LOGIN_NAME.trim(),
          LOGIN_EMAIL: formData.LOGIN_EMAIL.trim(),
          LOGIN_ADDRESS: formData.LOGIN_ADDRESS.trim(),
        };

        const response = await axios.post("http://localhost:5000/register", cleanedFormData);

        if (response.data.success) {
          handleRegistrationSuccess(cleanedFormData.LOGIN_EMAIL);
        } else {
          handleError(response.data.message || "Registration failed");
        }
      }
    } catch (error) {
      console.error(`${activeTab === "login" ? "Login" : "Registration"} error:`, error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        `${activeTab === "login" ? "Login" : "Registration"} failed. Please try again.`;
      handleError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessfulAuth = (userData, type, redirectPath) => {
    try {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setSuccessMessage(`✅ ${type} successful!`);
      setTimeout(() => {
        setIsLoginOpen(false);
        navigate(redirectPath);
      }, 1000);
    } catch (error) {
      console.error("Error storing user data:", error);
      handleError("Authentication successful but error storing session");
    }
  };

  const handleRegistrationSuccess = (email) => {
    setSuccessMessage("✅ User registered successfully!");
    setTimeout(() => {
      setActiveTab("login");
      setFormData((prev) => ({
        ...prev,
        LOGIN_EMAIL: email,
        LOGIN_PASSWORD: "",
        confirmPassword: "",
      }));
      setSuccessMessage("");
    }, 1500);
  };

  const handleError = (message) => {
    setErrorMessage(`❌ ${message}`);
    setIsLoading(false);
  };

  const handlePWAInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(outcome === 'accepted' ? 'User accepted PWA install' : 'User dismissed PWA install');
      setDeferredPrompt(null);
    }
    setShowPWAPrompt(false);
    setIsLoginOpen(false);
    navigate(activeTab === "login" && formData.LOGIN_EMAIL === "admin@bhagavathi.com" ? "/admin" : "/dashboard");
  };

  const handlePWACancel = () => {
    setShowPWAPrompt(false);
    setIsLoginOpen(false);
    navigate(activeTab === "login" && formData.LOGIN_EMAIL === "admin@bhagavathi.com" ? "/admin" : "/dashboard");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      {!showPWAPrompt && (
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 py-4 text-center text-white text-xl font-bold">
            SriBhagavathi
          </div>
          <div className="flex border-b bg-yellow-50">
            <button
              onClick={() => setActiveTab("login")}
              className={`w-1/2 py-3 text-center font-medium ${
                activeTab === "login"
                  ? "text-red-600 border-b-2 border-red-500 bg-white"
                  : "text-orange-700 hover:text-red-500 bg-yellow-50"
              }`}
              disabled={isLoading}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`w-1/2 py-3 text-center font-medium ${
                activeTab === "register"
                  ? "text-red-600 border-b-2 border-red-500 bg-white"
                  : "text-orange-700 hover:text-red-500 bg-yellow-50"
              }`}
              disabled={isLoading}
            >
              Register
            </button>
          </div>
          <div className="px-6 py-6 bg-gradient-to-br from-white to-yellow-50">
            <h2 className="text-2xl font-bold text-red-800 mb-6">
              {activeTab === "login" ? "Welcome back" : "Create an account"}
            </h2>
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-500">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg border border-green-500">
                {successMessage}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === "register" && (
                <>
                  <input
                    type="text"
                    name="LOGIN_NAME"
                    placeholder="Full Name"
                    value={formData.LOGIN_NAME}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <input
                    type="tel"
                    name="LOGIN_PHONE"
                    placeholder="WhatsApp Number"
                    value={formData.LOGIN_PHONE}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <textarea
                    name="LOGIN_ADDRESS"
                    placeholder="Delivery Address"
                    value={formData.LOGIN_ADDRESS}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </>
              )}
              <input
                type="email"
                name="LOGIN_EMAIL"
                value={formData.LOGIN_EMAIL}
                placeholder="Email"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                onChange={handleChange}
                disabled={isLoading}
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="LOGIN_PASSWORD"
                  value={formData.LOGIN_PASSWORD}
                  placeholder="Password"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-4 flex items-center text-gray-500 text-sm"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {activeTab === "register" && (
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  placeholder="Confirm Password"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  onChange={handleChange}
                  disabled={isLoading}
                />
              )}
              <button
                type="submit"
                className={`w-full ${
                  isLoading ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
                } text-white py-3 px-4 rounded-lg mt-4 transition-colors duration-200`}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : activeTab === "login" ? "Sign in" : "Create Account"}
              </button>
            </form>
          </div>
          <div className="px-6 py-4 border-t border-orange-100 flex justify-end bg-yellow-50">
            <button
              className="text-red-600 hover:text-red-800 px-4 py-2 rounded-lg transition-colors duration-200"
              onClick={() => {
                setIsLoginOpen(false);
                navigate("/");
              }}
              disabled={isLoading}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showPWAPrompt && (
        <div className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 p-6 text-center">
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
    </div>
  );
};

export default LoginRegisterPopup;