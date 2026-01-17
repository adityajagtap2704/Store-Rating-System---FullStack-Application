import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserStores, submitRating } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './User.css';

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState(null);
  const [rating, setRating] = useState(0);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder]);

  const fetchStores = async () => {
    try {
      const response = await getUserStores({ 
        ...filters, 
        sortBy, 
        sortOrder 
      });
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const handleRatingSubmit = async (storeId) => {
    try {
      await submitRating({ storeId, rating });
      alert('Rating submitted successfully!');
      fetchStores();
      setSelectedStore(null);
      setRating(0);
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting rating');
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="user-container">
      <nav className="user-nav">
        <h1>Stores</h1>
        <div className="nav-links">
          <button onClick={() => navigate('/user/password')}>Change Password</button>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="filters">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by name"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Search by address"
            value={filters.address}
            onChange={(e) => setFilters({ ...filters, address: e.target.value })}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>
                Name {sortBy === 'name' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('address')}>
                Address {sortBy === 'address' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('overallRating')}>
                Overall Rating {sortBy === 'overallRating' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </th>
              <th>Your Rating</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id}>
                <td>{store.name}</td>
                <td>{store.address}</td>
                <td>{parseFloat(store.overallRating).toFixed(1)} ⭐</td>
                <td>{store.userRating ? `${store.userRating} ⭐` : 'Not rated'}</td>
                <td>
                  {selectedStore === store.id ? (
                    <div className="rating-input">
                      <select 
                        value={rating} 
                        onChange={(e) => setRating(parseInt(e.target.value))}
                      >
                        <option value="0">Select</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                      <button 
                        onClick={() => handleRatingSubmit(store.id)}
                        disabled={rating === 0}
                      >
                        Submit
                      </button>
                      <button onClick={() => setSelectedStore(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => {
                      setSelectedStore(store.id);
                      setRating(store.userRating || 0);
                    }}>
                      {store.userRating ? 'Update' : 'Rate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StoreList;