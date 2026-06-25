import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api'; // Import your API instance to talk to the backend


const CustomerMarketplace = () => {
  const navigate = useNavigate();
  
  // 1. Set up state to hold our live database products
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 2. Fetch the products from the backend when the page loads
  useEffect(() => {
    const fetchMarketplaceProducts = async () => {
      try {
        // Change '/products' if your backend endpoint is named something else (e.g., '/api/products')
        const response = await api.get('/products'); 
        
        // Some backends return { products: [...] }, others just return the array [...]
        const liveData = response.data.products || response.data;
        setProducts(liveData);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load the marketplace. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketplaceProducts();
  }, []);

  const openChat = (vendorId) => {
    if (!vendorId) {
      alert("Vendor contact information is missing for this product.");
      return;
    }
    navigate(`/messages?chatWith=${vendorId}`);
  };

  // 3. Show a loading screen while we wait for MongoDB
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-lasu-green animate-pulse">Loading Student Marketplace...</div>
      </div>
    );
  }
  

  // 4. Show an error screen if the backend is down
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-red-600 bg-red-50 px-6 py-4 rounded-lg border border-red-200">{error}</div>
      </div>
    );
  }
  const handleAddToCart = async (productId) => {
    try {
      // We send the product ID and a default quantity of 1
      const response = await api.post('/cart/add', { 
        productId: productId, 
        quantity: 1 
      });
      
      // Optional: You can replace this with a nice toast notification later!
      alert('Item added to cart! 🛒'); 
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(error.response?.data?.message || "Failed to add item to cart.");
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 py-10 text-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-10 rounded-3xl bg-white p-10 shadow-md border border-gray-200">
          <h1 className="text-4xl font-bold">Student Marketplace</h1>
          <p className="mt-3 text-gray-600">Browse trusted campus sellers and message vendors directly from every listing.</p>
        </div>

        {/* 5. If the database is empty, show a friendly message */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-2xl text-gray-800 font-bold mb-2">Marketplace is Empty</h3>
            <p className="text-gray-500">No vendors have published products yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* 6. Map through our LIVE database products */}
            {products.map((product) => (
              <div key={product._id} className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col h-full">
                
               {/* Image Area */}
                <div className="w-full h-48 bg-gray-100 rounded-2xl mb-4 flex items-center justify-center overflow-hidden">
                  {/* Changed from product.imageUrl to product.thumbnail */}
                  {product.thumbnail || (product.images && product.images.length > 0) ? (
                    <img 
                      // Use the thumbnail, or the first image in the array
                      src={product.thumbnail || product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-5xl">📦</span>
                  )}
                </div>

                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold text-gray-900 truncate">{product.name}</h2>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700 whitespace-nowrap">
                    ₦{product.price ? product.price.toLocaleString() : '0'}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">{product.description}</p>
                
                <div className="mb-6 text-sm text-gray-500">
                  {/* Safely grab the vendor name depending on how your backend populates it */}
                  Sold by <span className="font-medium text-gray-900">{product.vendor?.fullName || 'A Campus Vendor'}</span>
                </div>

                <button
                  type="button"
                  // Safely grab the vendor ID so the chat goes to the right person
                  onClick={() => openChat(product.vendor?._id || product.vendor)}
                  className="w-full rounded-2xl bg-lasu-green px-5 py-3 text-white font-semibold hover:bg-green-700 transition mt-auto"
                >
                  💬 Message Vendor
                </button>
                {/* 👇 PASTE THIS NEW BUTTON RIGHT BELOW IT 👇 */}
                  <button 
                    onClick={() => handleAddToCart(product._id || product.id)}
                    className="w-full mt-2 border-2 border-lasu-green text-lasu-green font-semibold py-2 px-4 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                  >
                    🛒 Add to Cart
                  </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerMarketplace;