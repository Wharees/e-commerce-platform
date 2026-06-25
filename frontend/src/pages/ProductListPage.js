import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuthStore, useCartStore } from '../store/store'; 

const ProductListPage = () => {
  const { user } = useAuthStore(); 
  const { addToCart } = useCartStore(); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: '', sort: 'newest' });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      params.append('sort', filters.sort);

      const response = await api.get(`/products?${params}`);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to permanently delete this product?")) {
      try {
        await api.delete(`/products/${productId}`);
        setProducts(products.filter(product => product._id !== productId));
      } catch (error) {
        console.error("Failed to delete:", error);
        alert(error.response?.data?.message || "Could not delete product.");
      }
    }
  };
// 👇 BULLETPROOF IMAGE FIXER 👇
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // 1. Fix Windows backslashes
    let cleanPath = imagePath.replace(/\\/g, '/');
    
    // 2. Remove extra slash at the start if there is one
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
    
    // 3. If the database forgot the 'uploads/' folder, force it in!
    if (!cleanPath.startsWith('uploads/')) {
      cleanPath = `uploads/${cleanPath}`;
    }
    
    const finalUrl = `http://localhost:5000/${cleanPath}`;
    
    // 🕵️ The Spy: This will print the exact URL to your console!
    console.log("Trying to load image:", finalUrl); 
    
    return finalUrl;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Products</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search products..."
              className="input-field border border-gray-300 p-2 rounded"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <select
              className="input-field border border-gray-300 p-2 rounded"
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center text-gray-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500">No products found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => {
              const isOwner = user && (user._id === product.vendor?._id || user._id === product.vendor);

              return (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition flex flex-col h-full">
                  
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                    {product.thumbnail || (product.images && product.images.length > 0) ? (
                      <img 
                        // 👇 USING THE IMAGE FIXER HERE 👇
                        src={getImageUrl(product.thumbnail || product.images[0])} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = "https://via.placeholder.com/400?text=No+Image";
                        }}
                      />
                    ) : (
                      <span className="text-5xl">📦</span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold mb-2 line-clamp-2 text-gray-800">{product.name}</h3>
                    <p className="text-lasu-green font-bold text-lg">₦{product.price ? product.price.toLocaleString() : '0'}</p>
                    <p className="text-gray-600 text-sm mb-4">⭐ {product.rating || 0}</p>
                    
                    <div className="mt-auto">
                      {isOwner ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(product._id)}
                          className="w-full rounded-md bg-red-50 px-4 py-2 text-red-600 font-semibold border border-red-200 hover:bg-red-100 transition flex items-center justify-center gap-2"
                        >
                          <span>🗑️</span> Remove Product
                        </button>
                      ) : (
                        <button 
                          onClick={() => addToCart(product, 1)}
                          className="w-full bg-lasu-green text-white py-2 rounded-md font-semibold hover:bg-green-700 transition"
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListPage;