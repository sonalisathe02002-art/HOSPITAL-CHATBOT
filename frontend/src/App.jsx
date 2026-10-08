import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import ChatWidget from './components/ChatWidget';
import AppointmentModal from './components/AppointmentModal';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDirectory from './pages/DoctorDirectory';
import DepartmentDirectory from './pages/DepartmentDirectory';
import HospitalServices from './pages/HospitalServices';
import MyAppointments from './pages/MyAppointments';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-semibold">
          <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main Layout Controller
const MainAppContent = () => {
  const location = useLocation();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [initialDoctorId, setInitialDoctorId] = useState(null);
  const [initialDeptId, setInitialDeptId] = useState(null);

  const openBookingModal = (doctorId = null, deptId = null) => {
    setInitialDoctorId(doctorId);
    setInitialDeptId(deptId);
    setBookingModalOpen(true);
  };

  // Determine if current route is a dashboard route that uses Sidebar
  const isDashboardRoute = ['/dashboard', '/admin', '/my-appointments', '/profile'].some(path => 
    location.pathname.startsWith(path)
  );
  const isAuthRoute = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* If it's a dashboard route, render Sidebar + Header + Content */}
      {isDashboardRoute ? (
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            <Navbar onOpenBooking={() => openBookingModal()} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              <Routes>
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <PatientDashboard onOpenBooking={() => openBookingModal()} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-appointments"
                  element={
                    <ProtectedRoute>
                      <MyAppointments onOpenBooking={() => openBookingModal()} />
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
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        /* Public / Informational Pages Layout */
        <>
          {!isAuthRoute && <Navbar onOpenBooking={() => openBookingModal()} />}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage onOpenBooking={() => openBookingModal()} />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/doctors" element={<DoctorDirectory onOpenBooking={(docId, deptId) => openBookingModal(docId, deptId)} />} />
              <Route path="/departments" element={<DepartmentDirectory onOpenBooking={(docId, deptId) => openBookingModal(docId, deptId)} />} />
              <Route path="/services" element={<HospitalServices onOpenBooking={() => openBookingModal()} />} />
              <Route path="/chat" element={<ChatPage onOpenBooking={() => openBookingModal()} />} />
              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          {!isAuthRoute && <Footer />}
        </>
      )}

      {/* Globally Accessible AI Chat Floating Widget */}
      {location.pathname !== '/chat' && (
        <ChatWidget onOpenBooking={() => openBookingModal()} />
      )}

      {/* Globally Accessible Interactive Appointment Booking Modal */}
      <AppointmentModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialDoctorId={initialDoctorId}
        initialDeptId={initialDeptId}
      />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <MainAppContent />
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
