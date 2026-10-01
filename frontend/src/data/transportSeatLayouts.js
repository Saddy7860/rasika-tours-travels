/**
 * Rasika Tours & Travels
 * Transport-specific seat layouts.
 *
 * Backend remains the source of truth for seat status.
 * These definitions control only the visual arrangement.
 */

export const TRANSPORT_SEAT_LAYOUTS = {
  BUS: {
    type: "BUS",
    title: "Bus Seating",
    layout: "2+2",
    columns: ["A", "B", "C", "D"],
    aisleAfter: 2,
    seatClass: "bus-seat"
  },

  TRAIN: {
    type: "TRAIN",
    title: "Train Coach",
    layout: "2+2",
    columns: ["A", "B", "C", "D"],
    aisleAfter: 2,
    seatClass: "train-seat"
  },

  FLIGHT: {
    type: "FLIGHT",
    title: "Aircraft Cabin",
    layout: "3+3",
    columns: ["A", "B", "C", "D", "E", "F"],
    aisleAfter: 3,
    seatClass: "flight-seat"
  }
};

export const getTransportSeatLayout = (type) => {
  const key = String(type || "").toUpperCase();

  return (
    TRANSPORT_SEAT_LAYOUTS[key] ||
    TRANSPORT_SEAT_LAYOUTS.BUS
  );
};

export const normalizeSeatNumber = (seatNumber) =>
  String(seatNumber || "").trim().toUpperCase();

export const getSeatStatus = (seat) =>
  String(seat?.status || "AVAILABLE").toUpperCase();

export const isSeatAvailable = (seat) =>
  getSeatStatus(seat) === "AVAILABLE";

export const isSeatOccupied = (seat) =>
  getSeatStatus(seat) === "OCCUPIED";

export const isSeatBlocked = (seat) =>
  getSeatStatus(seat) === "BLOCKED";
