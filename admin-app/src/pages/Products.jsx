import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', imageUrl: '', categoryId: '', initialStock: '0' });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());
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

  const renderProductImage = (imageUrl, productId) => {
    const isFailed = failedImages.has(productId);
    
    if (!imageUrl) {
      return <span className="text-2xl">📦</span>;
    }
    
    // Check if it's a URL
    if (imageUrl.startsWith('http')) {
      return isFailed ? (
        <span className="text-2xl">📦</span>
      ) : (
        <img 
          src={imageUrl} 
          alt="Product" 
          className="w-10 h-10 object-cover rounded" 
          onError={() => setFailedImages(prev => new Set([...prev, productId]))}
        />
      );
    }
    
    // It's an emoji or text
    return <span className="text-2xl">{imageUrl}</span>;
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (/^\d/.test(form.name)) {
      newErrors.name = 'Product name cannot start with a number';
    } else if (/\d/.test(form.name)) {
      newErrors.name = 'Product name cannot contain numbers';
    }

    // Price validation
    const price = parseFloat(form.price);
    if (!form.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(price)) {
      newErrors.price = 'Price must be a valid number';
    } else if (price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    // Stock validation
    const stock = parseInt(form.initialStock);
    if (form.initialStock === '') {
      newErrors.initialStock = 'Stock is required';
    } else if (isNaN(stock)) {
      newErrors.initialStock = 'Stock must be a valid number';
    } else if (stock < 0) {
      newErrors.initialStock = 'Stock cannot be negative';
    }

    // Category validation
    if (!form.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    // Description validation
    const descriptionTrimmed = form.description.trim();
    if (!descriptionTrimmed) {
      newErrors.description = 'Description is required';
    } else if (descriptionTrimmed.length < 10) {
      newErrors.description = `Description must be at least 10 characters (${descriptionTrimmed.length}/10)`;
    } else if (descriptionTrimmed.length > 500) {
      newErrors.description = `Description must not exceed 500 characters (${descriptionTrimmed.length}/500)`;
    } else if (/^\d+$/.test(descriptionTrimmed)) {
      newErrors.description = 'Description cannot contain only numbers';
    } else if (/<[^>]*>/g.test(descriptionTrimmed)) {
      newErrors.description = 'Description cannot contain HTML or script tags';
    } else if ((descriptionTrimmed.match(/[^a-zA-Z0-9\s.,!?\'"\-();:\/#&]/g) || []).length > 10) {
      newErrors.description = 'Description contains too many special characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const data = { ...form, description: form.description.trim(), price: parseFloat(form.price), categoryId: parseInt(form.categoryId), initialStock: parseInt(form.initialStock) };
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
    setErrors({});
    setImageError(false);
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
                className={`input-field ${errors.name ? 'border-red-500' : ''}`} required />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Price (₹)</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                className={`input-field ${errors.price ? 'border-red-500' : ''}`} required />
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}
                className={`input-field ${errors.categoryId ? 'border-red-500' : ''}`} required>
                <option value="" style={{ color: 'black' }}>Select category</option>
                {categories.map(c => <option key={c.id} value={c.id} style={{ color: 'black' }}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-red-400 text-xs mt-1">{errors.categoryId}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Initial Stock</label>
              <input type="number" value={form.initialStock} onChange={e => setForm({...form, initialStock: e.target.value})}
                className={`input-field ${errors.initialStock ? 'border-red-500' : ''}`} required />
              {errors.initialStock && <p className="text-red-400 text-xs mt-1">{errors.initialStock}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className={`input-field resize-none ${errors.description ? 'border-red-500' : ''}`} rows="3" placeholder="Describe the product (10-500 characters)" />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
              <p className="text-gray-500 text-xs mt-1">{form.description.length}/500 characters</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Image URL / Emoji</label>
              <input value={form.imageUrl} onChange={e => { setForm({...form, imageUrl: e.target.value}); setImageError(false); }}
                className="input-field" placeholder="🍕 or https://..." />
              {/* Image Preview */}
              <div className="mt-3 p-3 bg-white/5 rounded-lg flex items-center justify-center h-32 border border-white/10">
                {form.imageUrl && !form.imageUrl.startsWith('http') ? (
                  <span className="text-5xl">{form.imageUrl}</span>
                ) : form.imageUrl && !imageError ? (
                  <img src={form.imageUrl} alt="Preview" className="max-h-32 max-w-full object-contain" onError={() => setImageError(true)} />
                ) : (
                  <span className="text-5xl">📦</span>
                )}
              </div>
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
                      {renderProductImage(product.imageUrl, product.id)}
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
