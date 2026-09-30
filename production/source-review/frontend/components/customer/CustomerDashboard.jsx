import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  FaCalendarCheck,
  FaPassport,
  FaPlaneDeparture,
  FaBell,
  FaArrowRight,

  FaSuitcase,
  FaSync
} from 'react-icons/fa';

import dashboardService from '../../services/dashboardService';
import api from '../../services/api';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const [userName, setUserName] = useState('Traveler');
  const [bookings, setBookings] = useState([]);
  const [passportRequests, setPassportRequests] = useState([]);

  const [serviceDetails, setServiceDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const user =
        JSON.parse(localStorage.getItem('rasika_user')) ||
        JSON.parse(localStorage.getItem('user')) ||
        JSON.parse(localStorage.getItem('currentUser'));

      if (user?.fullName) {
        setUserName(user.fullName.split(' ')[0]);
      } else if (user?.name) {
        setUserName(user.name.split(' ')[0]);
      }
    } catch (error) {
      console.warn('Unable to load customer profile');
    }
  }, []);

  const getServiceEndpoint = (booking) => {

    const type = String(booking?.bookingType || '').toUpperCase();

    if (type === 'FLIGHT') {
      return `/flights/${booking.serviceId}`;
    }

    if (type === 'TRAIN') {
      return `/trains/${booking.serviceId}`;
    }

    if (type === 'BUS') {
      return `/buses/${booking.serviceId}`;
    }

    return null;

  };

  const loadServiceDetails = useCallback(async (bookingList) => {

    const results = await Promise.all(

      bookingList.map(async (booking) => {

        try {

          const endpoint = getServiceEndpoint(booking);

          if (!endpoint || !booking?.serviceId) {
            return [booking.id, null];
          }

          const response = await api.get(endpoint);

          return [booking.id, response.data];

        } catch (error) {

          console.warn(
            `Unable to load service details for booking ${booking.id}`
          );

          return [booking.id, null];

        }

      })

    );

    setServiceDetails(Object.fromEntries(results));

  }, []);


  const getRoute = (booking) => {

    const service = serviceDetails[booking.id];

    if (!service) {
      return 'Route details unavailable';
    }

    const type = String(booking.bookingType || '').toUpperCase();

    if (type === 'TRAIN') {

      return `${service.fromStation || 'Unknown'} → ${service.toStation || 'Unknown'}`;

    }

    return `${service.fromCity || 'Unknown'} → ${service.toCity || 'Unknown'}`;

  };

  const getDepartureTime = (booking) => {

    const service = serviceDetails[booking.id];

    if (!service?.departureTime) {
      return 'Departure time unavailable';
    }

    return new Date(service.departureTime).toLocaleString('en-IN', {

      day: 'numeric',

      month: 'short',

      year: 'numeric',

      hour: 'numeric',

      minute: '2-digit'

    });

  };

  const loadDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      const [bookingsData, passportData] = await Promise.all([
        dashboardService.getMyBookings(),
        dashboardService.getMyPassportRequests()
      ]);

      const safeBookings =
        Array.isArray(bookingsData) ? bookingsData : [];

      setBookings(safeBookings);

      loadServiceDetails(safeBookings);
      setPassportRequests(
        Array.isArray(passportData) ? passportData : []
      );
    } catch (error) {
      console.error('Unable to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [loadServiceDetails]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';

    return 'Good evening';
  }, []);

  const activeBookings = bookings.filter(
    booking => {

      if (booking.bookingStatus === 'CANCELLED') {
        return false;
      }

      const service = serviceDetails[booking.id];

      if (!service?.departureTime) {
        return booking.bookingStatus !== 'CANCELLED';
      }

      return new Date(service.departureTime) >= new Date();

    }
  ).length;

  const activePassportRequests = passportRequests.filter(
    request =>
      request.status !== 'REJECTED' &&
      request.status !== 'COMPLETED'
  ).length;

  const recentBookings = [...bookings]
    .sort((a, b) =>
      new Date(b.bookingDate || 0) - new Date(a.bookingDate || 0)
    )
    .slice(0, 3);

  const upcomingBooking = [...bookings]
    .filter(
      booking => booking.bookingStatus !== 'CANCELLED'
    )
    .filter(
      booking => {
        const service = serviceDetails[booking.id];

        if (!service?.departureTime) {
          return false;
        }

        return new Date(service.departureTime) >= new Date();
      }
    )
    .sort(
      (a, b) => {
        const aService = serviceDetails[a.id];
        const bService = serviceDetails[b.id];

        return (
          new Date(aService.departureTime) -
          new Date(bService.departureTime)
        );
      }
    )[0];

  const formatDate = (date) => {
    if (!date) return 'Date not available';

    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="customer-dashboard">

      <section className="customer-hero">

        <div>
          <span className="customer-eyebrow">
            <FaPlaneDeparture />
            TRAVELER DASHBOARD
          </span>

          <h1>
            {greeting}, <span>{userName}</span>
          </h1>

          <p>
            Manage your travel bookings, passport requests and
            upcoming journeys from one convenient place.
          </p>
        </div>

        <div className="customer-hero-icon">
          <FaPlaneDeparture />
        </div>

      </section>

      <section className="customer-stat-grid">

        <Link
          to="/my-bookings"
          className="customer-stat-card"
        >
          <div className="customer-stat-icon booking">
            <FaCalendarCheck />
          </div>

          <div>
            <span>Total Bookings</span>

            <strong>
              {loading ? '...' : bookings.length}
            </strong>

            <small>View all travel bookings</small>
          </div>

          <FaArrowRight className="customer-arrow" />
        </Link>

        <Link
          to="/my-bookings"
          className="customer-stat-card"
        >
          <div className="customer-stat-icon booking">
            <FaSuitcase />
          </div>

          <div>
            <span>Active Bookings</span>

            <strong>
              {loading ? '...' : activeBookings}
            </strong>

            <small>Upcoming and active trips</small>
          </div>

          <FaArrowRight className="customer-arrow" />
        </Link>

        <Link
          to="/my-passport-requests"
          className="customer-stat-card"
        >
          <div className="customer-stat-icon passport">
            <FaPassport />
          </div>

          <div>
            <span>Passport Requests</span>

            <strong>
              {loading ? '...' : passportRequests.length}
            </strong>

            <small>
              {loading
                ? 'Loading...'
                : `${activePassportRequests} active request(s)`
              }
            </small>
          </div>

          <FaArrowRight className="customer-arrow" />
        </Link>

        <Link
          to="/contact"
          className="customer-stat-card"
        >
          <div className="customer-stat-icon support">
            <FaBell />
          </div>

          <div>
            <span>Need Assistance?</span>
            <strong>Contact Support</strong>
            <small>We are here to help</small>
          </div>

          <FaArrowRight className="customer-arrow" />
        </Link>

      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 6px 25px rgba(0,0,0,0.08)',
            border: '1px solid #eef0f4'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px'
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#667eea',
                  letterSpacing: '1px'
                }}
              >
                UPCOMING JOURNEY
              </span>
              <h2 style={{ margin: '6px 0 0' }}>
                {upcomingBooking
                  ? `${upcomingBooking.bookingType} Journey`
                  : 'No upcoming journey'}
              </h2>

              {upcomingBooking && (
                <>
                  <p
                    style={{
                      margin: '10px 0 4px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#333'
                    }}
                  >
                    {getRoute(upcomingBooking)}
                  </p>

                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      color: '#777'
                    }}
                  >
                    Departure: {getDepartureTime(upcomingBooking)}
                  </p>
                </>
              )}
            </div>

            <FaPlaneDeparture
              style={{
                fontSize: '34px',
                color: '#667eea'
              }}
            />
          </div>

          {upcomingBooking ? (
            <>
              <p style={{ color: '#666', marginBottom: '8px' }}>
                Booking Reference
              </p>

              <strong style={{ fontSize: '20px' }}>
                {upcomingBooking.bookingReference || 'N/A'}
              </strong>

              <div style={{ marginTop: '18px', color: '#555' }}>
                <div>
                  <strong>Status:</strong>{' '}
                  {upcomingBooking.bookingStatus}
                </div>

                <div style={{ marginTop: '8px' }}>
                  <strong>Booked:</strong>{' '}
                  {formatDate(upcomingBooking.bookingDate)}
                </div>

                <div style={{ marginTop: '8px' }}>
                  <strong>Passengers:</strong>{' '}
                  {upcomingBooking.numberOfPassengers || 1}
                </div>
              </div>

              <Link
                to="/my-bookings"
                style={{
                  display: 'inline-block',
                  marginTop: '20px',
                  color: '#667eea',
                  fontWeight: 'bold',
                  textDecoration: 'none'
                }}
              >
                View Booking <FaArrowRight />
              </Link>
            </>
          ) : (
            <>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                You don't have any active travel bookings yet.
                Start planning your next adventure!
              </p>

              <Link
                to="/flights"
                style={{
                  display: 'inline-block',
                  marginTop: '20px',
                  color: '#667eea',
                  fontWeight: 'bold',
                  textDecoration: 'none'
                }}
              >
                Explore Travel Options <FaArrowRight />
              </Link>
            </>
          )}
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 6px 25px rgba(0,0,0,0.08)',
            border: '1px solid #eef0f4'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#667eea',
                  letterSpacing: '1px'
                }}
              >
                RECENT BOOKINGS
              </span>
              <h2 style={{ margin: '6px 0 0' }}>
                Your latest trips
              </h2>
            </div>

            <FaSuitcase
              style={{
                fontSize: '28px',
                color: '#667eea'
              }}
            />
          </div>

          {loading ? (
            <p style={{ color: '#666' }}>
              Loading bookings...
            </p>
          ) : recentBookings.length === 0 ? (
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              No bookings yet. Your recent travel bookings will appear here.
            </p>
          ) : (
            <div>
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  style={{
                    padding: '14px 0',
                    borderBottom: '1px solid #eef0f4'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <strong>
                        {booking.bookingType || 'Travel Booking'}
                      </strong>

                      <div
                        style={{
                          fontSize: '13px',
                          color: '#777',
                          marginTop: '5px'
                        }}
                      >
                        {booking.bookingReference || 'Reference unavailable'}
                      </div>

                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#333',
                          marginTop: '8px'
                        }}
                      >
                        📍 {getRoute(booking)}
                      </div>

                      <div
                        style={{
                          fontSize: '12px',
                          color: '#777',
                          marginTop: '4px'
                        }}
                      >
                        🕒 {getDepartureTime(booking)}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '12px',
                          fontSize: '12px',
                          color: '#666',
                          marginTop: '8px'
                        }}
                      >
                        <span>
                          👥 {booking.numberOfPassengers || 0} Passenger(s)
                        </span>

                        <span>
                          💰 ₹{booking.totalAmount || 0}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color:
                          booking.bookingStatus === 'CANCELLED'
                            ? '#dc3545'
                            : '#198754'
                      }}
                    >
                      {booking.bookingStatus || 'PENDING'}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: '8px',
                      fontSize: '13px',
                      color: '#777'
                    }}
                  >
                    Booked {formatDate(booking.bookingDate)}
                  </div>
                </div>
              ))}

              <Link
                to="/my-bookings"
                style={{
                  display: 'inline-block',
                  marginTop: '18px',
                  color: '#667eea',
                  fontWeight: 'bold',
                  textDecoration: 'none'
                }}
              >
                View All Bookings <FaArrowRight />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="customer-action-section">

        <div className="customer-section-heading">

          <div>
            <span>QUICK ACTIONS</span>
            <h2>Plan your next journey</h2>
          </div>

          <button
            type="button"
            onClick={loadDashboardData}
            title="Refresh dashboard"
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '20px'
            }}
          >
            <FaSync />
          </button>

        </div>

        <div className="customer-actions">

          <Link to="/flights">
            Search Flights
          </Link>

          <Link to="/trains">
            Search Trains
          </Link>

          <Link to="/buses">
            Search Buses
          </Link>

          <Link to="/passport">
            Apply for Passport
          </Link>

        </div>

      </section>

      <section className="customer-info-card">

        <div>
          <h3>Your travel experience, organized.</h3>

          <p>
            Rasika Tours & Travels keeps your bookings and
            service requests accessible whenever you need them.
          </p>
        </div>

        <Link to="/my-bookings">
          View My Bookings <FaArrowRight />
        </Link>

      </section>

    </div>
  );
};

export default CustomerDashboard;
