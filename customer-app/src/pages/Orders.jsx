import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch {}
    setLoading(false);
  };

  const getStatusStyle = (status) => {
    const styles = {
      PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      CONFIRMED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      PREPARING: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      DELIVERED: 'bg-green-500/10 text-green-400 border-green-500/20',
      CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return styles[status] || styles.PENDING;
  };

  const getStatusEmoji = (status) => {
    const emojis = { PENDING: '⏳', CONFIRMED: '✅', PREPARING: '👨‍🍳', DELIVERED: '🎉', CANCELLED: '❌' };
    return emojis[status] || '📦';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">📦 Order History</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <span className="text-6xl block mb-4">📭</span>
          <p className="text-xl text-gray-400">No orders yet</p>
          <p className="text-gray-500 mt-2">Start browsing products and place your first order!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="glass-card overflow-hidden hover:border-white/20 transition-all duration-300">
              <div className="p-5 cursor-pointer flex items-center justify-between"
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{getStatusEmoji(order.status)}</span>
                  <div>
                    <h3 className="text-white font-bold">Order #{order.id}</h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`badge border ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-xl font-bold text-white">₹{order.totalAmount}</span>
                  <span className={`text-gray-400 transition-transform duration-300 ${expandedId === order.id ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </div>

              {expandedId === order.id && (
                <div className="border-t border-white/5 p-5 bg-white/[0.02] animate-in">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Items</h4>
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-white">{item.productName}</span>
                      <span className="text-gray-300">
                        {item.quantity} × ₹{item.price} = <span className="text-white font-medium">₹{item.quantity * item.price}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
