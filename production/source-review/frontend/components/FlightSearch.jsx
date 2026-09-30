import React, { useState, useEffect } from 'react';
import { FaPlane, FaMapMarkerAlt, FaCalendarAlt, FaSearch, FaClock, FaChair } from 'react-icons/fa';
import api from '../services/api';
import BookingForm from './BookingForm';
import './TravelSearch.css';

function FlightSearch() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    setLoading(true);
    try {
      const response = await api.get('/flights');
      setFlights(response.data.filter((flight) => flight.active !== false));
    } catch (error) {
      console.error('Error loading flights:', error);
      alert(error.userMessage || 'Unable to load flights. Please try again.');
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.get('/flights/search', {
        params: { from, to, date: date + 'T00:00:00' }
      });
      setFlights(response.data);
    } catch (error) {
      alert(error.userMessage || 'Unable to search flights. Please try again.');
    }

    setLoading(false);
  };

  return (
    <main className="travel-page">
      <section className="travel-hero">
        <div className="travel-hero-icon">
          <FaPlane />
        </div>

        <div>
          <span className="travel-eyebrow">FLIGHT BOOKING</span>
          <h1>Find Your Perfect Flight</h1>
          <p>Compare available flights and book your journey with confidence.</p>
        </div>
      </section>

      <section className="search-panel">
        <form onSubmit={handleSearch} className="travel-search-form">

          <div className="travel-input-group">
            <label><FaMapMarkerAlt /> From</label>
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
            <label><FaMapMarkerAlt /> To</label>
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
            {loading ? 'Searching...' : 'Search Flights'}
          </button>
        </form>
      </section>

      <section className="results-section">
        <div className="results-heading">
          <div>
            <span>AVAILABLE OPTIONS</span>
            <h2>Flights Available</h2>
          </div>
          <p>{flights.length} result{flights.length !== 1 ? 's' : ''} found</p>
        </div>

        {loading && (
          <div className="loading-state">Loading flights...</div>
        )}

        {!loading && flights.length === 0 && (
          <div className="empty-state">
            <FaPlane />
            <h3>No Flights Found</h3>
            <p>Try searching for another route or date.</p>
          </div>
        )}

        <div className="travel-results">
          {flights.map((flight) => (
            <article className="travel-result-card" key={flight.id}>

              <div className="result-main">
                <div className="transport-badge flight-badge">
                  <FaPlane />
                </div>

                <div className="result-details">
                  <span className="operator-name">{flight.airline}</span>
                  <h3>{flight.flightNumber}</h3>

                  <div className="route-line">
                    <strong>{flight.fromCity}</strong>
                    <span></span>
                    <strong>{flight.toCity}</strong>
                  </div>
                </div>
              </div>

              <div className="result-info">
                <div>
                  <FaClock />
                  <span>Departure</span>
                  <strong>{new Date(flight.departureTime).toLocaleString()}</strong>
                </div>

                <div>
                  <FaClock />
                  <span>Arrival</span>
                  <strong>{new Date(flight.arrivalTime).toLocaleString()}</strong>
                </div>

                <div>
                  <FaChair />
                  <span>{flight.flightClass}</span>
                  <strong>{flight.availableSeats} Seats</strong>
                </div>
              </div>

              <div className="result-price">
                <span>Starting from</span>
                <h2>₹{flight.price}</h2>

                <button onClick={() => setSelectedFlight(flight)}>
                  Book Now →
                </button>
              </div>

            </article>
          ))}
        </div>
      </section>

      {selectedFlight && (
        <BookingForm
          item={selectedFlight}
          type="FLIGHT"
          onClose={() => setSelectedFlight(null)}
        />
      )}
    </main>
  );
}

export default FlightSearch;
