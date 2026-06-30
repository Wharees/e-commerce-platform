import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/store'; 

const AdminRoute = () => {
  const { user } = useAuthStore(); // Grab the currently logged-in user

  // Check 1: Is there nobody logged in at all?
  if (!user) {
    // Send them to the admin login page
    return <Navigate to="/admin/login" replace />;
  }

  // Check 2: Is someone logged in, but they are just a Student or Vendor?
  if (user.role !== 'admin') {
    // Kick them out to the main student homepage! 
    // They have no business sniffing around the admin area.
    return <Navigate to="/" replace />;
  }

  // If they pass both checks, unlock the door and let them see the Admin pages
  return <Outlet />;
};

export default AdminRoute;