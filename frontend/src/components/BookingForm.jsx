/* RASIKA_SEAT_UI_UPGRADE */
import TransportSeatMap from "./TransportSeatMap";
import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import './BookingForm.css';

const todayDate = new Date().toISOString().split('T')[0];

const formatINR = (value) =>
  Number(value || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

function BookingForm({ item, type, onClose }) {
  const [formData, setFormData] = useState({
    numberOfPassengers: 1,
    journeyDate: todayDate,
    travelClass: '',
    passengerName: '',
    passengerEmail: '',
    passengerPhone: '',
    paymentMethod: 'UPI',
    paymentType: 'FULL'
  });

  const [seatMap, setSeatMap] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatLoading, setSeatLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const getName = () => {
    if (type === 'FLIGHT') return `${item.airline} - ${item.flightNumber}`;
    if (type === 'TRAIN') return `${item.trainName} (${item.trainNumber})`;
    if (type === 'BUS') return `${item.operator} (${item.busNumber})`;
    return 'Travel Service';
  };

  const getRoute = () =>
    type === 'TRAIN'
      ? `${item.fromStation} → ${item.toStation}`
      : `${item.fromCity} → ${item.toCity}`;

  const getServiceIcon = () => type === 'FLIGHT' ? '✈️' : type === 'TRAIN' ? '🚆' : type === 'BUS' ? '🚌' : '🎫';

  const getClassOptions = () => {
    if (type === 'FLIGHT') return [['Economy',1],['Premium Economy',1.35],['Business',2.5],['First',4]];
    if (type === 'TRAIN') return [['Sleeper',1],['General',0.65],['Chair Car',1.1],['AC 3 Tier',1.25],['AC 2 Tier',1.65],['First AC',2.2]];
    if (type === 'BUS') return [['AC Seater',1],['Seater',0.9],['Sleeper',1.2],['AC Sleeper',1.55],['Volvo',1.8]];
    return [['Standard',1]];
  };

  const selectedTravelClass = formData.travelClass || getClassOptions()[0][0];
  const selectedMultiplier = Number(getClassOptions().find(([name]) => name === selectedTravelClass)?.[1] || 1);
  const numberOfPassengers = Math.max(1, Number(formData.numberOfPassengers || 1));
  const totalAmount = Math.round(Number(item.price) * selectedMultiplier * numberOfPassengers * 100) / 100;
  const amountToPay = Math.round((formData.paymentType === 'HALF' ? totalAmount / 2 : totalAmount) * 100) / 100;
  const remainingAmount = Math.round((totalAmount - amountToPay) * 100) / 100;

  const availableSeats = useMemo(
    () => (seatMap?.seats || []).filter((seat) => seat.status === 'AVAILABLE'),
    [seatMap]
  );

  useEffect(() => {
    setSelectedSeats([]);
    setError('');
  }, [formData.journeyDate, formData.travelClass, numberOfPassengers, type, item.id]);

  useEffect(() => {
    let cancelled = false;
    const loadSeats = async () => {
      if (!item?.id || !formData.journeyDate) return;
      setSeatLoading(true);
      setError('');
      try {
        const response = await api.get('/bookings/seats', {
          params: {
            type,
            serviceId: item.id,
            journeyDate: formData.journeyDate,
            travelClass: selectedTravelClass
          }
        });
        if (!cancelled) setSeatMap(response.data);
      } catch (err) {
        if (!cancelled) {
          setSeatMap(null);
          setError(err.response?.data || err.message || 'Unable to load seat availability.');
        }
      } finally {
        if (!cancelled) setSeatLoading(false);
      }
    };
    loadSeats();
    return () => { cancelled = true; };
  }, [item?.id, type, formData.journeyDate, selectedTravelClass]);

  const toggleSeat = (seat) => {
    if (seat.status !== 'AVAILABLE') return;
    setError('');
    setSelectedSeats((current) => {
      if (current.includes(seat.seatNumber)) return current.filter((s) => s !== seat.seatNumber);
      if (current.length >= numberOfPassengers) {
        setError(`You can select exactly ${numberOfPassengers} seat${numberOfPassengers > 1 ? 's' : ''}.`);
        return current;
      }
      return [...current, seat.seatNumber];
    });
  };

  const autoSelectSeats = () => {
    const first = availableSeats.slice(0, numberOfPassengers).map((s) => s.seatNumber);
    if (first.length < numberOfPassengers) {
      setError('Not enough seats available for this journey date.');
      return;
    }
    setSelectedSeats(first);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedSeats.length !== numberOfPassengers) {
      setError(`Please select exactly ${numberOfPassengers} seat${numberOfPassengers > 1 ? 's' : ''} before continuing.`);
      return;
    }

    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const booking = {
        bookingType: type,
        serviceId: item.id,
        numberOfPassengers,
        journeyDate: formData.journeyDate,
        travelClass: selectedTravelClass,
        totalAmount,
        paymentStatus: formData.paymentType === 'FULL' ? 'COMPLETED' : 'PARTIAL',
        bookingStatus: 'CONFIRMED',
        passengerDetails: JSON.stringify({
          name: formData.passengerName,
          email: formData.passengerEmail,
          phone: formData.passengerPhone,
          paymentMethod: formData.paymentMethod,
          paymentType: formData.paymentType,
          travelClass: selectedTravelClass,
          selectedSeats,
          amountPaid: amountToPay,
          remainingAmount
        })
      };

      const response = await api.post('/bookings', booking);
      setBookingRef(response.data.bookingReference);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data || err.message || 'Booking failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="booking-overlay" onClick={onClose}>
        <div className="booking-modal success-modal" onClick={(e) => e.stopPropagation()}>
          <div className="booking-success">
            <div className="success-animation">✓</div>
            <div className="success-label">BOOKING CONFIRMED</div>
            <h2>Payment Successful!</h2>
            <p className="success-text">Your journey has been successfully booked.</p>
            <div className="success-reference-card">
              <span>BOOKING REFERENCE</span><strong>{bookingRef}</strong>
            </div>
            <div className="success-trip-card">
              <div className="success-trip-icon">{getServiceIcon()}</div>
              <div><h3>{getName()}</h3><p>{getRoute()}</p></div>
            </div>
            <div className="success-info-grid">
              <div><span>Journey Date</span><strong>{formData.journeyDate}</strong></div>
              <div><span>Passengers</span><strong>{numberOfPassengers}</strong></div>
              <div><span>Seats</span><strong>{selectedSeats.join(', ')}</strong></div>
              <div><span>Class</span><strong>{selectedTravelClass}</strong></div>
              <div><span>Paid</span><strong className="paid-success">{formatINR(amountToPay)}</strong></div>
              {formData.paymentType === 'HALF' && <div><span>Remaining</span><strong className="remaining-success">{formatINR(remainingAmount)}</strong></div>}
            </div>
            <div className="success-payment-note">💳 Paid using <strong>{formData.paymentMethod}</strong></div>
            <button className="success-done-btn" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} type="button">×</button>

        <div className="booking-header">
          <div className="booking-icon">{getServiceIcon()}</div>
          <div><span className="booking-eyebrow">COMPLETE YOUR BOOKING</span><h2>Passenger & Seat Selection</h2><p>Select your journey details and preferred seats.</p></div>
        </div>

        {error && <div className="booking-error">{String(error)}</div>}

        <div className="premium-booking-summary">
          <div className="summary-top">
            <div><span className="summary-label">YOUR JOURNEY</span><h3>{getName()}</h3><p>{getRoute()}</p></div>
            <div className="summary-icon">{getServiceIcon()}</div>
          </div>
          <div className="summary-divider" />
          <div className="summary-price-row"><span>{formatINR(item.price)} × {numberOfPassengers} passenger{numberOfPassengers > 1 ? 's' : ''}</span><strong>{formatINR(totalAmount)}</strong></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="booking-two-column">
            <div className="booking-travel-class">
              <label>Travel Class</label>
              <select name="travelClass" value={selectedTravelClass} onChange={handleChange}>
                {getClassOptions().map(([name, multiplier]) => <option key={name} value={name}>{name} — {formatINR(Number(item.price) * multiplier)} / passenger</option>)}
              </select>
              <small>Fare and seat availability are validated securely by the server.</small>
            </div>

            <div className="booking-form-group">
              <label>Journey Date</label>
              <input name="journeyDate" type="date" min={todayDate} value={formData.journeyDate} onChange={handleChange} required />
            </div>
          </div>

          <div className="booking-section-title"><span>💺</span><div><h3>Select Your Seats</h3><p>{seatMap ? `${seatMap.availableCount} available • ${seatMap.occupiedCount} occupied • ${seatMap.blockedCount} blocked` : 'Loading live availability...'}</p></div></div>

          <div className="seat-selection-panel">
            <div className="seat-toolbar">
              <div className="seat-selection-count"><strong>{selectedSeats.length}</strong> / {numberOfPassengers} selected</div>
              <button type="button" className="auto-seat-btn" onClick={autoSelectSeats} disabled={seatLoading || availableSeats.length < numberOfPassengers}>Auto-select seats</button>
            </div>

            <div className="seat-legend">
              <span><i className="seat-dot available" /> Available</span>
              <span><i className="seat-dot selected" /> Selected</span>
              <span><i className="seat-dot occupied" /> Occupied</span>
              <span><i className="seat-dot blocked" /> Blocked</span>
            </div>

            {seatLoading ? <div className="seat-loading">Loading live seat map…</div> :
              !seatMap || !seatMap.seats?.length ? <div className="seat-loading">No seat configuration is available for this service.</div> :
              <TransportSeatMap
                type={type}
                seats={seatMap.seats}
                selectedSeats={selectedSeats}
                onSeatClick={toggleSeat}
              />
            }
          </div>

          <div className="booking-section-title"><span>👤</span><div><h3>Passenger Information</h3><p>Details of the primary traveller</p></div></div>
          <div className="passenger-form-grid">
            <div className="booking-form-group full-width"><label>Full Name</label><input name="passengerName" placeholder="Enter passenger name" value={formData.passengerName} onChange={handleChange} required /></div>
            <div className="booking-form-group"><label>Email Address</label><input type="email" name="passengerEmail" placeholder="example@email.com" value={formData.passengerEmail} onChange={handleChange} required /></div>
            <div className="booking-form-group"><label>Phone Number</label><input type="tel" name="passengerPhone" placeholder="Enter phone number" value={formData.passengerPhone} onChange={handleChange} required /></div>
          </div>

          <div className="booking-form-group"><label>Number of Passengers</label><input type="number" name="numberOfPassengers" min="1" max="50" value={formData.numberOfPassengers} onChange={handleChange} required /></div>

          <div className="booking-section-title"><span>💰</span><div><h3>Choose Payment Option</h3><p>Select how much you want to pay now</p></div></div>
          <div className="payment-type-grid">
            <button type="button" className={`payment-type-card ${formData.paymentType === 'HALF' ? 'selected' : ''}`} onClick={() => setFormData({...formData,paymentType:'HALF'})}><span className="payment-type-icon">💵</span><strong>Pay 50%</strong><small>{formatINR(amountToPay)} now</small><p>Remaining amount can be paid later</p></button>
            <button type="button" className={`payment-type-card ${formData.paymentType === 'FULL' ? 'selected' : ''}`} onClick={() => setFormData({...formData,paymentType:'FULL'})}><span className="payment-type-icon">💳</span><strong>Pay Full Amount</strong><small>{formatINR(totalAmount)}</small><p>Complete payment now</p></button>
          </div>

          <div className="booking-section-title payment-method-title"><span>🏦</span><div><h3>Payment Method</h3><p>Choose your preferred method</p></div></div>
          <div className="payment-method-grid">
            {[['UPI','📱','UPI'],['CARD','💳','Card'],['NET_BANKING','🏦','Net Banking']].map(([value,icon,label]) =>
              <button type="button" key={value} className={`payment-method-card ${formData.paymentMethod === value ? 'selected' : ''}`} onClick={() => setFormData({...formData,paymentMethod:value})}><span>{icon}</span><strong>{label}</strong></button>
            )}
          </div>

          <div className="final-payment-summary">
            <div><span>Total Booking Amount</span><strong>{formatINR(totalAmount)}</strong></div>
            {formData.paymentType === 'HALF' && <div><span>Remaining Amount</span><strong className="remaining-amount">{formatINR(remainingAmount)}</strong></div>}
            <div className="pay-now-row"><span>Pay Now</span><strong>{formatINR(amountToPay)}</strong></div>
          </div>

          <button type="submit" className="confirm-btn" disabled={processing || seatLoading}>{processing ? 'Confirming Booking...' : `Pay ${formatINR(amountToPay)} Securely`}</button>
          <p className="secure-payment-text">🔒 Your payment information is secure and protected.</p>
        </form>
      </div>
    </div>
  );
}

export default BookingForm;
