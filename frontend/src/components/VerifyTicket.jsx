import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function VerifyTicket() {
  const { reference } = useParams();
  const navigate = useNavigate();

  const [searchReference, setSearchReference] = useState(reference || '');
  const [booking, setBooking] = useState(null);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const verifyTicket = async (ticketReference = searchReference) => {
    const cleanReference = String(ticketReference || '').trim();

    if (!cleanReference) {
      setError('Please enter a booking reference.');
      setBooking(null);
      setServiceDetails(null);
      setSearched(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setBooking(null);
      setServiceDetails(null);

      const response = await api.get(
        `/bookings/verify/${encodeURIComponent(cleanReference)}`
      );

      const bookingData = response.data;

      setBooking(bookingData);

      const bookingType = String(
        bookingData.bookingType || ''
      ).toUpperCase();

      let endpoint = '';

      if (bookingType === 'BUS') {
        endpoint = `/buses/${bookingData.serviceId}`;
      } else if (bookingType === 'TRAIN') {
        endpoint = `/trains/${bookingData.serviceId}`;
      } else if (bookingType === 'FLIGHT') {
        endpoint = `/flights/${bookingData.serviceId}`;
      }

      if (endpoint && bookingData.serviceId) {
        try {
          const serviceResponse = await api.get(endpoint);
          setServiceDetails(serviceResponse.data);
        } catch (serviceError) {
          console.error(
            'Unable to load service details:',
            serviceError
          );
        }
      }

      setSearched(true);
    } catch (err) {
      console.error(err);

      setBooking(null);
      setServiceDetails(null);
      setSearched(true);

      if (err.response?.status === 404) {
        setError(
          'Ticket not found. Please check the booking reference.'
        );
      } else {
        setError(
          err.userMessage ||
          'Unable to verify ticket. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reference) {
      verifyTicket(reference);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  const getPassengerDetails = (bookingData) => {
    if (!bookingData?.passengerDetails) return {};

    try {
      if (typeof bookingData.passengerDetails === 'string') {
        return JSON.parse(bookingData.passengerDetails);
      }

      return bookingData.passengerDetails;
    } catch (error) {
      console.error('Unable to parse passenger details:', error);
      return {};
    }
  };

  const getPassengerName = (bookingData) => {
    const passenger = getPassengerDetails(bookingData);

  return (
      passenger.name ||
      passenger.fullName ||
      passenger.passengerName ||
      bookingData?.passengerName ||
      'N/A'
    );
  };

  const cleanLocationName = (location) => {
    if (!location) return 'N/A';

    return String(location)
      .replace(/\s+Junction\s*$/i, '')
      .replace(/\s+Jn\.?\s*$/i, '')
      .trim();
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';

    try {
      return new Date(date).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return 'N/A';
    }
  };

  const getJourneyDuration = () => {
    if (
      !serviceDetails?.departureTime ||
      !serviceDetails?.arrivalTime
    ) {
      return 'N/A';
    }

    const departure = new Date(
      serviceDetails.departureTime
    );

    const arrival = new Date(
      serviceDetails.arrivalTime
    );

    const difference = arrival - departure;

    if (
      Number.isNaN(difference) ||
      difference < 0
    ) {
      return 'N/A';
    }

    const totalMinutes = Math.floor(
      difference / (1000 * 60)
    );

    const hours = Math.floor(
      totalMinutes / 60
    );

    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes}m`;
    }

    if (minutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
  };

  const getServiceIcon = () => {
    const type = String(
      booking?.bookingType || ''
    ).toUpperCase();

    if (type === 'BUS') return '🚌';
    if (type === 'TRAIN') return '🚆';
    if (type === 'FLIGHT') return '✈️';

    return '🎫';
  };

  const getServiceName = () => {
    if (!serviceDetails) return 'Travel Service';

    const type = String(
      booking?.bookingType || ''
    ).toUpperCase();

    if (type === 'BUS') {
      return serviceDetails.operator || 'Bus Service';
    }

    if (type === 'TRAIN') {
      return serviceDetails.trainName || 'Train Service';
    }

    if (type === 'FLIGHT') {
      return serviceDetails.airline || 'Flight Service';
    }

    return 'Travel Service';
  };


  const getPassengerEmail = () => {
    return (
      booking?.email ||
      booking?.user?.email ||
      booking?.passenger?.email ||
      'N/A'
    );
  };

  const getPassengerPhone = () => {
    return (
      booking?.phone ||
      booking?.user?.phone ||
      booking?.passenger?.phone ||
      'N/A'
    );
  };

  const printTicket = () => {
    window.print();
  };

  const isCancelled =
    String(booking?.bookingStatus || '').toUpperCase() ===
    'CANCELLED';


  return (
    <>
      <style>{`
  @media print {
    @page {
      size: A4 portrait;
      margin: 6mm;
    }

    html,
    body {
      width: 210mm !important;
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      font-size: 11px !important;
    }

    body * {
      visibility: hidden !important;
    }

    #verified-ticket,
    #verified-ticket * {
      visibility: visible !important;
    }

    #verified-ticket {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      background: white !important;
      transform: scale(0.90);
      transform-origin: top left;
      width: 111.11% !important;
    }

    .no-print {
      display: none !important;
    }

    #verified-ticket [style] {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    #verified-ticket h1,
    #verified-ticket h2,
    #verified-ticket h3 {
      margin-top: 10px !important;
      margin-bottom: 8px !important;
    }
  }
`}</style>

      <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0fdf4 100%)',
        padding: '40px 20px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}
    >
      <div
        style={{
          maxWidth: '850px',
          margin: '0 auto'
        }}
      >
        {/* HEADER */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              margin: '0 auto 15px',
              borderRadius: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              background:
                'linear-gradient(135deg, #667eea, #764ba2)',
              boxShadow:
                '0 12px 30px rgba(102,126,234,0.25)'
            }}
          >
            🎫
          </div>

          <h1
            style={{
              margin: 0,
              color: '#0f172a',
              fontSize: '32px'
            }}
          >
            Ticket Verification
          </h1>

          <p
            style={{
              marginTop: '8px',
              marginBottom: 0,
              color: '#64748b',
              fontSize: '15px'
            }}
          >
            Rasika Tours & Travels
          </p>
        </div>

        {/* SEARCH CARD */}
        <div
          style={{
            background: 'white',
            padding: '22px',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow:
              '0 10px 35px rgba(15,23,42,0.08)'
          }}
        >
          <div
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#475569',
              marginBottom: '10px'
            }}
          >
            BOOKING REFERENCE
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <input
              value={searchReference}
              onChange={(e) => {
                setSearchReference(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  verifyTicket();
                }
              }}
              placeholder="Enter booking reference"
              style={{
                flex: 1,
                minWidth: '220px',
                padding: '15px 16px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            <button
              onClick={() => verifyTicket()}
              disabled={loading}
              style={{
                padding: '15px 24px',
                border: 'none',
                borderRadius: '12px',
                background:
                  'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: 'white',
                fontWeight: '700',
                fontSize: '15px',
                cursor:
                  loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow:
                  '0 8px 18px rgba(79,70,229,0.25)'
              }}
            >
              {loading
                ? '⏳ Verifying...'
                : '🔍 Verify Ticket'}
            </button>
          </div>
        </div>

        {/* INVALID TICKET */}
        {error && (
          <div
            style={{
              marginTop: '25px',
              background: 'white',
              border: '1px solid #fecaca',
              borderRadius: '22px',
              overflow: 'hidden',
              boxShadow:
                '0 12px 35px rgba(220,38,38,0.10)'
            }}
          >
            <div
              style={{
                background:
                  'linear-gradient(135deg, #ef4444, #b91c1c)',
                color: 'white',
                padding: '30px',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  fontSize: '52px',
                  marginBottom: '10px'
                }}
              >
                ❌
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: '25px'
                }}
              >
                Invalid Ticket
              </h2>
            </div>

            <div
              style={{
                padding: '25px',
                textAlign: 'center'
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: '#991b1b',
                  fontSize: '16px'
                }}
              >
                {error}
              </p>

              <p
                style={{
                  marginTop: '12px',
                  marginBottom: 0,
                  color: '#64748b',
                  fontSize: '13px'
                }}
              >
                Please verify the booking reference and try again.
              </p>
            </div>
          </div>
        )}

        {/* VERIFIED / BOOKING RESULT */}
        {booking && (
          <div
            id="verified-ticket"
            style={{
              marginTop: '25px',
              background: 'white',
              borderRadius: '24px',
              overflow: 'hidden',
              border: isCancelled
                ? '1px solid #fecaca'
                : '1px solid #bbf7d0',
              boxShadow: isCancelled
                ? '0 15px 40px rgba(220,38,38,0.10)'
                : '0 15px 40px rgba(22,163,74,0.12)'
            }}
          >
            {/* STATUS HEADER */}
            <div
              style={{
                padding: '32px 25px',
                background: isCancelled
                  ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
                  : 'linear-gradient(135deg, #22c55e, #15803d)',
                color: 'white',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  margin: '0 auto 14px',
                  borderRadius: '50%',
                  background:
                    'rgba(255,255,255,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '38px',
                  border:
                    '1px solid rgba(255,255,255,0.30)'
                }}
              >
                {isCancelled ? '❌' : '✓'}
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: '28px'
                }}
              >
                {isCancelled
                  ? 'Ticket Cancelled'
                  : 'Ticket Verified'}
              </h2>

              <p
                style={{
                  marginTop: '8px',
                  marginBottom: 0,
                  opacity: 0.92
                }}
              >
                {isCancelled
                  ? 'This booking has been cancelled.'
                  : 'This ticket is valid and successfully verified.'}
              </p>
            </div>

            <div
              style={{
                padding: '28px'
              }}
            >
              {/* BOOKING REFERENCE */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '15px',
                  paddingBottom: '22px',
                  borderBottom:
                    '1px solid #e2e8f0'
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      letterSpacing: '1px',
                      color: '#64748b'
                    }}
                  >
                    BOOKING REFERENCE
                  </div>

                  <div
                    style={{
                      marginTop: '6px',
                      fontSize: '25px',
                      fontWeight: '800',
                      color: '#0f172a',
                      wordBreak: 'break-word'
                    }}
                  >
                    {booking.bookingReference}
                  </div>
                </div>

                <div
                  style={{
                    padding: '9px 15px',
                    borderRadius: '999px',
                    background: isCancelled
                      ? '#fee2e2'
                      : '#dcfce7',
                    color: isCancelled
                      ? '#b91c1c'
                      : '#15803d',
                    fontWeight: '800',
                    fontSize: '13px'
                  }}
                >
                  {String(
                    booking.bookingStatus || 'VERIFIED'
                  ).toUpperCase()}
                </div>
              </div>

              {/* BOOKING DETAILS */}
              <div
                style={{
                  marginTop: '28px'
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: '18px',
                    color: '#0f172a',
                    fontSize: '19px'
                  }}
                >
                  📋 Booking Details
                </h3>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '14px'
                  }}
                >
                  <DetailCard
                    label="TRAVEL TYPE"
                    value={`${getServiceIcon()} ${booking.bookingType || 'N/A'}`}
                  />

                  <DetailCard
                    label="PASSENGERS"
                    value={booking.numberOfPassengers || 'N/A'}
                  />

                  <DetailCard
                    label="PAYMENT STATUS"
                    value={booking.paymentStatus || 'N/A'}
                  />

                  <DetailCard
                    label="TOTAL AMOUNT"
                    value={
                      booking.totalAmount !== null &&
                      booking.totalAmount !== undefined
                        ? `₹${Number(booking.totalAmount).toLocaleString('en-IN')}`
                        : 'N/A'
                    }
                  />

                  <DetailCard
                    label="BOOKING DATE"
                    value={formatDate(booking.bookingDate)}
                  />
                </div>
              </div>

              {/* PASSENGER DETAILS */}
              <div
                style={{
                  marginTop: '28px'
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: '18px',
                    color: '#0f172a',
                    fontSize: '19px'
                  }}
                >
                  👤 Passenger Details
                </h3>

                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '18px',
                    padding: '20px',
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '18px'
                  }}
                >
                  <InfoItem
                    label="NAME"
                    value={getPassengerName(booking)}
                  />

                  <InfoItem
                    label="EMAIL"
                    value={getPassengerEmail()}
                  />

                  <InfoItem
                    label="PHONE"
                    value={getPassengerPhone()}
                  />
                </div>
              </div>

              {/* JOURNEY DETAILS */}
              {serviceDetails && (
                <div
                  style={{
                    marginTop: '28px'
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      marginBottom: '18px',
                      color: '#0f172a',
                      fontSize: '19px'
                    }}
                  >
                    🧳 Journey Details
                  </h3>

                  <div
                    style={{
                      background:
                        'linear-gradient(135deg, #f8fafc, #eef2ff)',
                      border:
                        '1px solid #e0e7ff',
                      borderRadius: '20px',
                      padding: '22px'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '21px',
                        fontWeight: '800',
                        color: '#312e81',
                        marginBottom: '20px'
                      }}
                    >
                      {getServiceIcon()} {getServiceName()}
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: '18px'
                      }}
                    >

                  {/* JOURNEY ROUTE */}

                  <div
                    style={{
                      gridColumn: '1 / -1',
                      textAlign: 'center',
                      padding: '4px 0 10px'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        letterSpacing: '1px',
                        color: '#64748b',
                        marginBottom: '6px'
                      }}
                    >
                      JOURNEY ROUTE
                    </div>

                    <div
                      style={{
                        fontSize: '22px',
                        fontWeight: '800',
                        color: '#0f172a',
                        wordBreak: 'break-word'
                      }}
                    >
                      {cleanLocationName(
                        serviceDetails.fromCity ||
                        serviceDetails.fromStation
                      )}{' '}
                      <span
                        style={{
                          color: '#4f46e5',
                          padding: '0 8px'
                        }}
                      >
                        →
                      </span>{' '}
                      {cleanLocationName(
                        serviceDetails.toCity ||
                        serviceDetails.toStation
                      )}
                    </div>
                  </div>


<InfoItem
                        label="DEPARTURE"
                        value={formatDate(
                          serviceDetails.departureTime
                        )}
                      />

                      <InfoItem
                        label="ARRIVAL"
                        value={formatDate(
                          serviceDetails.arrivalTime
                        )}
                      />

              <InfoItem
                label="JOURNEY DURATION"
                value={getJourneyDuration()}
              />

                      <InfoItem
                        label="SERVICE NUMBER"
                        value={
                          serviceDetails.busNumber ||
                          serviceDetails.trainNumber ||
                          serviceDetails.flightNumber ||
                          'N/A'
                        }
                      />

                      <InfoItem
                        label="CLASS / TYPE"
                        value={
                          serviceDetails.busType ||
                          serviceDetails.trainClass ||
                          serviceDetails.flightClass ||
                          serviceDetails.classType ||
                          'N/A'
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div
                className="no-print"
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  marginTop: '30px'
                }}
              >

                <button
                  onClick={printTicket}
                  style={{
                    padding: '15px',
                    border: 'none',
                    borderRadius: '12px',
                    background: '#4f46e5',
                    color: 'white',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  🖨️ Print Ticket
                </button>

                <button
                  onClick={() =>
                    verifyTicket(
                      booking.bookingReference
                    )
                  }
                  disabled={loading}
                  style={{
                    padding: '15px',
                    border: 'none',
                    borderRadius: '12px',
                    background: '#334155',
                    color: 'white',
                    fontWeight: '700',
                    cursor:
                      loading
                        ? 'not-allowed'
                        : 'pointer',
                    opacity:
                      loading ? 0.7 : 1
                  }}
                >
                  🔄 Refresh Verification
                </button>

                <button
                  onClick={() => navigate('/')}
                  style={{
                    padding: '15px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    background: 'white',
                    color: '#334155',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  🏠 Back to Home
                </button>
              </div>
            </div>
          </div>
        )}

        {searched && !booking && !error && (
          <div
            style={{
              marginTop: '25px',
              background: 'white',
              padding: '25px',
              borderRadius: '18px',
              textAlign: 'center',
              color: '#64748b'
            }}
          >
            No verification result found.
          </div>
        )}
      </div>
    </div>
    </>
  );
}

function DetailCard({ label, value }) {
  return (
    <div
      style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        padding: '17px',
        borderRadius: '14px'
      }}
    >
      <div
        style={{
          fontSize: '10px',
          fontWeight: '800',
          letterSpacing: '1px',
          color: '#64748b',
          marginBottom: '7px'
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: '15px',
          fontWeight: '700',
          color: '#1e293b',
          wordBreak: 'break-word'
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <div
        style={{
          fontSize: '10px',
          fontWeight: '800',
          letterSpacing: '1px',
          color: '#64748b',
          marginBottom: '6px'
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: '15px',
          fontWeight: '700',
          color: '#1e293b',
          wordBreak: 'break-word'
        }}
      >
        {value || 'N/A'}
      </div>
    </div>
  );
}

export default VerifyTicket;
