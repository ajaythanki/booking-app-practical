import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';
import { loadUser } from './store/slices/authSlice';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import EmailVerification from './components/EmailVerification';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookingForm from './pages/BookingForm';
import BookingCalendar from './pages/BookingCalendar';
import NotFound from './pages/NotFound';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch, token]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="verify-email/:token" element={<EmailVerification />} />
        
        {/* Protected Routes */}
        <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="booking/new" element={<ProtectedRoute><BookingForm /></ProtectedRoute>} />
        <Route path="booking/calendar" element={<ProtectedRoute><BookingCalendar /></ProtectedRoute>} />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;