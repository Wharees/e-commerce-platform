import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/store'; // 1. Imported the auth store

const HomePage = () => {
  // 2. Grabbed the isAuthenticated status
  const { isAuthenticated } = useAuthStore(); 

  return (
    <div className="min-h-screen bg-gradient-to-br from-lasu-green to-lasu-dark-green text-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Welcome to Digital LASU E-Commerce
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-100">
          The ultimate marketplace for LASU community - Buy, Sell, and Thrive Together
        </p>
        <Link
          to="/marketplace"
          className="inline-block bg-white text-lasu-green px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
        >
          Start Shopping
        </Link>
      </section>

      {/* Features */}
      <section className="bg-white text-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose LASU Commerce?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🎓', title: 'For Students', desc: 'Easy access to campus essentials and peer-to-peer marketplace' },
              { icon: '👔', title: 'For Staff', desc: 'Professional platform to buy and sell within the university community' },
              { icon: '🏪', title: 'For Vendors', desc: 'Reach targeted audience and grow your business within LASU' }
            ].map((feature, idx) => (
              <div key={idx} className="card text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['📚 Books', '💻 Electronics', '👗 Fashion', '🍔 Food', '🎒 Essentials'].map((cat, idx) => (
              <Link
                key={idx}
                to="/marketplace" /* Updated this from /products to /marketplace */
                className="bg-white bg-opacity-20 hover:bg-opacity-40 transition p-6 rounded-lg text-center font-bold text-white"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-lasu-dark-green py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <div className="space-y-4 md:space-y-0 md:space-x-4">
            
            {/* 3. Hid these buttons if the user is logged in */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/register"
                  className="inline-block bg-white text-lasu-green px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
                >
                  Create Account
                </Link>
                <Link
                  to="/login"
                  className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-lasu-green transition"
                >
                  Login
                </Link>
              </>
            )}

            {/* 4. Made this button dynamic based on login status */}
            <Link
              to="/marketplace"
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-lasu-green transition"
            >
              {isAuthenticated ? "Go to Marketplace" : "Start Shopping"}
            </Link>

          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;