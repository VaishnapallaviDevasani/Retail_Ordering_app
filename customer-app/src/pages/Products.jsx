
import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState('');
  const [failedImages, setFailedImages] = useState(new Set());


  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(activeCategory, search);
    // eslint-disable-next-line
  }, [activeCategory, search]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch {}
  };


  const fetchProducts = async (categoryId = null, searchQuery = '') => {
    setLoading(true);
    try {
      let url = '/products';
      const params = {};
      if (categoryId) params.categoryId = categoryId;
      if (searchQuery) params.search = searchQuery;
      const res = await api.get(url, { params });
      setProducts(res.data);
    } catch {}
    setLoading(false);
  };


  const handleCategoryFilter = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const addToCart = async (productId) => {
    setAddingId(productId);
    try {
      await api.post('/cart', { productId, quantity: 1 });
      showToast('Added to cart! 🛒');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add');
    }
    setAddingId(null);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };
  const getCategoryEmoji = (name) => {
    if (name?.includes('Pizza')) return '🍕';
    if (name?.includes('Drink')) return '🥤';
    if (name?.includes('Bread')) return '🍞';
    return '📦';
  };

  const renderProductImage = (imageUrl, categoryName, productId) => {
    const isFailed = failedImages.has(productId);
    
    if (!imageUrl) {
      return <span className="text-7xl">{getCategoryEmoji(categoryName)}</span>;
    }
    
    // Check if it's a URL
    if (imageUrl.startsWith('http')) {
      return isFailed ? (
        <span className="text-7xl">{getCategoryEmoji(categoryName)}</span>
      ) : (
        <img 
          src={imageUrl} 
          alt="Product" 
          className="w-full h-full object-cover" 
          onError={() => setFailedImages(prev => new Set([...prev, productId]))}
        />
      );
    }
    
    // It's an emoji or text
    return <span className="text-7xl">{imageUrl}</span>;
  };


  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-4 z-50 bg-green-500/90 text-white px-6 py-3 rounded-xl shadow-2xl backdrop-blur-sm animate-bounce text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Our Menu</h1>
        <p className="text-gray-400 text-lg">Choose from our delicious selection</p>
      </div>

      {/* Search Bar */}
      {/* <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded-xl border border-blue-500/30 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div> */}

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <button onClick={() => handleCategoryFilter(null)}
          className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
            !activeCategory ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
          }`}>
          🏪 All Items
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => handleCategoryFilter(cat.id)}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              activeCategory === cat.id ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
            }`}>
            {getCategoryEmoji(cat.name)} {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <span className="text-6xl block mb-4">🔍</span>
          <p className="text-xl">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="glass-card overflow-hidden group hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
              {/* Product Image/Emoji */}
              <div className="h-44 bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                {renderProductImage(product.imageUrl, product.categoryName, product.id)}
              </div>

              <div className="p-5">
                {/* Category Badge */}
                <span className="badge bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {product.categoryName}
                </span>

                <h3 className="text-lg font-bold text-white mt-3 mb-1">{product.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    ₹{product.price}
                  </span>
                  <div className="flex flex-col items-end gap-1">
                    {product.stock > 0 ? (
                      <button onClick={() => addToCart(product.id)} disabled={addingId === product.id}
                        className="btn-primary text-sm py-2 px-4 disabled:opacity-50">
                        {addingId === product.id ? '...' : '+ Cart'}
                      </button>
                    ) : (
                      <span className="badge bg-red-500/10 text-red-400 border border-red-500/20">Out of Stock</span>
                    )}
                    {/* <span className="text-xs text-gray-500">{product.stock > 0 ? `${product.stock} left` : ''}</span> */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
