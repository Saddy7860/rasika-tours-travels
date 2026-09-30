#!/bin/bash

set -e

PROJECT="$HOME/Desktop/rasika-tours-travels"
STAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP="$HOME/Desktop/rasika-phase3-backup-$STAMP"

echo "=============================================="
echo "RASIKA TOURS & TRAVELS - PHASE 3 UPGRADE"
echo "=============================================="

echo ""
echo "[1/6] Creating safety backup..."

cp -R "$PROJECT" "$BACKUP"

echo "✓ Backup created: $BACKUP"

cd "$PROJECT/frontend"

echo ""
echo "[2/6] Creating Customer Dashboard..."

mkdir -p src/components/customer

cat > src/components/customer/CustomerDashboard.jsx <<'EOF'
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
      const user =
        JSON.parse(localStorage.getItem('user')) ||
        JSON.parse(localStorage.getItem('currentUser'));

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
EOF

cat > src/components/customer/CustomerDashboard.css <<'EOF'
.customer-dashboard {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 42px 0 70px;
}

.customer-hero {
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  gap: 40px;
  padding: 48px;
  border-radius: 28px;
  background: linear-gradient(135deg, #10233f, #1d4f7a);
  color: #ffffff;
  box-shadow: 0 24px 70px rgba(16, 35, 63, 0.2);
}

.customer-hero::after {
  content: "";
  position: absolute;
  width: 360px;
  height: 360px;
  border-radius: 50%;
  right: -120px;
  top: -180px;
  background: rgba(255,255,255,0.08);
}

.customer-hero > * {
  position: relative;
  z-index: 1;
}

.customer-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.5px;
  opacity: 0.82;
}

.customer-hero h1 {
  margin: 18px 0 12px;
  font-size: clamp(32px, 5vw, 52px);
}

.customer-hero h1 span {
  color: #8ed7ff;
}

.customer-hero p {
  max-width: 650px;
  margin: 0;
  color: rgba(255,255,255,0.8);
  line-height: 1.7;
  font-size: 16px;
}

.customer-hero-icon {
  width: 110px;
  height: 110px;
  display: grid;
  place-items: center;
  border-radius: 28px;
  font-size: 42px;
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(12px);
}

.customer-stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 28px 0;
}

.customer-stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  text-decoration: none;
  color: #172033;
  background: #ffffff;
  border: 1px solid #e7edf4;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(16, 35, 63, 0.06);
  transition: 0.25s ease;
}

.customer-stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 45px rgba(16, 35, 63, 0.12);
}

.customer-stat-icon {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 15px;
  font-size: 21px;
}

.customer-stat-icon.booking {
  color: #1976d2;
  background: #e8f2ff;
}

.customer-stat-icon.passport {
  color: #7b3fb2;
  background: #f1e8ff;
}

.customer-stat-icon.support {
  color: #d97706;
  background: #fff4dc;
}

.customer-stat-card span {
  display: block;
  margin-bottom: 5px;
  color: #758195;
  font-size: 13px;
}

.customer-stat-card strong {
  font-size: 16px;
}

.customer-arrow {
  margin-left: auto;
  color: #8b96a8;
}

.customer-action-section,
.customer-info-card {
  margin-top: 28px;
  padding: 30px;
  background: #ffffff;
  border: 1px solid #e7edf4;
  border-radius: 22px;
  box-shadow: 0 10px 30px rgba(16, 35, 63, 0.05);
}

.customer-section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.customer-section-heading span {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.4px;
  color: #1976d2;
}

.customer-section-heading h2 {
  margin: 7px 0 0;
  color: #172033;
}

.customer-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-top: 25px;
}

.customer-actions a {
  padding: 17px;
  text-align: center;
  text-decoration: none;
  font-weight: 700;
  color: #172033;
  background: #f5f8fc;
  border-radius: 14px;
  transition: 0.2s ease;
}

.customer-actions a:hover {
  color: #ffffff;
  background: #1976d2;
}

.customer-info-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 25px;
  background: linear-gradient(135deg, #f7fbff, #eef6ff);
}

.customer-info-card h3 {
  margin: 0 0 8px;
  color: #172033;
}

.customer-info-card p {
  margin: 0;
  color: #68758a;
  line-height: 1.6;
}

.customer-info-card a {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  white-space: nowrap;
  padding: 13px 18px;
  text-decoration: none;
  font-weight: 700;
  color: #ffffff;
  background: #1976d2;
  border-radius: 12px;
}

