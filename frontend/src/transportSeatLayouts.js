export const TRANSPORT_SEAT_LAYOUTS = {
  BUS: {
    columns: 4,
    layout: "2x2",
    aisleAfter: 2,
  },

  TRAIN: {
    columns: 4,
    layout: "2x2",
    aisleAfter: 2,
  },

  FLIGHT: {
    columns: 4,
    layout: "2x2",
    aisleAfter: 2,
  },
};

export function getTransportSeatLayout(type) {
  return (
    TRANSPORT_SEAT_LAYOUTS[String(type || "").toUpperCase()] ||
    TRANSPORT_SEAT_LAYOUTS.BUS
  );
}

export function getSeatPosition(seatNumber) {
  const value = String(seatNumber || "");
  const match = value.match(/^(\d+)([A-Z])$/i);

  if (!match) {
    return {
      row: 0,
      column: 0,
      letter: "",
    };
  }

  return {
    row: Number(match[1]),
    column: match[2].toUpperCase().charCodeAt(0) - 64,
    letter: match[2].toUpperCase(),
  };
}
