import React, { useCallback, useEffect, useMemo, useState } from "react";
import TransportSeatMap from "./TransportSeatMap";
import "./SeatManagement.css";

const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

const normalizeType = (value) =>
  String(value || "").trim().toUpperCase();

function SeatManagement() {
  const [type, setType] = useState("BUS");
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [journeyDate, setJourneyDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [seatData, setSeatData] = useState(null);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const endpointForType = useMemo(() => {
    switch (type) {
      case "TRAIN":
        return `${API_BASE}/api/trains`;
      case "FLIGHT":
        return `${API_BASE}/api/flights`;
      default:
        return `${API_BASE}/api/buses`;
    }
  }, [type]);

  const loadServices = useCallback(async () => {
    setLoadingServices(true);
    setError("");

    try {
      const response = await fetch(endpointForType);

      if (!response.ok) {
        throw new Error(`Unable to load ${type.toLowerCase()} services`);
      }

      const data = await response.json();
      setServices(Array.isArray(data) ? data : []);

      if (data?.length) {
        setServiceId(String(data[0].id));
      } else {
        setServiceId("");
        setSeatData(null);
      }
    } catch (err) {
      setServices([]);
      setServiceId("");
      setSeatData(null);
      setError(err.message || "Unable to load services");
    } finally {
      setLoadingServices(false);
    }
  }, [endpointForType, type]);

  const loadSeats = useCallback(async () => {
    if (!serviceId || !journeyDate) {
      setSeatData(null);
      return;
    }

    setLoadingSeats(true);
    setError("");

    try {
      const params = new URLSearchParams({
        type: normalizeType(type),
        serviceId: String(serviceId),
        journeyDate
      });

      const response = await fetch(
        `${API_BASE}/api/bookings/seats?${params.toString()}`
      );

      const text = await response.text();

      if (!response.ok) {
        throw new Error(text || `Seat API returned ${response.status}`);
      }

      const data = JSON.parse(text);
      setSeatData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setSeatData(null);
      setError(err.message || "Unable to load seats");
    } finally {
      setLoadingSeats(false);
    }
  }, [type, serviceId, journeyDate]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  useEffect(() => {
    loadSeats();
  }, [loadSeats]);

  useEffect(() => {
    const handleSeatDataChanged = (event) => {
      const detail = event?.detail || {};

      const detailType = normalizeType(detail.type);
      const detailServiceId = String(detail.serviceId || "");
      const detailJourneyDate = String(detail.journeyDate || "");

      const matches =
        (!detailType || detailType === normalizeType(type)) &&
        (!detailServiceId || detailServiceId === String(serviceId)) &&
        (!detailJourneyDate || detailJourneyDate === journeyDate);

      if (matches) {
        loadSeats();
      }
    };

    window.addEventListener(
      "rasika:seat-data-changed",
      handleSeatDataChanged
    );

    return () => {
      window.removeEventListener(
        "rasika:seat-data-changed",
        handleSeatDataChanged
      );
    };
  }, [loadSeats, type, serviceId, journeyDate]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      loadSeats();
    }, 2000);

    return () => window.clearInterval(timer);
  }, [loadSeats]);

  const selectedService = services.find(
    (service) => String(service.id) === String(serviceId)
  );

  const serviceName = selectedService
    ? selectedService.operator ||
      selectedService.trainName ||
      selectedService.airline ||
      selectedService.busNumber ||
      selectedService.trainNumber ||
      selectedService.flightNumber ||
      `Service #${serviceId}`
    : "";

  const handleManualRefresh = () => {
    loadSeats();
  };

  return (
    <div className="seat-management-page">
      <div className="seat-management-header">
        <div>
          <span className="eyebrow">RASIKA TRANSPORT CONTROL</span>
          <h1>Seat Management</h1>
          <p>Manage live seat availability across buses, trains and flights.</p>
        </div>

        <button
          type="button"
          className="seat-refresh-button"
          onClick={handleManualRefresh}
          disabled={loadingSeats}
        >
          {loadingSeats ? "Refreshing..." : "↻ Refresh Seats"}
        </button>
      </div>

      <div className="seat-controls-card">
        <div className="transport-tabs">
          {["BUS", "TRAIN", "FLIGHT"].map((item) => (
            <button
              type="button"
              key={item}
              className={type === item ? "active" : ""}
              onClick={() => {
                setType(item);
                setSeatData(null);
              }}
            >
              {item === "BUS" && "🚌"}
              {item === "TRAIN" && "🚆"}
              {item === "FLIGHT" && "✈️"}
              <span>{item}</span>
            </button>
          ))}
        </div>

        <div className="seat-filter-grid">
          <label>
            <span>Service</span>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              disabled={loadingServices}
            >
              {!services.length && (
                <option value="">No services found</option>
              )}

              {services.map((service) => {
                const label =
                  service.operator ||
                  service.trainName ||
                  service.airline ||
                  service.busNumber ||
                  service.trainNumber ||
                  service.flightNumber ||
                  `Service ${service.id}`;

                return (
                  <option value={service.id} key={service.id}>
                    {label} — #{service.id}
                  </option>
                );
              })}
            </select>
          </label>

          <label>
            <span>Journey date</span>
            <input
              type="date"
              value={journeyDate}
              onChange={(e) => setJourneyDate(e.target.value)}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="seat-error">
          <strong>Seat system error</strong>
          <span>{error}</span>
        </div>
      )}

      {seatData && (
        <>
          <div className="seat-summary-grid">
            <div className="seat-summary-card">
              <span>Total</span>
              <strong>{seatData.capacity ?? seatData.seats?.length ?? 0}</strong>
            </div>

            <div className="seat-summary-card available">
              <span>Available</span>
              <strong>{seatData.availableCount ?? 0}</strong>
            </div>

            <div className="seat-summary-card occupied">
              <span>Occupied</span>
              <strong>{seatData.occupiedCount ?? 0}</strong>
            </div>

            <div className="seat-summary-card blocked">
              <span>Blocked</span>
              <strong>{seatData.blockedCount ?? 0}</strong>
            </div>
          </div>

          <div className="seat-service-info">
            <div>
              <span className="service-type">{type}</span>
              <h2>{serviceName}</h2>
              <p>
                Service #{serviceId} · {journeyDate}
              </p>
            </div>

            <div className="seat-live-status">
              <span className="live-dot" />
              <span>Live seat data</span>
              {lastUpdated && (
                <small>
                  {lastUpdated.toLocaleTimeString()}
                </small>
              )}
            </div>
          </div>

          <TransportSeatMap
            type={type}
            seats={seatData.seats || []}
            readOnly
          />
        </>
      )}

      {!seatData && !loadingSeats && !error && (
        <div className="seat-empty-state">
          Select a service and journey date to view its live seat map.
        </div>
      )}
    </div>
  );
}

export default SeatManagement;
