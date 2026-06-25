import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../store/store';
import { HiShoppingCart, HiMenu, HiX, HiUser } from 'react-icons/hi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();

  // 👇 NEW LOGIC: Check if user is a customer to change the link
  const isCustomer = user?.role === 'customer';
  const navLinkText = isCustomer ? 'Marketplace' : 'Products';
  const navLinkTo = isCustomer ? '/marketplace' : '/products';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-lasu-green text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="font-bold text-2xl">
             LASU E-Commerce
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {/* 👇 UPDATED: Uses the dynamic link */}
            <Link to={navLinkTo} className="hover:text-lasu-light-green">{navLinkText}</Link>
            
            <Link to="/cart" className="flex items-center relative hover:text-lasu-light-green">
              <HiShoppingCart size={24} />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">{user.fullName}</span>
                <div className="relative group">
                  <button className="flex items-center hover:text-lasu-light-green">
                    <HiUser size={24} />
                  </button>
                  <div className="hidden group-hover:block absolute right-0 bg-white text-gray-800 rounded-lg shadow-lg py-2 w-48">
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100">My Orders</Link>
                    <Link to="/messages" className="block px-4 py-2 hover:bg-gray-100">Messages</Link>
                    {user.role === 'vendor' && (
                      <Link to="/vendor/dashboard" className="block px-4 py-2 hover:bg-gray-100">Vendor Dashboard</Link>
                    )}
                    {user.role === 'admin' && (
                      <Link to="/admin/dashboard" className="block px-4 py-2 hover:bg-gray-100">Admin Dashboard</Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/login" className="hover:text-lasu-light-green">Login</Link>
                <Link to="/register" className="bg-lasu-light-green px-4 py-2 rounded hover:bg-white hover:text-lasu-green">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
          >
            {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {/* 👇 UPDATED: Uses the dynamic link for mobile too */}
            <Link to={navLinkTo} className="block py-2 hover:text-lasu-light-green">{navLinkText}</Link>
            
            <Link to="/cart" className="block py-2 hover:text-lasu-light-green">Cart ({items.length})</Link>
            {user ? (
              <>
                <Link to="/profile" className="block py-2 hover:text-lasu-light-green">Profile</Link>
                <Link to="/orders" className="block py-2 hover:text-lasu-light-green">My Orders</Link>
                {user.role === 'vendor' && (
                  <Link to="/vendor/dashboard" className="block py-2 hover:text-lasu-light-green">Vendor Dashboard</Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="block py-2 hover:text-lasu-light-green">Admin Dashboard</Link>
                )}
                <button onClick={handleLogout} className="block w-full text-left py-2 text-red-300 hover:text-red-200">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 hover:text-lasu-light-green">Login</Link>
                <Link to="/register" className="block py-2 bg-lasu-light-green px-4 rounded">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;