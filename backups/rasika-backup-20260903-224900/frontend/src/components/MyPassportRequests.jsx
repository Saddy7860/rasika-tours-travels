import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './MyPassportRequests.css';

function MyPassportRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/passport/my-requests');
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Unable to load passport requests:', err);

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Unable to load passport requests.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const formatStatus = (status) =>
    String(status || 'PENDING')
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const getStatusClass = (status) =>
    String(status || 'PENDING')
      .toLowerCase()
      .replaceAll('_', '-');

  const getStatusStep = (status) => {
    const normalized = String(status || 'PENDING').toUpperCase();

    const steps = {
      PENDING: 1,
      UNDER_REVIEW: 2,
      APPROVED: 3,
      COMPLETED: 4
    };

    return steps[normalized] || 1;
  };

  const formatDate = (date) => {
    if (!date) return 'Not available';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const pendingCount = requests.filter(
    (request) => String(request.status || 'PENDING').toUpperCase() === 'PENDING'
  ).length;

  const completedCount = requests.filter(
    (request) => String(request.status || '').toUpperCase() === 'COMPLETED'
  ).length;

  return (
    <div className="passport-requests-page">
      <div className="passport-requests-container">

        <div className="passport-page-header">
          <div className="passport-header-content">
            <div className="passport-header-icon">🛂</div>

            <div>
              <h1>My Passport Requests</h1>
              <p>
                Track your passport applications and stay updated with
                the latest status.
              </p>
            </div>
          </div>

          <button
            className="passport-refresh-btn"
            onClick={loadRequests}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '↻ Refresh'}
          </button>
        </div>

        {error && (
          <div className="passport-error">
            {String(error)}
          </div>
        )}

        {!loading && requests.length > 0 && (
          <div className="passport-summary">

            <div className="passport-summary-card">
              <span>Total Requests</span>
              <strong>{requests.length}</strong>
            </div>

            <div className="passport-summary-card">
              <span>Pending Requests</span>
              <strong>{pendingCount}</strong>
            </div>

            <div className="passport-summary-card">
              <span>Completed Requests</span>
              <strong>{completedCount}</strong>
            </div>

          </div>
        )}

        {loading ? (
          <div className="passport-state">
            <div className="passport-state-icon">⌛</div>
            <h2>Loading requests...</h2>
            <p>Please wait while we retrieve your passport requests.</p>
          </div>

        ) : requests.length === 0 ? (

          <div className="passport-state">
            <div className="passport-state-icon">🛂</div>
            <h2>No Passport Requests Found</h2>
            <p>
              Your passport service requests will appear here once you
              submit an application.
            </p>
          </div>

        ) : (

          <div className="passport-request-list">

            {requests.map((request) => (
              <div
                className="passport-request-card"
                key={request.id}
              >

                <div className="passport-card-top">

                  <div className="passport-card-title">

                    <div className="passport-service-icon">
                      🛂
                    </div>

                    <div>
                      <h2>
                        {request.serviceType === 'RENEWAL'
                          ? 'Passport Renewal'
                          : 'New Passport Application'}
                      </h2>

                      <p className="passport-request-id">
                        Request ID: #{request.id}
                      </p>
                    </div>

                  </div>

                  <span
                    className={`passport-status ${getStatusClass(
                      request.status
                    )}`}
                  >
                    {formatStatus(request.status)}
                  </span>

                </div>

                {String(request.status || 'PENDING').toUpperCase() === 'REJECTED' ? (
                  <div className="passport-rejected-tracker">
                    <span className="rejected-icon">✕</span>
                    <div>
                      <strong>Passport Request Rejected</strong>
                      <p>Please check the admin remarks for more information.</p>
                    </div>
                  </div>
                ) : (
                  <div className="passport-progress-section">
                    <div className="passport-progress-header">
                      <strong>Application Progress</strong>
                      <span>Step {getStatusStep(request.status)} of 4</span>
                    </div>

                    <div className="passport-progress">

                      {[
                        ['PENDING', 'Submitted'],
                        ['UNDER_REVIEW', 'Under Review'],
                        ['APPROVED', 'Approved'],
                        ['COMPLETED', 'Completed']
                      ].map(([status, label], index) => {
                        const currentStep = getStatusStep(request.status);
                        const stepNumber = index + 1;

                        return (
                          <div
                            className={`passport-progress-step ${
                              stepNumber <= currentStep ? 'active' : ''
                            }`}
                            key={status}
                          >
                            <div className="progress-circle">
                              {stepNumber < currentStep ? '✓' : stepNumber}
                            </div>

                            <span>{label}</span>
                          </div>
                        );
                      })}

                    </div>
                  </div>
                )}

                <div className="passport-details-grid">

                  <div className="passport-detail">
                    <span>Applicant Name</span>
                    <strong>
                      {request.fullName || 'Not available'}
                    </strong>
                  </div>

                  <div className="passport-detail">
                    <span>Email Address</span>
                    <strong>
                      {request.email || 'Not available'}
                    </strong>
                  </div>

                  <div className="passport-detail">
                    <span>Phone Number</span>
                    <strong>
                      {request.phone || 'Not available'}
                    </strong>
                  </div>

                  <div className="passport-detail">
                    <span>Request Date</span>
                    <strong>
                      {formatDate(request.requestDate)}
                    </strong>
                  </div>

                  {request.dateOfBirth && (
                    <div className="passport-detail">
                      <span>Date of Birth</span>
                      <strong>
                        {request.dateOfBirth}
                      </strong>
                    </div>
                  )}

                  {request.gender && (
                    <div className="passport-detail">
                      <span>Gender</span>
                      <strong>
                        {request.gender}
                      </strong>
                    </div>
                  )}

                  {request.existingPassportNumber && (
                    <div className="passport-detail">
                      <span>Existing Passport</span>
                      <strong>
                        {request.existingPassportNumber}
                      </strong>
                    </div>
                  )}

                  {request.completionDate && (
                    <div className="passport-detail">
                      <span>Completion Date</span>
                      <strong>
                        {formatDate(request.completionDate)}
                      </strong>
                    </div>
                  )}

                </div>

                {request.remarks && (
                  <div className="passport-remarks">
                    <strong>Admin Remarks</strong>
                    <p>{request.remarks}</p>
                  </div>
                )}

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default MyPassportRequests;
