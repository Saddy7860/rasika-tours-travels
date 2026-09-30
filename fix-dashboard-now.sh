#!/bin/bash

set -e

PROJECT="$HOME/Desktop/rasika-tours-travels"
BACKUP="$HOME/Desktop/rasika-dashboard-fix-backup-$(date +%Y%m%d-%H%M%S)"

echo "=========================================="
echo "RASIKA DASHBOARD & DATA FIX"
echo "=========================================="

cd "$PROJECT"

echo "[1/6] Creating backup..."
cp -R "$PROJECT" "$BACKUP"
echo "Backup: $BACKUP"

echo "[2/6] Checking CustomerDashboard..."

mkdir -p frontend/src/components/customer

if [ ! -f frontend/src/components/customer/CustomerDashboard.jsx ]; then

cat > frontend/src/components/customer/CustomerDashboard.jsx <<'EOF'
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function CustomerDashboard() {
  const { user, isLoggedIn } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await api.get('/bookings/my-bookings');

        setBookings(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Dashboard booking error:', err);

        setError(
          err.response?.data?.message ||
          err.response?.data ||
          'Unable to load your booking data.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [isLoggedIn]);

  const totalBookings = bookings.length;

  const confirmedBookings = bookings.filter(
    booking => booking.bookingStatus === 'CONFIRMED'
  ).length;

  const pendingBookings = bookings.filter(
    booking => booking.bookingStatus === 'PENDING'
  ).length;

  const cancelledBookings = bookings.filter(
    booking => booking.bookingStatus === 'CANCELLED'
  ).length;

  if (!isLoggedIn) {
    return (
      <div style={{
        maxWidth: '1100px',
        margin: '40px auto',
        padding: '30px'
      }}>
        <h1>Welcome to Rasika Tours & Travels 👋</h1>

        <p>Please login to access your dashboard.</p>

        <Link
          to="/login"
          style={{
            display: 'inline-block',
            padding: '12px 22px',
            background: '#2563eb',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '10px'
          }}
        >
          Login Now
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '40px auto',
      padding: '20px'
    }}>

      <div style={{
        padding: '35px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
        color: 'white',
        marginBottom: '30px'
      }}>
        <h1 style={{ margin: 0 }}>
          Welcome back, {user?.name || user?.email || 'Traveller'} 👋
        </h1>

        <p style={{ marginTop: '12px', marginBottom: 0 }}>
          Manage your trips, bookings and travel requests from one place.
        </p>
      </div>

      {loading ? (
        <div style={{
          padding: '50px',
          textAlign: 'center'
        }}>
          <h3>Loading your dashboard...</h3>
        </div>
      ) : (
        <>
          {error && (
            <div style={{
              padding: '15px',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '35px'
          }}>

            <StatCard
              title="Total Bookings"
              value={totalBookings}
              icon="🎫"
            />

            <StatCard
              title="Confirmed"
              value={confirmedBookings}
              icon="✅"
            />

            <StatCard
              title="Pending"
              value={pendingBookings}
              icon="⏳"
            />

            <StatCard
              title="Cancelled"
              value={cancelledBookings}
              icon="❌"
            />

          </div>

          <h2>Your Quick Actions</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '20px'
          }}>

            <ActionCard
              to="/my-bookings"
              title="My Bookings"
              description="View and manage your bookings"
              icon="🎫"
            />

            <ActionCard
              to="/flights"
              title="Book Flight"
              description="Search available flights"
              icon="✈️"
            />

            <ActionCard
              to="/trains"
              title="Book Train"
              description="Search train journeys"
              icon="🚆"
            />

            <ActionCard
              to="/buses"
              title="Book Bus"
              description="Find bus services"
              icon="🚌"
            />

            <ActionCard
              to="/passport"
              title="Passport Services"
              description="Apply for passport assistance"
              icon="🛂"
            />

            <ActionCard
              to="/my-passport-requests"
              title="My Passport Requests"
              description="Track passport requests"
              icon="📄"
            />

          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div style={{
      background: 'white',
      padding: '25px',
      borderRadius: '16px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
    }}>
      <div style={{ fontSize: '32px' }}>
        {icon}
      </div>

      <h3 style={{ margin: '12px 0 5px' }}>
        {value}
      </h3>

      <p style={{
        margin: 0,
        color: '#666'
      }}>
        {title}
      </p>
    </div>
  );
}

function ActionCard({
  to,
  title,
  description,
  icon
}) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: 'none',
        color: 'inherit'
      }}
    >
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '16px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        height: '100%'
      }}>
        <div style={{
          fontSize: '36px'
        }}>
          {icon}
        </div>

        <h3>{title}</h3>

        <p style={{
          color: '#666'
        }}>
          {description}
        </p>
      </div>
    </Link>
  );
}

export default CustomerDashboard;
EOF

echo "✓ CustomerDashboard created"

else
  echo "✓ CustomerDashboard already exists"
fi

echo "[3/6] Checking API URL..."

grep -n "baseURL" frontend/src/services/api.js

echo "[4/6] Checking backend..."

echo "Backend must run on port 8080."
echo ""

echo "[5/6] Building frontend..."

cd "$PROJECT/frontend"

npm run build

echo ""

echo "[6/6] Completed"

echo "=========================================="
echo "FIX COMPLETED"
echo "=========================================="

echo ""
echo "Backup:"
echo "$BACKUP"

echo ""
echo "Next:"
echo "Terminal 1: start backend"
echo "Terminal 2: npm start"
echo ""
echo "Dashboard:"
echo "http://localhost:3000/dashboard"
echo ""
echo "Bookings:"
echo "http://localhost:3000/my-bookings"

