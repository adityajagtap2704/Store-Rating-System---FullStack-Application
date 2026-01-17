import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-container">
      <nav className="admin-nav">
        <h1>Admin Dashboard</h1>
        <div className="nav-links">
          <button onClick={() => navigate('/admin/users')}>Users</button>
          <button onClick={() => navigate('/admin/stores')}>Stores</button>
          <button onClick={() => navigate('/admin/add-user')}>Add User</button>
          <button onClick={() => navigate('/admin/add-store')}>Add Store</button>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Stores</h3>
          <p className="stat-number">{stats.totalStores}</p>
        </div>
        <div className="stat-card">
          <h3>Total Ratings</h3>
          <p className="stat-number">{stats.totalRatings}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;