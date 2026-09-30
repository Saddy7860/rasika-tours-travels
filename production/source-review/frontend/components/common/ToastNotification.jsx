import React, {
  useEffect,
  useState,
} from 'react';

import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimes,
} from 'react-icons/fa';

import './ToastNotification.css';

const icons = {
  success: <FaCheckCircle />,
  error: <FaExclamationCircle />,
  info: <FaInfoCircle />,
};

export default function ToastNotification({
  message,
  type = 'info',
  duration = 4000,
  onClose,
}) {
  const [visible, setVisible] =
    useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);

      setTimeout(() => {
        if (onClose) onClose();
      }, 250);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`toast-notification toast-${type}`}
      role="alert"
    >
      <div className="toast-icon">
        {icons[type]}
      </div>

      <div className="toast-message">
        {message}
      </div>

      <button
        className="toast-close"
        onClick={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
        aria-label="Close notification"
      >
        <FaTimes />
      </button>
    </div>
  );
}
