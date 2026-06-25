import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">📚 LASU Commerce</h3>
            <p className="text-gray-400 text-sm">
              Digital marketplace for LASU students, staff, and vendors to buy and sell products and services.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-lasu-light-green">Home</Link></li>
              <li><Link to="/products" className="hover:text-lasu-light-green">Products</Link></li>
              <li><Link to="/cart" className="hover:text-lasu-light-green">Cart</Link></li>
              <li><a href="#" className="hover:text-lasu-light-green">About Us</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-lasu-light-green">Help Center</a></li>
              <li><a href="#" className="hover:text-lasu-light-green">Contact Us</a></li>
              <li><a href="#" className="hover:text-lasu-light-green">FAQ</a></li>
              <li><a href="#" className="hover:text-lasu-light-green">Feedback</a></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-bold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-lasu-light-green"><FaFacebook size={20} /></a>
              <a href="#" className="hover:text-lasu-light-green"><FaTwitter size={20} /></a>
              <a href="#" className="hover:text-lasu-light-green"><FaInstagram size={20} /></a>
              <a href="#" className="hover:text-lasu-light-green"><FaLinkedin size={20} /></a>
            </div>
          </div>
        </div>

        <hr className="border-gray-700 my-8" />

        <div className="flex justify-between items-center text-sm text-gray-400">
          <p>&copy; {currentYear} Digital LASU E-Commerce. All rights reserved.</p>
          <div className="space-x-4">
            <a href="#" className="hover:text-lasu-light-green">Privacy Policy</a>
            <a href="#" className="hover:text-lasu-light-green">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
