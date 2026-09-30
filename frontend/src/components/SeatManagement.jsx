import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import adminService from '../services/adminService';
import './SeatManagement.css';

const today = new Date().toISOString().split('T')[0];

function SeatManagement() {
  const [type, setType] = useState('BUS');
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState('');
  const [journeyDate, setJourneyDate] = useState(today);
  const [config, setConfig] = useState(null);
  const [seatMap, setSeatMap] = useState(null);
  const [capacity, setCapacity] = useState('');
  const [layout, setLayout] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const serviceName = (item) => {
    if (type === 'BUS') {
      return `${item.busNumber || ''} • ${item.operator || ''} • ${item.fromCity || ''} → ${item.toCity || ''}`;
    }

    if (type === 'TRAIN') {
      return `${item.trainNumber || ''} • ${item.trainName || ''} • ${item.fromStation || ''} → ${item.toStation || ''}`;
    }

    return `${item.flightNumber || ''} • ${item.airline || ''} • ${item.fromCity || ''} → ${item.toCity || ''}`;
  };

  const loadServices = async () => {
    setError('');

    try {
      const data =
        type === 'BUS'
          ? await adminService.getAllBuses()
          : type === 'TRAIN'
            ? await adminService.getAllTrains()
            : await adminService.getAllFlights();

      const list = Array.isArray(data) ? data : [];

      setServices(list);

      setServiceId((current) =>
        list.some((item) => String(item.id) === String(current))
          ? current
          : list[0]?.id
            ? String(list[0].id)
            : ''
      );
    } catch (err) {
      setServices([]);
      setError(
        err.response?.data ||
        err.message ||
        'Unable to load services.'
      );
    }
  };

  const loadSeatData = async () => {
    if (!serviceId || !journeyDate) return;

    setLoading(true);
    setError('');

    try {
      const [cfg, map] = await Promise.all([
        adminService.getSeatConfig(type, serviceId),
        api.get('/bookings/seats', {
          params: {
            type,
            serviceId,
            journeyDate
          }
        }).then((res) => res.data)
      ]);

      setConfig(cfg);
      setCapacity(cfg.seatCapacity);
      setLayout(cfg.layout);
      setSeatMap(map);
    } catch (err) {
      setError(
        err.response?.data ||
        err.message ||
        'Unable to load seat map.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [type]);

  useEffect(() => {
    loadSeatData();

    const handleSeatDataChanged = (event) => {
      const detail = event?.detail || {};
      if (
        String(detail.type || "").toUpperCase() === String(type || "").toUpperCase() &&
        String(detail.serviceId || "") === String(serviceId || "") &&
        String(detail.journeyDate || "") === String(journeyDate || "")
      ) {
        loadSeatData();
      }
    };

    window.addEventListener("rasika:seat-data-changed", handleSeatDataChanged);
    return () => {
      window.removeEventListener("rasika:seat-data-changed", handleSeatDataChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, journeyDate, type]);

  const saveConfig = async () => {
    if (!serviceId) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await adminService.saveSeatConfig({
        bookingType: type,
        serviceId: Number(serviceId),
        seatCapacity: Number(capacity),
        layout
      });

      setMessage(
        'Seat configuration saved successfully.'
      );

      await loadSeatData();
    } catch (err) {
      setError(
        err.response?.data ||
        err.message ||
        'Unable to save seat configuration.'
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleBlocked = async (seat) => {
    if (seat.status === 'OCCUPIED') return;

    setError('');
    setMessage('');

    try {
      await adminService.blockSeat({
        bookingType: type,
        serviceId: Number(serviceId),
        seatNumber: seat.seatNumber,
        blocked: seat.status !== 'BLOCKED'
      });

      await loadSeatData();
    } catch (err) {
      setError(
        err.response?.data ||
        err.message ||
        'Unable to update seat.'
      );
    }
  };

  const selectedService = useMemo(
    () =>
      services.find(
        (item) =>
          String(item.id) === String(serviceId)
      ),
    [services, serviceId]
  );

  return (
    <section className="seat-admin-page">

      <div className="seat-admin-hero">
        <div>
          <span>INVENTORY CONTROL</span>
          <h2>Seat Management</h2>
          <p>
            Configure capacity and control live seat inventory
            for every service.
          </p>
        </div>

        <div className="seat-admin-hero-icon">
          💺
        </div>
      </div>

      {message && (
        <div className="seat-admin-alert success">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="seat-admin-alert error">
          ⚠ {String(error)}
        </div>
      )}

      <div className="seat-admin-controls">

        <div className="seat-type-tabs">
          {['BUS', 'TRAIN', 'FLIGHT'].map((value) => (
            <button
              key={value}
              className={
                type === value ? 'active' : ''
              }
              onClick={() => setType(value)}
            >
              {value === 'BUS'
                ? '🚌 Bus'
                : value === 'TRAIN'
                  ? '🚆 Train'
                  : '✈️ Flight'}
            </button>
          ))}
        </div>

        <div className="seat-admin-form-grid">

          <label>
            <span>Service</span>
            <select
              value={serviceId}
              onChange={(e) =>
                setServiceId(e.target.value)
              }
            >
              <option value="">
                Select service
              </option>

              {services.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {serviceName(item)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Journey Date</span>
            <input
              type="date"
              min={today}
              value={journeyDate}
              onChange={(e) =>
                setJourneyDate(e.target.value)
              }
            />
          </label>

          <label>
            <span>Seat Capacity</span>
            <input
              type="number"
              min="1"
              max="500"
              value={capacity}
              onChange={(e) =>
                setCapacity(e.target.value)
              }
            />
          </label>

          <label>
            <span>Layout</span>
            <select
              value={layout}
              onChange={(e) =>
                setLayout(e.target.value)
              }
            >
              <option value="2x2">
                2 × 2
              </option>
              <option value="2x3">
                2 × 3
              </option>
              <option value="2x4">
                2 × 4
              </option>
              <option value="3x3">
                3 × 3
              </option>
              <option value="3x4">
                3 × 4
              </option>
            </select>
          </label>

        </div>

        <div className="seat-admin-actions">

          <button
            onClick={saveConfig}
            disabled={
              !serviceId ||
              saving ||
              !capacity
            }
          >
            {saving
              ? 'Saving...'
              : 'Save Seat Configuration'}
          </button>

          <button
            className="secondary"
            onClick={loadSeatData}
            disabled={
              !serviceId ||
              loading
            }
          >
            ↻ Refresh Map
          </button>

        </div>
      </div>

      {selectedService && (
        <div className="selected-service-banner">
          <strong>
            {serviceName(selectedService)}
          </strong>

          <span>
            Journey: {journeyDate}
          </span>
        </div>
      )}

      {loading ? (
        <div className="seat-admin-loading">
          <div className="seat-spinner" />
          Loading live seat inventory...
        </div>
      ) : seatMap ? (

        <div className="seat-admin-layout">

          <div className="seat-admin-card">

            <div className="seat-admin-card-head">

              <div>
                <span>LIVE INVENTORY</span>
                <h3>Seat Map</h3>
              </div>

              <span className="seat-layout-pill">
                {seatMap.layout}
              </span>

            </div>

            <div className="seat-admin-legend">

              <span>
                <i className="available" />
                Available
              </span>

              <span>
                <i className="occupied" />
                Occupied
              </span>

              <span>
                <i className="blocked" />
                Blocked
              </span>

            </div>

            <div className="admin-seat-map">

              <div className="admin-seat-front">
                FRONT
              </div>

              <div
                className="admin-seat-grid"
                style={{
                  gridTemplateColumns:
                    `repeat(${seatMap.columns || 4}, minmax(50px, 1fr))`
                }}
              >

                {seatMap.seats.map((seat) => (

                  <button
                    key={seat.seatNumber}
                    className={
                      `admin-seat ${seat.status.toLowerCase()}`
                    }
                    onClick={() =>
                      toggleBlocked(seat)
                    }
                    disabled={
                      seat.status === 'OCCUPIED'
                    }
                    title={
                      seat.status === 'OCCUPIED'
                        ? 'Occupied by customer'
                        : seat.status === 'BLOCKED'
                          ? 'Click to unblock'
                          : 'Click to block'
                    }
                  >
                    {seat.seatNumber}
                  </button>

                ))}

              </div>

              <p className="seat-admin-hint">
                Available → click to block.
                Blocked → click to release.
                Occupied seats are locked.
              </p>

            </div>
          </div>

          <div className="seat-admin-card inventory-summary">

            <span>INVENTORY SUMMARY</span>

            <h3>
              {selectedService
                ? serviceName(selectedService)
                    .split('•')[0]
                : 'Service'}
            </h3>

            <div className="inventory-metrics">

              <div>
                <strong>
                  {seatMap.capacity}
                </strong>
                <span>Total Seats</span>
              </div>

              <div>
                <strong>
                  {seatMap.availableCount}
                </strong>
                <span>Available</span>
              </div>

              <div>
                <strong>
                  {seatMap.occupiedCount}
                </strong>
                <span>Occupied</span>
              </div>

              <div>
                <strong>
                  {seatMap.blockedCount}
                </strong>
                <span>Blocked</span>
              </div>

            </div>

            <div className="inventory-note">
              <strong>Date-wise inventory</strong>
              <br />
              A booking on one journey date does not consume
              the same seat on another journey date.
            </div>

          </div>

        </div>

      ) : null}

    </section>
  );
}

export default SeatManagement;
