import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, useNotificationStore } from '../store/store';
import api from '../utils/api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    lasuEmail: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      addNotification({
        type: 'error',
        title: 'Password Mismatch',
        message: 'Passwords do not match'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        lasuEmail: formData.lasuEmail,
        password: formData.password,
        phone: formData.phone,
        role: formData.role
      });

      const { user, accessToken } = response.data;
      login(user, accessToken);

      addNotification({
        type: 'success',
        title: 'Registration Successful',
        message: 'Welcome to LASU Commerce!'
      });

      navigate('/');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: error.response?.data?.message || 'Please check your information'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-lasu-green mb-6 text-center">Create Account</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="input-field"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">LASU Email</label>
            <input
              type="email"
              name="lasuEmail"
              value={formData.lasuEmail}
              onChange={handleChange}
              className="input-field"
              placeholder="you@lasu.edu.ng"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
              placeholder="+234 901 234 5678"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Register As</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
            >
              <option value="customer">Customer</option>
              <option value="vendor">Vendor/Seller</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your password"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input-field"
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-lasu-green font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
