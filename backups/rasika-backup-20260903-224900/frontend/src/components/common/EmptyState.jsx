import React from 'react';
import './EmptyState.css';

function EmptyState({
  icon = '📭',
  title = 'No Data Found',
  message = 'There is nothing to display right now.'
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;
