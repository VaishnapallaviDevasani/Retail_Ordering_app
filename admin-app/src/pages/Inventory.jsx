import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try { const res = await api.get('/admin/inventory'); setInventory(res.data); } catch {}
    setLoading(false);
  };

  const handleEdit = (item) => {
    setEditingId(item.productId);
    setEditQty(item.quantity.toString());
    setErrors({});
  };

  const handleSave = async (productId) => {
    const newErrors = {};
    const qty = parseInt(editQty);

    if (!editQty) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(qty)) {
      newErrors.quantity = 'Quantity must be a valid number';
    } else if (qty < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await api.put(`/admin/inventory/${productId}`, { quantity: qty });
      setEditingId(null);
      setErrors({});
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update inventory');
    }
  };

  const getStockLevel = (qty) => {
    if (qty === 0) return { label: 'Out of Stock', style: 'bg-red-500/10 text-red-400', bar: 'bg-red-500' };
    if (qty <= 10) return { label: 'Low Stock', style: 'bg-yellow-500/10 text-yellow-400', bar: 'bg-yellow-500' };
    if (qty <= 30) return { label: 'Medium', style: 'bg-blue-500/10 text-blue-400', bar: 'bg-blue-500' };
    return { label: 'In Stock', style: 'bg-green-500/10 text-green-400', bar: 'bg-green-500' };
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Inventory</h1>
        <p className="text-gray-400 mt-1">Manage stock levels for all products</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-white/5 bg-white/[0.02]">
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Stock Level</th>
                <th className="p-4 font-medium">Quantity</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Last Updated</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => {
                const level = getStockLevel(item.quantity);
                return (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-white font-medium">{item.productName}</td>
                    <td className="p-4">
                      <div className="w-24 bg-white/5 rounded-full h-2">
                        <div className={`h-2 rounded-full ${level.bar} transition-all duration-500`}
                          style={{ width: `${Math.min(100, (item.quantity / 100) * 100)}%` }}></div>
                      </div>
                    </td>
                    <td className="p-4">
                      {editingId === item.productId ? (
                        <div>
                          <input type="number" value={editQty} onChange={e => { setEditQty(e.target.value); setErrors({}); }}
                            className={`input-field w-24 py-1 px-2 text-sm ${errors.quantity ? 'border-red-500' : ''}`} autoFocus />
                          {errors.quantity && <p className="text-red-400 text-xs mt-1">{errors.quantity}</p>}
                        </div>
                      ) : (
                        <span className="text-white font-bold text-lg">{item.quantity}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`badge ${level.style}`}>{level.label}</span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      }) : '-'}
                    </td>
                    <td className="p-4">
                      {editingId === item.productId ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleSave(item.productId)}
                            className="text-green-400 hover:text-green-300 text-sm font-medium">Save</button>
                          <button onClick={() => setEditingId(null)}
                            className="text-gray-400 hover:text-gray-300 text-sm">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEdit(item)}
                          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium hover:underline">
                          Update Stock
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
