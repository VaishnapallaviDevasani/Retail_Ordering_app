import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentOrders();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard/stats');
      setStats(res.data);
    } catch {}
  };

  const fetchRecentOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setRecentOrders(res.data.slice(0, 5));
    } catch {}
  };

  const statCards = [
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: '📦', color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '🧾', color: 'from-purple-500 to-pink-500' },
    { label: 'Customers', value: stats?.totalCustomers || 0, icon: '👥', color: 'from-green-500 to-emerald-500' },
    { label: 'Pending Orders', value: stats?.pendingOrders || 0, icon: '⏳', color: 'from-amber-500 to-orange-500' },
  ];

  const getStatusStyle = (status) => {
    const styles = {
      PENDING: 'bg-yellow-500/10 text-yellow-400',
      CONFIRMED: 'bg-blue-500/10 text-blue-400',
      PREPARING: 'bg-purple-500/10 text-purple-400',
      DELIVERED: 'bg-green-500/10 text-green-400',
      CANCELLED: 'bg-red-500/10 text-red-400',
    };
    return styles[status] || styles.PENDING;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back, Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{card.icon}</span>
              <span className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                {card.value}
              </span>
            </div>
            <p className="text-gray-400 text-sm font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-white/5">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 text-white font-medium">#{order.id}</td>
                    <td className="py-3 text-gray-300">{order.username}</td>
                    <td className="py-3 text-white font-semibold">₹{order.totalAmount}</td>
                    <td className="py-3">
                      <span className={`badge ${getStatusStyle(order.status)}`}>{order.status}</span>
                    </td>
                    <td className="py-3 text-gray-400 text-sm">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
