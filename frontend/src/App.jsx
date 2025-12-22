import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layout/DashboardLayout';

import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Rent from './pages/Rent';
import Laundry from './pages/Laundry';
import Complaints from './pages/Complaints';
import Login from './pages/Login';
import GatePass from './pages/GatePass';
import Energy from './pages/Energy';
import Attendance from './pages/Attendance';
import Mailroom from './pages/Mailroom';
import Mess from './pages/Mess';
import Marketplace from './pages/Marketplace';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

const StudentRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'student') {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
          <Route path="/rent" element={<ProtectedRoute><Rent /></ProtectedRoute>} />
          <Route path="/laundry" element={<ProtectedRoute><Laundry /></ProtectedRoute>} />
          <Route path="/gate" element={<ProtectedRoute><GatePass /></ProtectedRoute>} />
          <Route path="/energy" element={<ProtectedRoute><Energy /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="/mailroom" element={<ProtectedRoute><Mailroom /></ProtectedRoute>} />
          <Route path="/mess" element={<ProtectedRoute><Mess /></ProtectedRoute>} />
          <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
          <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><StudentRoute><Marketplace /></StudentRoute></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
