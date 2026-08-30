import React, { useState, useEffect } from 'react';
import { FaBus, FaMapMarkerAlt, FaCalendarAlt, FaSearch, FaClock, FaChair } from 'react-icons/fa';
import api from '../services/api';
import BookingForm from './BookingForm';
import './TravelSearch.css';

function BusSearch() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/buses');
      setBuses(response.data.filter((bus) => bus.active !== false));
    } catch (error) {
      console.error('Error loading buses:', error);
      alert(error.userMessage || 'Unable to load buses. Please try again.');
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.get('/buses/search', {
        params: { from, to, date: date + 'T00:00:00' }
      });
      setBuses(response.data);
    } catch (error) {
      alert(error.userMessage || 'Unable to search buses. Please try again.');
    }

    setLoading(false);
  };

  return (
    <main className="travel-page">
      <section className="travel-hero">
        <div className="travel-hero-icon bus-color">
          <FaBus />
        </div>

        <div>
          <span className="travel-eyebrow">BUS BOOKING</span>
          <h1>Find The Right Bus Journey</h1>
          <p>Comfortable and convenient travel options for your next destination.</p>
        </div>
      </section>

      <section className="search-panel">
        <form onSubmit={handleSearch} className="travel-search-form">

          <div className="travel-input-group">
            <label><FaMapMarkerAlt /> From City</label>
            <input
              type="text"
              placeholder="Departure city"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
            />
          </div>

          <div className="travel-route-arrow">→</div>

          <div className="travel-input-group">
            <label><FaMapMarkerAlt /> To City</label>
            <input
              type="text"
              placeholder="Arrival city"
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
            {loading ? 'Searching...' : 'Search Buses'}
          </button>
        </form>
      </section>

      <section className="results-section">
        <div className="results-heading">
          <div>
            <span>AVAILABLE OPTIONS</span>
            <h2>Buses Available</h2>
          </div>
          <p>{buses.length} result{buses.length !== 1 ? 's' : ''} found</p>
        </div>

        {loading && <div className="loading-state">Loading buses...</div>}

        {!loading && buses.length === 0 && (
          <div className="empty-state">
            <FaBus />
            <h3>No Buses Found</h3>
            <p>Try searching for another route or date.</p>
          </div>
        )}

        <div className="travel-results">
          {buses.map((bus) => (
            <article className="travel-result-card" key={bus.id}>

              <div className="result-main">
                <div className="transport-badge bus-badge">
                  <FaBus />
                </div>

                <div className="result-details">
                  <span className="operator-name">{bus.operator}</span>
                  <h3>{bus.busNumber}</h3>

                  <div className="route-line">
                    <strong>{bus.fromCity}</strong>
                    <span></span>
                    <strong>{bus.toCity}</strong>
                  </div>
                </div>
              </div>

              <div className="result-info">
                <div>
                  <FaClock />
                  <span>Departure</span>
                  <strong>{new Date(bus.departureTime).toLocaleString()}</strong>
                </div>

                <div>
                  <FaClock />
                  <span>Arrival</span>
                  <strong>{new Date(bus.arrivalTime).toLocaleString()}</strong>
                </div>

                <div>
                  <FaChair />
                  <span>{bus.busType}</span>
                  <strong>{bus.availableSeats} Seats</strong>
                </div>
              </div>

              <div className="result-price">
                <span>Starting from</span>
                <h2>₹{bus.price}</h2>

                <button onClick={() => setSelectedBus(bus)}>
                  Book Now →
                </button>
              </div>

            </article>
          ))}
        </div>
      </section>

      {selectedBus && (
        <BookingForm
          item={selectedBus}
          type="BUS"
          onClose={() => setSelectedBus(null)}
        />
      )}
    </main>
  );
}

export default BusSearch;
