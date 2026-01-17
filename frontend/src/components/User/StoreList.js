import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const StoreList = () => {
  const { user, logout } = useAuth();
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await api.get('/user/stores');
      setStores(response.data);
    } catch (error) {
      showMessage('error', 'Failed to fetch stores');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      showMessage('error', 'Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await api.post('/user/ratings', {
        storeId: selectedStore.id,
        rating,
      });
      showMessage('success', 'Rating submitted successfully');
      setSelectedStore(null);
      setRating(0);
      fetchStores();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StarRating = ({ value, onRate, onHover, interactive = true }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate && onRate(star)}
            onMouseEnter={() => interactive && onHover && onHover(star)}
            onMouseLeave={() => interactive && onHover && onHover(0)}
            className={`text-3xl transition-colors ${
              interactive ? 'cursor-pointer' : 'cursor-default'
            } ${
              star <= (interactive ? (hoverRating || value) : value)
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Store Directory</h1>
              <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
            </div>
            <button onClick={logout} className="btn-danger">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Message Alert */}
      {message.text && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search stores by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
            <svg
              className="absolute left-3 top-3 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Store Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <div key={store.id} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{store.name}</h3>
                  <p className="text-sm text-gray-600">{store.email}</p>
                </div>
                <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {store.average_rating || 'N/A'}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-4 line-clamp-2">{store.address}</p>
              
              {store.user_rating ? (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2">Your Rating:</p>
                  <StarRating value={store.user_rating} interactive={false} />
                </div>
              ) : (
                <button
                  onClick={() => setSelectedStore(store)}
                  className="w-full btn-primary"
                >
                  Rate This Store
                </button>
              )}
            </div>
          ))}
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No stores found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search terms.</p>
          </div>
        )}
      </main>

      {/* Rating Modal */}
      {selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-2">Rate {selectedStore.name}</h3>
            <p className="text-sm text-gray-600 mb-6">{selectedStore.address}</p>
            
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3 text-center">
                Select your rating:
              </p>
              <div className="flex justify-center">
                <StarRating
                  value={rating}
                  onRate={setRating}
                  onHover={setHoverRating}
                  interactive={true}
                />
              </div>
              {rating > 0 && (
                <p className="text-center mt-2 text-sm text-gray-600">
                  You selected {rating} star{rating !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleRatingSubmit}
                disabled={loading || rating === 0}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Rating'}
              </button>
              <button
                onClick={() => {
                  setSelectedStore(null);
                  setRating(0);
                  setHoverRating(0);
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreList;