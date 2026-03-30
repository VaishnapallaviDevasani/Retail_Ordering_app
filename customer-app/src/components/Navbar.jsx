import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user) fetchCartCount();
  }, [user, location]);

  const fetchCartCount = async () => {
    try {
      const res = await api.get('/cart');
      setCartCount(res.data.reduce((sum, item) => sum + item.quantity, 0));
    } catch { setCartCount(0); }
  };

  const handleLogout = async () => {
    try { await logout(); } catch {}
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-x-0 border-t-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🛒</span>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              RetailMart
            </span>
          </Link>

          <div className="flex items-center space-x-1">
            <Link to="/" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              isActive('/') ? 'bg-blue-500/20 text-blue-400' : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}>
              🍕 Products
            </Link>
            <Link to="/cart" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 relative ${
              isActive('/cart') ? 'bg-blue-500/20 text-blue-400' : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}>
              🛒 Cart
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/orders" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              isActive('/orders') ? 'bg-blue-500/20 text-blue-400' : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}>
              📦 Orders
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-400">
              👋 {user?.username}
            </span>
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-400 transition-colors duration-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
