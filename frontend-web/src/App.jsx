import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { TripProvider }  from './context/TripContext.jsx'
import { BookingProvider } from './context/BookingContext.jsx'
import MainLayout    from './layouts/MainLayout.jsx'
import AuthLayout    from './layouts/AuthLayout.jsx'

import Home          from './pages/Home/Home.jsx'
import Login         from './pages/Login/Login.jsx'
import Register      from './pages/Register/Register.jsx'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword.jsx'
import Onboarding    from './pages/Onboarding/Onboarding.jsx'
import AISearch      from './pages/AISearch/AISearch.jsx'
import TopResults    from './pages/TopResults/TopResults.jsx'
import Search        from './pages/Search/Search.jsx'
import Destination   from './pages/Destination/Destination.jsx'
import Trip          from './pages/Trip/Trip.jsx'
import Checkout      from './pages/Checkout/Checkout.jsx'
import Orders        from './pages/Orders/Orders.jsx'
import Review        from './pages/Review/Review.jsx'
import Itinerary     from './pages/Itinerary/Itinerary.jsx'
import Favorites     from './pages/Favorites/Favorites.jsx'
import Utilities     from './pages/Utilities/Utilities.jsx'
import Profile       from './pages/Profile/Profile.jsx'
import ChangePassword from './pages/ChangePassword/ChangePassword.jsx'
import Contact       from './pages/Contact/Contact.jsx'
import About         from './pages/About/About.jsx'
import LandmarkRecognition from './pages/LandmarkRecognition/LandmarkRecognition.jsx'
import SafetyAlerts  from './pages/SafetyAlerts/SafetyAlerts.jsx'
import SafetyHub     from './pages/SafetyHub/SafetyHub.jsx'
import AdminRoute    from './admin/routes/AdminRoute.jsx'

/** Renders the full route tree once auth state is resolved */
function AppRoutes() {
  const { authLoading } = useAuth()

  if (authLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg, #0f0f1a)',
        color: 'var(--text-secondary, #a0a0b0)', flexDirection: 'column', gap: 16,
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ animation: 'spin 1.2s linear infinite' }}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: 14 }}>Đang khởi động...</span>
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot"   element={<ForgotPassword />} />
      </Route>

      <Route path="/admin/*" element={<AdminRoute />} />

      <Route path="/onboarding" element={<Onboarding />} />

      <Route element={<MainLayout />}>
        <Route path="/"                element={<Home />} />
        <Route path="/ai-search"       element={<AISearch />} />
        <Route path="/top-results"     element={<TopResults />} />
        <Route path="/search"          element={<Search />} />
        <Route path="/destination/:id" element={<Destination />} />
        <Route path="/trip/:id"        element={<Trip />} />
        <Route path="/checkout"        element={<Checkout />} />
        <Route path="/orders"          element={<Orders />} />
        <Route path="/review/:id"      element={<Review />} />
        <Route path="/itinerary"       element={<Itinerary />} />
        <Route path="/favorites"       element={<Favorites />} />
        <Route path="/utilities"       element={<Utilities />} />
        <Route path="/profile"         element={<Profile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/contact"         element={<Contact />} />
        <Route path="/about"           element={<About />} />
        <Route path="/landmark-recognition" element={<LandmarkRecognition />} />
        <Route path="/safety-alerts"   element={<SafetyAlerts />} />
        <Route path="/safety-hub"       element={<SafetyHub />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TripProvider>
          <BookingProvider>
            <AppRoutes />
          </BookingProvider>
        </TripProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
