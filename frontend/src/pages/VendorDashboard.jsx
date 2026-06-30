import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuthStore } from '../store/store'; // 👇 Bring in the auth store

const VendorDashboard = () => {
  const { user } = useAuthStore(); // Find out who is logged in
  const [vendorProducts, setVendorProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 👇 Fetch and filter the vendor's products
  useEffect(() => {
    const fetchMyInventory = async () => {
      try {
        const response = await api.get('/products');
        const allProducts = response.data.products || [];
        
        // Filter: Only keep products where the vendor matches the logged-in user
        const myProducts = allProducts.filter(
          product => product.vendor?._id === user?._id || product.vendor === user?._id
        );
        
        setVendorProducts(myProducts);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyInventory();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl bg-white p-8 shadow-md border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Vendor Dashboard</h1>
                <p className="mt-3 text-gray-600">Manage your listings, track inventory, and connect with students.</p>
              </div>
              <Link
                to="/vendor/add-product"
                className="inline-flex items-center justify-center rounded-full bg-lasu-green px-6 py-4 text-lg font-semibold text-white shadow hover:bg-green-700 transition"
              >
                ➕ Add New Product for Sale
              </Link>
            </div>
          </div>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">My Inventory</h2>
                  <p className="text-sm text-gray-500">Your active product listings at a glance.</p>
                </div>
                {/* 👇 Dynamic Item Count */}
                <span className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                  {vendorProducts.length} items
                </span>
              </div>
              
              <div className="grid gap-4">
                {/* 👇 Conditional rendering based on loading/empty/has data */}
                {loading ? (
                  <div className="text-center py-6 text-gray-500">Loading inventory...</div>
                ) : vendorProducts.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="mb-2">You haven't added any products yet.</p>
                    <Link to="/vendor/add-product" className="text-lasu-green font-bold hover:underline">
                      Add your first product &rarr;
                    </Link>
                  </div>
                ) : (
                  vendorProducts.map((product) => (
                    <div key={product._id} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                          {/* We check if category is an object (populated) or just an ID string */}
                          <p className="text-sm text-gray-500">{product.category?.name || 'General Category'}</p>
                        </div>
                        <span className="text-lg font-bold text-green-700">
                          ₦{product.price ? product.price.toLocaleString() : '0'}
                        </span>
                      </div>
                      <div className="mt-3 text-sm text-gray-600">
                        {/* Grabbing actual quantity from the DB */}
                        Stock: <span className="font-semibold">{product.quantity || 0}</span> • Sold: 0
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-200 h-fit">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Vendor Quick Actions</h2>
              <div className="grid gap-3">
                <Link to="/orders">
                  <button className="w-full rounded-2xl border border-gray-200 bg-green-50 px-5 py-4 text-left text-gray-800 hover:bg-green-100 transition">
                    Manage Orders
                  </button>
                </Link>
                <Link to="/messages">
                  <button className="w-full rounded-2xl border border-gray-200 bg-green-50 px-5 py-4 text-left text-gray-800 hover:bg-green-100 transition">
                    Respond to Messages
                  </button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;