import React from 'react';
import { Link } from 'react-router-dom';

const VendorDashboard = () => {
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
                <span className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">12 items</span>
              </div>
              <div className="grid gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">Sample Product #{index + 1}</h3>
                        <p className="text-sm text-gray-500">Category placeholder</p>
                      </div>
                      <span className="text-lg font-bold text-green-700">₦3,400</span>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">Stock: 16 • Sold: 8</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Vendor Quick Actions</h2>
              <div className="grid gap-3">
                <button className="w-full rounded-2xl border border-gray-200 bg-green-50 px-5 py-4 text-left text-gray-800 hover:bg-green-100 transition">
                  View Sales Analytics
                </button>
                <button className="w-full rounded-2xl border border-gray-200 bg-green-50 px-5 py-4 text-left text-gray-800 hover:bg-green-100 transition">
                  Manage Orders
                </button>
                <button className="w-full rounded-2xl border border-gray-200 bg-green-50 px-5 py-4 text-left text-gray-800 hover:bg-green-100 transition">
                  Respond to Messages
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
