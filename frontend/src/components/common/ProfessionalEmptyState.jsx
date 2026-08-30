import React from 'react';
import './ProfessionalEmptyState.css';

export default function ProfessionalEmptyState({
  title = 'Nothing to display yet',
  description = 'There are currently no records available for this section.'
}) {
  return (
    <div className="professional-empty-state">
      <div className="empty-state-icon">✦</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
