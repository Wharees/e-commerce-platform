import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import lasuLogo from '../../assets/lasu-logo.jpg'; // Adjust path if needed
import { useAuthStore } from '../../store/store'; // 👇 Import your auth state

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 👇 Send the login request to your real backend!
      // Make sure 'http://localhost:5000' matches your actual backend port
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Login was successful! 
        // 1. Update the global Zustand state so the bouncer lets you pass
        useAuthStore.setState({
          isAuthenticated: true,
          user: data, 
        });
        
        // 2. Save token to local storage so you stay logged in if you refresh
        localStorage.setItem('lasu_token', data.token);

        // 3. Teleport to the dashboard
        navigate('/admin/dashboard'); 
      } else {
        // ❌ Backend rejected the password or email
        alert(data.message || "Invalid Admin Credentials"); 
      }
    } catch (error) {
      console.error("Login failed", error);
      alert("Network error, check if your Node.js backend is running!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img 
            src={lasuLogo} 
            alt="LASU Logo" 
            className="h-16 w-16 object-contain rounded-full bg-white p-1" 
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Admin Portal Access
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Restricted to authorized personnel only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-700">
          <form className="space-y-6" onSubmit={handleAdminLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Admin Email Address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm placeholder-slate-400 bg-slate-700 text-white focus:outline-none focus:ring-lasu-green focus:border-lasu-green sm:text-sm"
                  placeholder="admin@lasu.edu.ng"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">
                Master Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm placeholder-slate-400 bg-slate-700 text-white focus:outline-none focus:ring-lasu-green focus:border-lasu-green sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition ${
                  isLoading ? 'bg-slate-500 cursor-not-allowed' : 'bg-lasu-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-lasu-green'
                }`}
              >
                {isLoading ? 'Authenticating...' : 'Secure Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;