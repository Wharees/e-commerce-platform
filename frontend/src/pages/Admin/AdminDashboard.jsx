import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAdminAutoLogout from '../../hooks/useAdminAutoLogout';

const AdminDashboard = () => {
  const navigate = useNavigate();

  useAdminAutoLogout(10);
  
  // 1. Setup state to hold the real data
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  // 2. Fetch real data from your backend using the Bearer Token
  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('lasu_token');
      
      try {
        const response = await fetch('http://localhost:5000/api/admin/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            // If token is expired or missing, kick them back to login
            navigate('/admin/login');
          }
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        
        // 👇 ADD THIS LINE TO INTERCEPT THE DATA
        console.log("WHAT REACT IS RECEIVING:", data); 
        
        setStats(data.dashboard);

      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  // 3. Handle Secure Logout
  const handleLogout = () => {
    localStorage.removeItem('lasu_token');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 📍 SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-lasu-green tracking-wide">LASU Admin</h2>
          <p className="text-xs text-slate-400 mt-1">Superuser Console</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/admin/dashboard" className="block px-4 py-3 bg-lasu-green rounded-xl font-medium text-white shadow-lg">
            📊 Overview
          </Link>
          <Link to="/admin/approvals" className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition">
            📦 Pending Approvals <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
          </Link>
          <Link to="/admin/transactions" className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition">
            💳 Escrow & Payouts
          </Link>
          <Link to="/admin/users" className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition">
            👥 User Management
          </Link>
          <Link to="/admin/disputes" className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition">
            ⚖️ Open Disputes
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-slate-400 hover:text-red-400 transition">
            🚪 Secure Logout
          </button>
        </div>
      </aside>

      {/* 📍 MAIN CONTENT AREA */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Overview</h1>
            <p className="text-gray-500">Live statistics for the LASU Marketplace.</p>
          </div>
        </header>

        {/* Global Statistics Cards */}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-lg font-medium text-gray-500 animate-pulse">Loading secure data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue (5%)</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">₦{stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-lasu-green">
              <h3 className="text-sm font-medium text-gray-500">Total Orders Processed</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders || '0'}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-yellow-500">
              <h3 className="text-sm font-medium text-gray-500">Active Vendors</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalVendors || '0'}</p>
            </div>
          </div>
        )}

        {/* Quick Action / Recent Activity Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Action Required</h2>
          <div className="border border-red-200 bg-red-50 rounded-xl p-4 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-red-700">Pending Vendor Payouts</h4>
              <p className="text-sm text-red-600">Vendors are requesting withdrawals from their virtual wallets.</p>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-red-700 transition">
              Review Payouts
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;