import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import './App.css';

// Temporary placeholder components until we create the full ones
const AdminDashboard = () => <div>Admin Dashboard - Coming Soon</div>;
const UserStoreList = () => <div>User Store List - Coming Soon</div>;
const StoreDashboard = () => <div>Store Dashboard - Coming Soon</div>;

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* User Routes */}
            <Route
              path="/user/stores"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserStoreList />
                </ProtectedRoute>
              }
            />

            {/* Store Owner Routes */}
            <Route
              path="/store/dashboard"
              element={
                <ProtectedRoute allowedRoles={['store_owner']}>
                  <StoreDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;