@media (max-width: 900px) {
  .customer-stat-grid,
  .customer-actions {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 650px) {
  .customer-dashboard {
    width: min(100% - 22px, 1180px);
    padding-top: 22px;
  }

  .customer-hero {
    padding: 30px;
  }

  .customer-hero-icon {
    display: none;
  }

  .customer-stat-grid,
  .customer-actions {
    grid-template-columns: 1fr;
  }

  .customer-info-card {
    align-items: flex-start;
    flex-direction: column;
  }
}
EOF

echo "✓ Customer Dashboard created"

echo ""
echo "[3/6] Creating professional notification center..."

mkdir -p src/components/common

cat > src/components/common/NotificationCenter.jsx <<'EOF'
import React, { useState } from 'react';
import {
  FaBell,
  FaCheck,
  FaCalendarCheck,
  FaPassport,
  FaHeadset
} from 'react-icons/fa';

import './NotificationCenter.css';

const NotificationCenter = ({ notifications = [] }) => {
  const [open, setOpen] = useState(false);

  const items = notifications.length
    ? notifications
    : [
        {
          id: 'welcome',
          type: 'booking',
          title: 'Travel dashboard ready',
          message: 'Manage your bookings and travel services from one place.',
          time: 'Just now'
        }
      ];

  const getIcon = (type) => {
    if (type === 'passport') return <FaPassport />;
    if (type === 'support') return <FaHeadset />;
    return <FaCalendarCheck />;
  };

  return (
    <div className="notification-center">
      <button
        className="notification-trigger"
        onClick={() => setOpen(!open)}
        aria-label="Open notifications"
      >
        <FaBell />
        {items.length > 0 && (
          <span className="notification-count">{items.length}</span>
        )}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-header">
            <div>
              <span>UPDATES</span>
              <h3>Notifications</h3>
            </div>

            <button onClick={() => setOpen(false)}>
              <FaCheck />
            </button>
          </div>

          <div className="notification-list">
            {items.map((item) => (
              <div className="notification-item" key={item.id}>
                <div className="notification-icon">
                  {getIcon(item.type)}
                </div>

                <div>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                  <small>{item.time}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
EOF

cat > src/components/common/NotificationCenter.css <<'EOF'
.notification-center {
  position: relative;
}

.notification-trigger {
  position: relative;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid #e5ebf2;
  border-radius: 12px;
  background: #ffffff;
  color: #1f2d3d;
  cursor: pointer;
}

.notification-count {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  padding: 0 4px;
  border-radius: 999px;
  background: #e53935;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
}

.notification-panel {
  position: absolute;
  right: 0;
  top: 52px;
  width: min(380px, 90vw);
  z-index: 1000;
  background: #ffffff;
  border: 1px solid #e5ebf2;
  border-radius: 18px;
  box-shadow: 0 24px 70px rgba(16,35,63,.18);
  overflow: hidden;
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #edf1f5;
}

.notification-header span {
  color: #1976d2;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.notification-header h3 {
  margin: 5px 0 0;
}

.notification-header button {
  border: 0;
  background: #eef6ff;
  color: #1976d2;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  cursor: pointer;
}

.notification-item {
  display: flex;
  gap: 14px;
  padding: 18px;
  border-bottom: 1px solid #f0f3f6;
}

.notification-icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 12px;
  color: #1976d2;
  background: #eaf4ff;
}

.notification-item strong {
  color: #172033;
}

.notification-item p {
  margin: 5px 0;
  color: #6c7788;
  font-size: 13px;
  line-height: 1.5;
}

.notification-item small {
  color: #9aa4b2;
}
EOF

echo "✓ Notification Center created"

echo ""
echo "[4/6] Adding Customer Dashboard route..."

python3 <<'PY'
from pathlib import Path

p = Path("src/App.js")
s = p.read_text()

if "CustomerDashboard" not in s:
    marker = "import MyPassportRequests from './components/MyPassportRequests';"
    replacement = marker + "\nimport CustomerDashboard from './components/customer/CustomerDashboard';"
    s = s.replace(marker, replacement)

route = '<Route path="/dashboard" element={<CustomerDashboard />} />'

if 'path="/dashboard"' not in s:
    marker = '<Route path="/my-bookings" element={<MyBookings />} />'
    s = s.replace(marker, route + "\n              " + marker)

p.write_text(s)

print("Customer dashboard route added safely")
PY

echo ""
echo "[5/6] Adding professional upgrade status..."

cd "$PROJECT"

cat > PHASE-3-UPGRADE-STATUS.md <<'EOF'
# Rasika Tours & Travels - Phase 3

## Added

- Customer Dashboard
- Professional quick actions
- Travel service navigation
- Notification Center component
- Responsive customer dashboard UI

## Existing modules preserved

- Authentication
- JWT
- Booking system
- Refund handling
- Admin dashboard
- Passport workflow
- Contact management
- Flight search
- Train search
- Bus search

## Recommended next backend-connected phase

1. Real customer booking summary API
2. Real notification persistence
3. Booking activity timeline
4. Payment transaction history
5. Admin activity logging
6. Email notification integration
EOF

echo ""
echo "[6/6] Building frontend..."

cd "$PROJECT/frontend"

npm run build

echo ""
echo "=============================================="
echo "PHASE 3 PROFESSIONAL UPGRADE COMPLETED"
echo "=============================================="
echo ""
echo "Backup:"
echo "$BACKUP"
echo ""
echo "Added:"
echo "✓ Customer Dashboard"
echo "✓ Notification Center"
echo "✓ Professional responsive UI"
echo "✓ Dashboard route"
echo ""
echo "Open:"
echo "http://localhost:3000/dashboard"
echo ""
