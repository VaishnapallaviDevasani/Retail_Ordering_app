import { useState, useEffect } from 'react';
import api from '../api/axios';

const STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERED', 'CANCELLED'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try { const res = await api.get('/admin/orders'); setOrders(res.data); } catch {}
    setLoading(false);
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch {}
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Orders</h1>
        <p className="text-gray-400 mt-1">{orders.length} total orders</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <span className="text-6xl block mb-4">📭</span>
          <p className="text-xl text-gray-400">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="glass-card overflow-hidden">
              <div className="p-5 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                <div className="flex items-center gap-6">
                  <div>
                    <h3 className="text-white font-bold text-lg">Order #{order.id}</h3>
                    <p className="text-gray-400 text-sm">by {order.username}</p>
                  </div>
                  <span className={`badge border ${getStatusStyle(order.status)}`}>{order.status}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">₹{order.totalAmount}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-gray-400 transition-transform duration-300 ${expandedId === order.id ? 'rotate-180' : ''}`}>▼</span>
                </div>
              </div>

              {expandedId === order.id && (
                <div className="border-t border-white/5 p-5 bg-white/[0.02]">
                  {/* Items */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Items</h4>
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                        <span className="text-white">{item.productName}</span>
                        <span className="text-gray-300">{item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Status Update */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Update Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.map(status => (
                        <button key={status} onClick={() => updateStatus(order.id, status)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                            order.status === status
                              ? 'bg-indigo-500 text-white'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                          }`}>
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
