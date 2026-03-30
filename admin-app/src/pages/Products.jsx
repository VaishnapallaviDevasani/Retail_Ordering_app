import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', imageUrl: '', categoryId: '', initialStock: '0' });
  const [loading, setLoading] = useState(true);
  const formRef = useRef(null);

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm]);

  const fetchProducts = async () => {
    try { const res = await api.get('/products'); setProducts(res.data); } catch {}
    setLoading(false);
  };

  const fetchCategories = async () => {
    try { const res = await api.get('/admin/categories'); setCategories(res.data); } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, price: parseFloat(form.price), categoryId: parseInt(form.categoryId), initialStock: parseInt(form.initialStock) };
    try {
      if (editing) {
        await api.put(`/admin/products/${editing}`, data);
      } else {
        await api.post('/admin/products', data);
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditing(product.id);
    setForm({
      name: product.name, description: product.description || '', price: product.price.toString(),
      imageUrl: product.imageUrl || '', categoryId: product.categoryId?.toString() || '', initialStock: (product.stock || 0).toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await api.delete(`/admin/products/${id}`); fetchProducts(); } catch {}
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', imageUrl: '', categoryId: '', initialStock: '0' });
    setEditing(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <p className="text-gray-400 mt-1">{products.length} total products</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary">
          {showForm ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div ref={formRef} className="glass-card p-6 mb-8 animate-in">
          <h2 className="text-xl font-bold text-white mb-4">{editing ? 'Edit Product' : 'New Product'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="input-field" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Price (₹)</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                className="input-field" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}
                className="input-field" required>
                <option value="" style={{ color: 'black' }}>Select category</option>
                {categories.map(c => <option key={c.id} value={c.id} style={{ color: 'black' }}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Initial Stock</label>
              <input type="number" value={form.initialStock} onChange={e => setForm({...form, initialStock: e.target.value})}
                className="input-field" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <input value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="input-field" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Image URL / Emoji</label>
              <input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})}
                className="input-field" placeholder="🍕 or https://..." />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'} Product</button>
              <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
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
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{product.imageUrl || '📦'}</span>
                      <div>
                        <p className="text-white font-medium">{product.name}</p>
                        <p className="text-gray-500 text-xs truncate max-w-[200px]">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><span className="badge bg-indigo-500/10 text-indigo-400">{product.categoryName}</span></td>
                  <td className="p-4 text-white font-semibold">₹{product.price}</td>
                  <td className="p-4">
                    <span className={`badge ${product.stock > 10 ? 'bg-green-500/10 text-green-400' : product.stock > 0 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>
                      {product.stock ?? 0}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(product)} className="text-indigo-400 hover:text-indigo-300 text-sm hover:underline">Edit</button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-400 hover:text-red-300 text-sm hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
