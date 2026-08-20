import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/Dashboard/Dashboard';
import Destinations from '../pages/Destinations/Destinations';
import AdminUserManagement from '../pages/Users/AdminUserManagement';
import AdminReviewManagement from '../pages/Reviews/AdminReviewManagement';
import AdminItineraryManagement from '../pages/Itineraries/AdminItineraryManagement';
import Settings from '../pages/Settings/Settings';
import AdminProfile from '../pages/Profile/AdminProfile';

const AdminRoute = () => {
  const { user, isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'var(--font-body)', color: 'var(--color-on-surface-variant)' }}>
        <p>Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  const isAdmin = isLoggedIn && user && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN');

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="destinations" element={<Destinations />} />
        <Route path="users" element={<AdminUserManagement />} />
        <Route path="reviews" element={<AdminReviewManagement />} />
        <Route path="itineraries" element={<AdminItineraryManagement />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
    </Routes>
  );
};

export default AdminRoute;
