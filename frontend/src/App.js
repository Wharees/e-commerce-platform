import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/store';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Notification from './components/Notification';


// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AddProductPage from './pages/AddProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage'; // 👈 NEW IMPORT
import OrderHistoryPage from './pages/OrderHistoryPage';
import MessagesPage from './pages/MessagesPage';
import VendorDashboard from './pages/VendorDashboard';
// Remove OrderDetailPage from the bundle
import { ProfilePage, AdminDashboardPage, ReviewsPage } from './pages/OtherPages';
// Import it from its brand new file!
import OrderDetailPage from './pages/OrderDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import useAutoLogout from './hooks/useAutoLogout';
import CustomerMarketplace from './pages/CustomerMarketplace';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminRoute from './components/AdminRoute'; // 👇 Import your new bouncer
import AdminLogin from './pages/Admin/AdminLogin';
import EscrowAndPayouts from './pages/Admin/EscrowAndPayouts';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Auto-Logout Logic
const AppLogic = () => {
  const { logout } = useAuthStore(); 
  useAutoLogout(logout); 
  return null; 
};

function App() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    console.log('App initialized');
  }, []);

  return (
    <Router>
      <AppLogic />
      <div className="flex flex-col min-h-screen bg-gray-50">
        {isAuthenticated && <Navbar />}
        
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/Admin/login" element={<AdminLogin />} />

            {/* Protected Customer Routes */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <CustomerMarketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            {/* 🎯 NEW ORDER SUCCESS ROUTE */}
            <Route
              path="/order-success"
              element={
                <ProtectedRoute>
                  <OrderSuccessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrderHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reviews"
              element={
                <ProtectedRoute>
                  <ReviewsPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Vendor Routes */}
            <Route
              path="/vendor/dashboard"
              element={
                <ProtectedRoute requiredRole="vendor">
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/add-product"
              element={
                <ProtectedRoute requiredRole="vendor">
                  <AddProductPage />
                </ProtectedRoute>
              }
            />
                        {/* 🔴 STRICTLY PROTECTED ADMIN ROUTES */}
              <Route element={<AdminRoute />}>
                <Route path="/Admin/dashboard" element={<AdminDashboard />} />
                <Route path="/Admin/transactions" element={<EscrowAndPayouts/>} /> 
              </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        {isAuthenticated && <Footer />}
        <Notification />
      </div>
    </Router>
  );
}

export default App;