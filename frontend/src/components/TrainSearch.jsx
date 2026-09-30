import React, { useState, useEffect } from 'react';
import { FaTrain, FaMapMarkerAlt, FaCalendarAlt, FaSearch, FaClock, FaChair } from 'react-icons/fa';
import api from '../services/api';
import BookingForm from './BookingForm';
import './TravelSearch.css';

function TrainSearch() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);

  useEffect(() => {
    loadTrains();
  }, []);

  const loadTrains = async () => {
    setLoading(true);
    try {
      const response = await api.get('/trains');
      setTrains(response.data.filter((train) => train.active !== false));
    } catch (error) {
      console.error('Error loading trains:', error);
      alert(error.userMessage || 'Unable to load trains. Please try again.');
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.get('/trains/search', {
        params: { from, to, date: date + 'T00:00:00' }
      });
      setTrains(response.data);
    } catch (error) {
      alert(error.userMessage || 'Unable to search trains. Please try again.');
    }

    setLoading(false);
  };

  return (
    <main className="travel-page">
      <section className="travel-hero">
        <div className="travel-hero-icon train-color">
          <FaTrain />
        </div>

        <div>
          <span className="travel-eyebrow">TRAIN BOOKING</span>
          <h1>Travel Comfortably By Train</h1>
          <p>Search available trains and reserve your seat for your next journey.</p>
        </div>
      </section>

      <section className="search-panel">
        <form onSubmit={handleSearch} className="travel-search-form">

          <div className="travel-input-group">
            <label><FaMapMarkerAlt /> From Station</label>
            <input
              type="text"
              placeholder="Departure station"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
            />
          </div>

          <div className="travel-route-arrow">→</div>

          <div className="travel-input-group">
            <label><FaMapMarkerAlt /> To Station</label>
            <input
              type="text"
              placeholder="Arrival station"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
          </div>

          <div className="travel-input-group">
            <label><FaCalendarAlt /> Travel Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="travel-search-btn">
            <FaSearch />
            {loading ? 'Searching...' : 'Search Trains'}
          </button>
        </form>
      </section>

      <section className="results-section">
        <div className="results-heading">
          <div>
            <span>AVAILABLE OPTIONS</span>
            <h2>Trains Available</h2>
          </div>
          <p>{trains.length} result{trains.length !== 1 ? 's' : ''} found</p>
        </div>

        {loading && <div className="loading-state">Loading trains...</div>}

        {!loading && trains.length === 0 && (
          <div className="empty-state">
            <FaTrain />
            <h3>No Trains Found</h3>
            <p>Try another route or travel date.</p>
          </div>
        )}

        <div className="travel-results">
          {trains.map((train) => (
            <article className="travel-result-card" key={train.id}>

              <div className="result-main">
                <div className="transport-badge train-badge">
                  <FaTrain />
                </div>

                <div className="result-details">
                  <span className="operator-name">{train.trainName}</span>
                  <h3>{train.trainNumber}</h3>

                  <div className="route-line">
                    <strong>{train.fromStation}</strong>
                    <span></span>
                    <strong>{train.toStation}</strong>
                  </div>
                </div>
              </div>

              <div className="result-info">
                <div>
                  <FaClock />
                  <span>Departure</span>
                  <strong>{new Date(train.departureTime).toLocaleString()}</strong>
                </div>

                <div>
                  <FaClock />
                  <span>Arrival</span>
                  <strong>{new Date(train.arrivalTime).toLocaleString()}</strong>
                </div>

                <div>
                  <FaChair />
                  <span>{train.trainClass}</span>
                  <strong>{train.availableSeats} Seats</strong>
                </div>
              </div>

              <div className="result-price">
                <span>Starting from</span>
                <h2>₹{train.price}</h2>

                <button onClick={() => setSelectedTrain(train)}>
                  Book Now →
                </button>
              </div>

            </article>
          ))}
        </div>
      </section>

      {selectedTrain && (
        <BookingForm
          item={selectedTrain}
          type="TRAIN"
          onClose={() => setSelectedTrain(null)}
        />
      )}
    </main>
  );
}

export default TrainSearch;
