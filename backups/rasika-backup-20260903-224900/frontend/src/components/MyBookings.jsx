import { QRCodeSVG } from 'qrcode.react';
import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [ticketBooking, setTicketBooking] = useState(null);

  const [serviceDetails, setServiceDetails] = useState({});
  const [cancelling, setCancelling] = useState(false);

  const loadServiceDetails = useCallback(async (booking) => {
    if (!booking) return;

    console.log('Loading service details for booking:', booking);

    const type = String(booking.bookingType || '').toUpperCase();

    const endpointMap = {
      FLIGHT: '/flights',
      TRAIN: '/trains',
      BUS: '/buses'
    };

    const endpoint = endpointMap[type];

    const serviceId =
      booking.serviceId ||
      booking.flightId ||
      booking.trainId ||
      booking.busId ||
      booking.service?.id;

    console.log('Service lookup:', {
      type,
      endpoint,
      serviceId
    });

    if (!endpoint || !serviceId) {
      console.error(
        'Unable to determine service endpoint or ID:',
        booking
      );
      return;
    }

    try {
      const response = await api.get(
        `${endpoint}/${serviceId}`
      );

      console.log(
        'SERVICE DETAILS RESPONSE:',
        response.data
      );

      setServiceDetails((previous) => ({
        ...previous,
        [booking.id]: response.data
      }));
    } catch (error) {
      console.error(
        'Unable to load service details:',
        error.response?.data || error.message
      );
    }
    }, []);

  const cleanLocationName = (location) => {
    if (!location) return 'Unknown';

    return String(location)
      .replace(/\s*\bJunction\b\s*/gi, ' ')
      .replace(/\s*\bJn\.?\b\s*/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };



  const getRoute = (booking) => {
    const service = serviceDetails[booking.id];

    if (!service) {
      return 'Loading route...';
    }

    const from =
      service.fromCity || service.fromStation || 'Unknown';

    const to =
      service.toCity || service.toStation || 'Unknown';

    return `${cleanLocationName(from)} → ${cleanLocationName(to)}`;
  };

  const getDepartureTime = (booking) => {

    const service = serviceDetails[booking.id];

    if (!service?.departureTime) {
      return 'Loading...';
    }

    return new Date(
      service.departureTime
    ).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

  };

  const getArrivalTime = (booking) => {

    const service = serviceDetails[booking.id];

    if (!service?.arrivalTime) {
      return 'Loading...';
    }

    return new Date(
      service.arrivalTime
    ).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

  };

  const getServiceName = (booking) => {

    const service = serviceDetails[booking.id];

    if (!service) {
      return 'Loading service details...';
    }

    switch (
      String(booking.bookingType).toUpperCase()
    ) {

      case 'FLIGHT':
        return `${service.airline || ''} ${service.flightNumber || ''}`.trim();

      case 'TRAIN':
        return `${service.trainName || ''} ${service.trainNumber || ''}`.trim();

      case 'BUS':
        return `${service.operator || ''} ${service.busNumber || ''}`.trim();

      default:
        return `${booking.bookingType} Service`;

    }

  };


  const printTicket = () => {
    window.print();
  };

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get('/bookings/my-bookings');

      console.log('MY BOOKINGS API RESPONSE:', response.data);

      const bookingList = Array.isArray(response.data) ? response.data : [];

      setBookings(bookingList);

      // Automatically load journey details after bookings are fetched
      await Promise.all(
        bookingList.map((booking) => loadServiceDetails(booking))
      );
    } catch (error) {
      console.error(error);
      alert(
        error.userMessage ||
        'Unable to load bookings. Please login again.'
      );
    } finally {
      setLoading(false);
    }
    }, [loadServiceDetails]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const confirmCancel = async () => {
    if (!selectedBooking) return;

    try {
      setCancelling(true);

      await api.put(
        `/bookings/${selectedBooking.id}/cancel`
      );

      setSelectedBooking(null);

      await loadBookings();

      alert('Booking cancelled successfully. Refund is being processed.');

    } catch (error) {

      console.error(error);

      alert(
        error.userMessage ||
        'Unable to cancel booking. Please try again.'
      );

    } finally {
      setCancelling(false);
    }
  };

  const getPassengerDetails = (booking) => {
    try {
      return JSON.parse(booking.passengerDetails || '{}');
    } catch {
      return {};
    }
  };

  const getServiceIcon = (type) => {
    switch (type) {
      case 'FLIGHT':
        return '✈️';
      case 'TRAIN':
        return '🚆';
      case 'BUS':
        return '🚌';
      default:
        return '🎫';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const getRefundStatus = (booking) => {

    if (booking.bookingStatus !== 'CANCELLED') {
      return null;
    }

    if (booking.paymentStatus === 'REFUNDED') {
      return 'REFUNDED';
    }

    return 'REFUND PENDING';
  };

  if (loading) {
    const Skeleton = ({ width = '100%', height = '16px', radius = '8px' }) => (
      <div
        style={{
          width,
          height,
          borderRadius: radius,
          background:
            'linear-gradient(90deg, #e2e8f0 25%, #f8fafc 50%, #e2e8f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'bookingSkeleton 1.4s ease-in-out infinite'
        }}
      />
    );

    return (
      <>
        <style>{`
          @keyframes bookingSkeleton {
            0% {
              background-position: 200% 0;
            }

            100% {
              background-position: -200% 0;
            }
          }
        `}</style>

        <div
          style={{
            maxWidth: '1200px',
            margin: '40px auto',
            padding: '20px'
          }}
        >
          <div style={{ marginBottom: '30px' }}>
            <Skeleton width="220px" height="36px" radius="10px" />

            <div style={{ marginTop: '12px' }}>
              <Skeleton width="360px" height="16px" />
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(330px, 1fr))',
              gap: '25px'
            }}
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                style={{
                  background: 'white',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  boxShadow:
                    '0 6px 25px rgba(0,0,0,0.06)'
                }}
              >
                <div
                  style={{
                    padding: '22px',
                    background: '#f1f5f9'
                  }}
                >
                  <Skeleton width="45px" height="28px" />

                  <div style={{ marginTop: '16px' }}>
                    <Skeleton width="130px" height="12px" />
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <Skeleton width="210px" height="24px" />
                  </div>
                </div>

                <div style={{ padding: '22px' }}>
                  <Skeleton width="90px" height="12px" />

                  <div style={{ marginTop: '8px' }}>
                    <Skeleton width="180px" height="18px" />
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <Skeleton width="230px" height="14px" />
                  </div>

                  <div
                    style={{
                      marginTop: '22px',
                      padding: '14px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <Skeleton width="100px" height="11px" />

                    <div style={{ marginTop: '10px' }}>
                      <Skeleton width="90%" height="18px" />
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '15px',
                        marginTop: '18px'
                      }}
                    >
                      <Skeleton width="100%" height="32px" />
                      <Skeleton width="100%" height="32px" />
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '15px',
                      marginTop: '20px'
                    }}
                  >
                    <Skeleton width="100%" height="45px" radius="10px" />
                    <Skeleton width="100%" height="45px" radius="10px" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '40px auto',
      padding: '20px'
    }}>

      <div style={{
        marginBottom: '30px'
      }}>
        <h1 style={{
          marginBottom: '8px'
        }}>
          My Bookings
        </h1>

        <p style={{
          color: '#666'
        }}>
          Manage your travel bookings and view ticket details.
        </p>
      </div>

      {bookings.length === 0 ? (

        <div style={{
          background: 'white',
          padding: '60px',
          textAlign: 'center',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>

          <div style={{
            fontSize: '60px'
          }}>
            🎫
          </div>

          <h2>No bookings yet</h2>

          <p style={{
            color: '#777'
          }}>
            Your upcoming trips will appear here.
          </p>

        </div>

      ) : (

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
          gap: '25px'
        }}>

          {bookings.map((booking) => {

            const passenger = getPassengerDetails(booking);

            const isCancelled =
              booking.bookingStatus === 'CANCELLED';

            const refundStatus =
              getRefundStatus(booking);

            return (

              <div
                key={booking.id}
                style={{
                  background: 'white',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  boxShadow: '0 6px 25px rgba(0,0,0,0.10)',
                  border: isCancelled
                    ? '1px solid #f5c2c7'
                    : '1px solid #e9ecef'
                }}
              >

                <div style={{
                  padding: '18px 22px',
                  background:
                    'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white'
                }}>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>

                    <span style={{
                      fontSize: '25px'
                    }}>
                      {getServiceIcon(booking.bookingType)}
                    </span>

                    <strong>
                      {booking.bookingType}
                    </strong>

                  </div>

                  <div style={{
                    marginTop: '10px',
                    fontSize: '14px',
                    opacity: 0.9
                  }}>
                    Booking Reference
                  </div>

                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}>
                    {booking.bookingReference}
                  </div>

                </div>

                <div style={{
                  padding: '22px'
                }}>

                  <div style={{
                    marginBottom: '18px'
                  }}>

                    <div style={{
                      fontSize: '13px',
                      color: '#777'
                    }}>
                      PASSENGER
                    </div>

                    <strong>
                      {passenger.name || 'N/A'}
                    </strong>

                    <div style={{
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      {passenger.email}
                    </div>

                  </div>

                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px',
                      marginBottom: '18px'
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
                      SERVICE
                    </div>

                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: '800',
                        color: '#312e81',
                        marginBottom: '14px',
                        wordBreak: 'break-word'
                      }}
                    >
                      {getServiceIcon(booking.bookingType)} {getServiceName(booking)}
                    </div>

                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        letterSpacing: '1px',
                        color: '#64748b',
                        marginBottom: '8px'
                      }}
                    >
                      JOURNEY ROUTE
                    </div>

                    <div
                      style={{
                        fontSize: '17px',
                        fontWeight: '800',
                        color: '#0f172a',
                        wordBreak: 'break-word'
                      }}
                    >
                      {getRoute(booking)}
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: '12px',
                        marginTop: '14px'
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            color: '#64748b'
                          }}
                        >
                          DEPARTURE
                        </div>

                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#334155',
                            marginTop: '4px'
                          }}
                        >
                          {getDepartureTime(booking)}
                        </div>
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            color: '#64748b'
                          }}
                        >
                          ARRIVAL
                        </div>

                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#334155',
                            marginTop: '4px'
                          }}
                        >
                          {getArrivalTime(booking)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px',
                    marginBottom: '20px'
                  }}>

                    <div>

                      <div style={{
                        fontSize: '12px',
                        color: '#777'
                      }}>
                        PASSENGERS
                      </div>

                      <strong>
                        {booking.numberOfPassengers}
                      </strong>

                    </div>

                    <div>

                      <div style={{
                        fontSize: '12px',
                        color: '#777'
                      }}>
                        TOTAL AMOUNT
                      </div>

                      <strong style={{
                        color: '#667eea',
                        fontSize: '18px'
                      }}>
                        ₹{Number(booking.totalAmount || 0).toLocaleString('en-IN')}
                      </strong>

                    </div>

                  </div>

                  <div style={{
                    fontSize: '13px',
                    color: '#777',
                    marginBottom: '18px'
                  }}>
                    Booked on {formatDate(booking.bookingDate)}
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginBottom: '20px'
                  }}>

                    <span style={{
                      padding: '7px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background:
                        isCancelled
                          ? '#f8d7da'
                          : '#d1e7dd',
                      color:
                        isCancelled
                          ? '#842029'
                          : '#0f5132'
                    }}>

                      {booking.bookingStatus}

                    </span>

                    <span style={{
                      padding: '7px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background:
                        booking.paymentStatus === 'COMPLETED'
                          ? '#cff4fc'
                          : '#fff3cd',
                      color:
                        booking.paymentStatus === 'COMPLETED'
                          ? '#055160'
                          : '#664d03'
                    }}>

                      Payment: {booking.paymentStatus}

                    </span>

                    {refundStatus && (

                      <span style={{
                        padding: '7px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background:
                          refundStatus === 'REFUNDED'
                            ? '#d1e7dd'
                            : '#fff3cd',
                        color:
                          refundStatus === 'REFUNDED'
                            ? '#0f5132'
                            : '#664d03'
                      }}>

                        {refundStatus}

                      </span>

                    )}

                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '10px'
                  }}>

                    <button
                      onClick={() => {
                      setTicketBooking(booking);
                      loadServiceDetails(booking);
                    }}
                      style={{
                        flex: 1,
                        padding: '11px',
                        borderRadius: '8px',
                        border: '1px solid #667eea',
                        background: 'white',
                        color: '#667eea',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      View Ticket
                    </button>

                    {!isCancelled && (

                      <button
                        onClick={() =>
                          setSelectedBooking(booking)
                        }
                        style={{
                          flex: 1,
                          padding: '11px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#dc3545',
                          color: 'white',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>

                    )}

                  </div>

                </div>

              </div>

            );

          })}

        </div>

      )}

      {selectedBooking && (

        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>

          <div style={{
            background: 'white',
            maxWidth: '450px',
            width: '100%',
            padding: '30px',
            borderRadius: '18px',
            textAlign: 'center'
          }}>

            <div style={{
              fontSize: '50px'
            }}>
              ⚠️
            </div>

            <h2>
              Cancel Booking?
            </h2>

            <p style={{
              color: '#666'
            }}>
              Are you sure you want to cancel booking
              <br />
              <strong>
                {selectedBooking.bookingReference}
              </strong>
              ?
            </p>

            <p style={{
              color: '#856404',
              background: '#fff3cd',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              Your seats will be released and your refund
              will be processed.
            </p>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '20px'
            }}>

              <button
                disabled={cancelling}
                onClick={() =>
                  setSelectedBooking(null)
                }
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Keep Booking
              </button>

              <button
                disabled={cancelling}
                onClick={confirmCancel}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc3545',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {cancelling
                  ? 'Cancelling...'
                  : 'Yes, Cancel'}
              </button>

            </div>

          </div>

        </div>

      )}

      {ticketBooking && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.72)',
          display: 'block',
          zIndex: 9999,
          padding: '20px',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          boxSizing: 'border-box'
        }}>

          <div style={{
            background: '#f8fafc',
            maxWidth: '760px',
            width: '100%',
            margin: '0 auto',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 25px 70px rgba(0,0,0,0.35)',
            boxSizing: 'border-box'
          }}>

            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '26px'
            }}>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '15px'
              }}>

                <div>

                  <div style={{
                    fontSize: '26px',
                    fontWeight: 'bold'
                  }}>
                    {getServiceIcon(ticketBooking.bookingType)}
                    {' '}
                    Rasika Tours & Travels
                  </div>

                  <div style={{
                    marginTop: '6px',
                    opacity: 0.9
                  }}>
                    DIGITAL BOARDING PASS
                  </div>

                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.18)',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontWeight: 'bold'
                }}>
                  {ticketBooking.bookingStatus}
                </div>

              </div>

            </div>

            <div style={{
              padding: '28px'
            }}>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '15px',
                paddingBottom: '22px',
                borderBottom: '2px dashed #cbd5e1'
              }}>

                <div>

                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    fontWeight: 'bold',
                    letterSpacing: '1px'
                  }}>
                    BOOKING REFERENCE
                  </div>

                  <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#312e81',
                    marginTop: '4px'
                  }}>
                    {ticketBooking.bookingReference}
                  </div>

                </div>

                <div style={{
                  textAlign: 'right'
                }}>

                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    fontWeight: 'bold'
                  }}>
                    TRAVEL TYPE
                  </div>

                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginTop: '4px'
                  }}>
                    {ticketBooking.bookingType}
                  </div>

                </div>

              </div>

              <div style={{
                marginTop: '24px',
                background: 'white',
                borderRadius: '18px',
                padding: '22px',
                border: '1px solid #e2e8f0'
              }}>

                <div style={{
                  fontSize: '12px',
                  color: '#64748b',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  marginBottom: '8px'
                }}>
                  SERVICE
                </div>

                <div style={{
                  fontSize: '21px',
                  fontWeight: 'bold',
                  color: '#1e293b'
                }}>
                  {getServiceName(ticketBooking)}
                </div>

                <div style={{
                  marginTop: '8px',
                  color: '#64748b',
                  fontSize: '15px'
                }}>
                  {getRoute(ticketBooking)}
                </div>

              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginTop: '18px'
              }}>

                <div style={{
                  background: '#eef2ff',
                  padding: '18px',
                  borderRadius: '16px'
                }}>

                  <div style={{
                    fontSize: '12px',
                    color: '#6366f1',
                    fontWeight: 'bold'
                  }}>
                    DEPARTURE
                  </div>

                  <div style={{
                    marginTop: '7px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    {getDepartureTime(ticketBooking)}
                  </div>

                </div>

                <div style={{
                  background: '#f0fdf4',
                  padding: '18px',
                  borderRadius: '16px'
                }}>

                  <div style={{
                    fontSize: '12px',
                    color: '#16a34a',
                    fontWeight: 'bold'
                  }}>
                    ARRIVAL
                  </div>

                  <div style={{
                    marginTop: '7px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    {getArrivalTime(ticketBooking)}
                  </div>

                </div>

              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginTop: '18px'
              }}>

                <div style={{
                  background: 'white',
                  padding: '18px',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0'
                }}>

                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    fontWeight: 'bold'
                  }}>
                    PASSENGER
                  </div>

                  <div style={{
                    marginTop: '6px',
                    fontWeight: 'bold',
                    fontSize: '17px'
                  }}>
                    {getPassengerDetails(ticketBooking).name || 'N/A'}
                  </div>

                  <div style={{
                    marginTop: '4px',
                    fontSize: '13px',
                    color: '#64748b'
                  }}>
                    {getPassengerDetails(ticketBooking).email}
                  </div>

                </div>

                <div style={{
                  background: 'white',
                  padding: '18px',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0'
                }}>

                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    fontWeight: 'bold'
                  }}>
                    PASSENGERS
                  </div>

                  <div style={{
                    marginTop: '6px',
                    fontWeight: 'bold',
                    fontSize: '24px'
                  }}>
                    {ticketBooking.numberOfPassengers}
                  </div>

                  <div style={{
                    marginTop: '4px',
                    fontSize: '13px',
                    color: '#64748b'
                  }}>
                    Phone: {getPassengerDetails(ticketBooking).phone || 'N/A'}
                  </div>

                </div>

              </div>

              {/* QR Ticket Verification */}
              <div style={{
                marginTop: '22px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '18px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '12px',
                  color: '#64748b',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  marginBottom: '12px'
                }}>
                  SCAN TO VERIFY TICKET
                </div>

                <div style={{
                  display: 'inline-block',
                  padding: '16px',
                  background: 'white',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0'
                }}>
                  <QRCodeSVG
                    value={`${window.location.origin}/verify/${ticketBooking.bookingReference}`}
                    size={180}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                <div style={{
                  marginTop: '14px',
                  fontSize: '13px',
                  color: '#64748b'
                }}>
                  Scan this QR code to verify the authenticity of this booking.
                </div>

                <div style={{
                  marginTop: '8px',
                  fontWeight: 'bold',
                  color: '#312e81'
                }}>
                  {ticketBooking.bookingReference}
                </div>
              </div>

              <div style={{
                marginTop: '18px',
                padding: '20px',
                background: '#312e81',
                color: 'white',
                borderRadius: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>

                <div>

                  <div style={{
                    fontSize: '12px',
                    opacity: 0.75
                  }}>
                    TOTAL PAID
                  </div>

                  <div style={{
                    fontSize: '26px',
                    fontWeight: 'bold'
                  }}>
                    ₹{ticketBooking.totalAmount}
                  </div>

                </div>

                <div style={{
                  textAlign: 'right'
                }}>

                  <div style={{
                    fontSize: '12px',
                    opacity: 0.75
                  }}>
                    BOOKED ON
                  </div>

                  <div style={{
                    fontWeight: 'bold',
                    marginTop: '4px'
                  }}>
                    {formatDate(ticketBooking.bookingDate)}
                  </div>

                </div>

              </div>

              {ticketBooking.bookingStatus === 'CANCELLED' && (

                <div style={{
                  marginTop: '18px',
                  background: '#fef2f2',
                  color: '#991b1b',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #fecaca'
                }}>

                  <strong>Booking Cancelled</strong>

                  <div style={{
                    marginTop: '5px'
                  }}>
                    Refund status: {getRefundStatus(ticketBooking)}
                  </div>

                </div>

              )}

                <button
                onClick={() =>
                  window.open(
                    `/verify/${encodeURIComponent(ticketBooking.bookingReference)}`,
                    '_blank'
                  )
                }
                style={{
                  width: '100%',
                  marginTop: '22px',
                  padding: '14px',
                  border: 'none',
                  borderRadius: '12px',
                  background: '#334155',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                🔍 Verify Ticket
              </button>

              <button
                onClick={printTicket}
                style={{
                  width: '100%',
                  marginTop: '22px',
                  padding: '14px',
                  border: 'none',
                  borderRadius: '12px',
                  background: '#198754',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                🖨️ Print / Save Ticket as PDF
              </button>

              <button
                onClick={() => setTicketBooking(null)}
                style={{
                  width: '100%',
                  marginTop: '22px',
                  padding: '14px',
                  border: 'none',
                  borderRadius: '12px',
                  background: '#667eea',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                Close Ticket
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default MyBookings;
