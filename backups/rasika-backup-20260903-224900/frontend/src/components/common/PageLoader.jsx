import React from 'react';
import './PageLoader.css';

export default function PageLoader({
  title = 'Loading',
  message = 'Please wait while we prepare your information.'
}) {
  return (
    <div className="professional-loader">
      <div className="professional-loader-card">
        <div className="loader-spinner" />
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </div>
  );
}
