import React, { useMemo } from "react";
import {
  getTransportSeatLayout,
  getSeatStatus,
  normalizeSeatNumber
} from "../data/transportSeatLayouts";

const statusLabel = (status) => {
  switch (status) {
    case "OCCUPIED":
      return "Occupied";
    case "BLOCKED":
      return "Blocked";
    case "SELECTED":
      return "Selected";
    default:
      return "Available";
  }
};

export default function TransportSeatMap({
  type,
  seats = [],
  selectedSeats = [],
  onSeatClick,
  readOnly = false
}) {
  const layout = getTransportSeatLayout(type);

  const selected = useMemo(
    () => new Set((selectedSeats || []).map(normalizeSeatNumber)),
    [selectedSeats]
  );

  const grouped = useMemo(() => {
    const map = new Map();

    seats.forEach((seat) => {
      const number = normalizeSeatNumber(seat?.seatNumber);
      if (!number) return;

      const match = number.match(/^(\d+)([A-Z]+)$/);
      if (!match) return;

      const row = Number(match[1]);
      const column = match[2];

      if (!map.has(row)) map.set(row, {});
      map.get(row)[column] = seat;
    });

    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [seats]);

  const renderSeat = (seat, fallbackNumber) => {
    if (!seat) {
      return (
        <div
          key={`empty-${fallbackNumber}`}
          className="transport-seat transport-seat-empty"
          aria-hidden="true"
        />
      );
    }

    const number = normalizeSeatNumber(seat.seatNumber);
    const apiStatus = getSeatStatus(seat);
    const isSelected = selected.has(number);

    const status = isSelected && apiStatus === "AVAILABLE"
      ? "SELECTED"
      : apiStatus;

    const disabled =
      readOnly ||
      apiStatus === "OCCUPIED" ||
      apiStatus === "BLOCKED";

    return (
      <button
        key={number}
        type="button"
        className={`transport-seat transport-seat-${status.toLowerCase()} ${layout.seatClass}`}
        disabled={disabled}
        onClick={() => onSeatClick?.(seat)}
        title={`${number} — ${statusLabel(status)}`}
        aria-label={`${number} — ${statusLabel(status)}`}
      >
        <span className="seat-number">{number}</span>
      </button>
    );
  };

  const columns = layout.columns;

  return (
    <div className={`transport-seat-map transport-${String(type || "bus").toLowerCase()}`}>
      <div className="transport-seat-map-header">
        <div>
          <h3>{layout.title}</h3>
          <span>{grouped.length} rows · {seats.length} seats</span>
        </div>

        <div className="seat-legend">
          <span><i className="legend-dot available" /> Available</span>
          <span><i className="legend-dot selected" /> Selected</span>
          <span><i className="legend-dot occupied" /> Occupied</span>
          <span><i className="legend-dot blocked" /> Blocked</span>
        </div>
      </div>

      <div className="transport-vehicle">
        <div className="vehicle-front">
          {type === "FLIGHT" ? "✈ FRONT" : type === "TRAIN" ? "🚆 ENGINE" : "🚌 FRONT"}
        </div>

        <div className="seat-grid">
          {grouped.map(([row, rowSeats]) => (
            <div className="seat-row" key={row}>
              <div className="row-number">{row}</div>

              {columns.map((column, index) => (
                <React.Fragment key={`${row}-${column}`}>
                  {index === layout.aisleAfter && (
                    <div className="seat-aisle" aria-hidden="true" />
                  )}

                  {renderSeat(
                    rowSeats[column],
                    `${row}${column}`
                  )}
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>

        <div className="vehicle-back">REAR</div>
      </div>
    </div>
  );
}
