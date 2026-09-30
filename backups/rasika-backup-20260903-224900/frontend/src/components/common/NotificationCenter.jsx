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
