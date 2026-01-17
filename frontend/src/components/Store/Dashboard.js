import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoreDashboard } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Store.css';

const StoreDashboard = () => {
  const [data, setData] = useState({ averageRating: 0, totalRatings: 0, raters: [] });
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await getStoreDashboard();
      setData(response.data);
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
    <div className="store-container">
      <nav className="store-nav">
        <h1>Store Dashboard</h1>
        <div className="nav-links">
          <button onClick={() => navigate('/store/password')}>Change Password</button>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Average Rating</h3>
          <p className="stat-number">{parseFloat(data.averageRating).toFixed(2)} ⭐</p>
        </div>
        <div className="stat-card">
          <h3>Total Ratings</h3>
          <p className="stat-number">{data.totalRatings}</p>
        </div>
      </div>

      <div className="raters-section">
        <h2>Users Who Rated Your Store</h2>
        {data.raters.length === 0 ? (
          <p>No ratings yet</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Rating</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.raters.map((rater) => (
                <tr key={rater.id}>
                  <td>{rater.name}</td>
                  <td>{rater.email}</td>
                  <td>{rater.rating} ⭐</td>
                  <td>{new Date(rater.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StoreDashboard;