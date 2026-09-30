import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaCalendarCheck,
  FaPassport,
  FaPlaneDeparture,
  FaBell,
  FaArrowRight,
  FaClock
} from 'react-icons/fa';

import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const [userName, setUserName] = useState('Traveler');

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem('rasika_user') ||
        localStorage.getItem('user') ||
        localStorage.getItem('currentUser');

      const user = storedUser ? JSON.parse(storedUser) : null;

      if (user?.name) {
        setUserName(user.name.split(' ')[0]);
      }
    } catch (error) {
      console.warn('Unable to load customer profile');
    }
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

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
            Manage your travel bookings, passport requests and upcoming journeys
            from one convenient place.
          </p>
        </div>

        <div className="customer-hero-icon">
          <FaPlaneDeparture />
        </div>
      </section>

      <section className="customer-stat-grid">
        <Link to="/my-bookings" className="customer-stat-card">
          <div className="customer-stat-icon booking">
            <FaCalendarCheck />
          </div>

          <div>
            <span>Travel Bookings</span>
            <strong>Manage Bookings</strong>
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
            <span>Passport Services</span>
            <strong>Track Requests</strong>
          </div>

          <FaArrowRight className="customer-arrow" />
        </Link>

        <Link to="/contact" className="customer-stat-card">
          <div className="customer-stat-icon support">
            <FaBell />
          </div>

          <div>
            <span>Need Assistance?</span>
            <strong>Contact Support</strong>
          </div>

          <FaArrowRight className="customer-arrow" />
        </Link>
      </section>

      <section className="customer-action-section">
        <div className="customer-section-heading">
          <div>
            <span>QUICK ACTIONS</span>
            <h2>Plan your next journey</h2>
          </div>

          <FaClock />
        </div>

        <div className="customer-actions">
          <Link to="/flights">Search Flights</Link>
          <Link to="/trains">Search Trains</Link>
          <Link to="/buses">Search Buses</Link>
          <Link to="/passport">Apply for Passport</Link>
        </div>
      </section>

      <section className="customer-info-card">
        <div>
          <h3>Your travel experience, organized.</h3>

          <p>
            Rasika Tours & Travels keeps your bookings and service requests
            accessible whenever you need them.
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
