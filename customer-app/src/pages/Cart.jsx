import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cart');
      setItems(res.data);
    } catch {}
    setLoading(false);
  };

  const removeItem = async (id) => {
    try {
      await api.delete(`/cart/${id}`);
      setItems(items.filter(i => i.id !== id));
    } catch {}
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const res = await api.post('/orders');
      setOrderSuccess(res.data);
      setItems([]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    }
    setPlacing(false);
  };

  const total = items.reduce((sum, i) => sum + (i.productPrice * i.quantity), 0);

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="glass-card p-10">
          <span className="text-7xl block mb-6 animate-bounce">🎉</span>
          <h1 className="text-3xl font-bold text-white mb-3">Order Placed!</h1>
          <p className="text-gray-400 mb-2">Order #{orderSuccess.id} has been placed successfully</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-8">
            Total: ₹{orderSuccess.totalAmount}
          </p>
          <div className="glass-card p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Order Items</h3>
            {orderSuccess.items?.map((item, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-white">{item.productName} × {item.quantity}</span>
                <span className="text-gray-300">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/')} className="btn-primary">Continue Shopping</button>
            <button onClick={() => navigate('/orders')} className="btn-secondary">View Orders</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">🛒 Your Cart</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <span className="text-6xl block mb-4">🛒</span>
          <p className="text-xl text-gray-400 mb-6">Your cart is empty</p>
          <button onClick={() => navigate('/')} className="btn-primary">Browse Products</button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="glass-card p-4 flex items-center gap-4 hover:border-white/20 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                  {item.productImageUrl || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{item.productName}</h3>
                  <p className="text-gray-400 text-sm">{item.categoryName}</p>
                  <p className="text-blue-400 font-medium">₹{item.productPrice} × {item.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-bold text-lg">₹{item.productPrice * item.quantity}</p>
                  <button onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-300 text-sm mt-1 hover:underline transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Items ({items.length})</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Delivery</span>
                  <span className="text-green-400">Free</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="text-white font-bold text-lg">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>
              <button onClick={placeOrder} disabled={placing}
                className="btn-primary w-full text-lg py-3 disabled:opacity-50 flex items-center justify-center">
                {placing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                ) : '🚀 Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
