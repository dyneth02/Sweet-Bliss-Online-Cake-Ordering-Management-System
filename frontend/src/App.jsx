import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import VacationNotice from './components/VacationNotice';
import HomePage from './pages/HomePage';
import Login from './auth/Login';
import Register from './auth/Register';
import StoreView from './customer/customerStoreApp/StoreView';
import CakeOrderForm from './customOrderApp/CakeOrderForm';
import Orders from './customerOrdersView/CakeOrdersView';
import Profile from './pages/ProfilePage';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import ProtectedRoute from './components/ProtectedRoute';
import FeedbackPage from './customer/customerFeedbackApp/FeedbackPage.jsx';
import CartView from './components/CartView';
import PaymentPage from './pages/PaymentPage';
import LoyaltyPage from './pages/LoyaltyPage';

import Dashboard from './admin/Dashboard';
import AdminOrdersView from './admin/adminOrderView/AdminOrdersView';
import AdminFeedbackView from './admin/adminFeedbackView/AdminFeedbackView';
import AdminInventoryView from './admin/adminInventoryView/AdminInventoryView';
import AdminCakeView from './admin/adminCakeView/AdminCakeView';
import InquiriesView from './admin/InquiriesView';

const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/vacation-notice" element={<VacationNotice />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route path="/cartview" element={<CartView />} />
      <Route path="/payment" element={<PaymentPage />} />

      {/* Protected customer routes */}
      <Route 
        path="/store" 
        element={
          <ProtectedRoute>
              <StoreView />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/ordercake" 
        element={
          <ProtectedRoute>
              <CakeOrderForm />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/myorders" 
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/loyalty" 
        element={
          <ProtectedRoute>
            <LoyaltyPage />
          </ProtectedRoute>
        }
      />

      {/* Protected admin routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/feedbacks"
        element={
          <ProtectedRoute>
            <AdminFeedbackView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute>
            <AdminOrdersView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <ProtectedRoute>
            <AdminInventoryView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/cakes"
        element={
          <ProtectedRoute>
            <AdminCakeView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inquiries"
        element={
          <ProtectedRoute>
            <InquiriesView />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
