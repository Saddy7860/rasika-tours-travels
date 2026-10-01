export const TRANSPORT_CLASSES = {
  BUS: [
    { value: 'AC Seater', label: 'AC Seater', layout: '2+2', icon: '🚌' },
    { value: 'Seater', label: 'Seater', layout: '2+2', icon: '💺' },
    { value: 'Sleeper', label: 'Sleeper', layout: '1+1 berth', icon: '🛏️' },
    { value: 'AC Sleeper', label: 'AC Sleeper', layout: '1+1 berth', icon: '🛏️' },
    { value: 'Premium', label: 'Premium / Volvo', layout: '2+2', icon: '⭐' }
  ],

  TRAIN: [
    { value: 'General', label: 'General', layout: '3+2', icon: '🚆' },
    { value: 'Chair Car', label: 'Chair Car', layout: '3+2', icon: '💺' },
    { value: 'Sleeper', label: 'Sleeper', layout: 'berths', icon: '🛏️' },
    { value: 'AC 3 Tier', label: 'AC 3 Tier', layout: 'berths', icon: '❄️' },
    { value: 'AC 2 Tier', label: 'AC 2 Tier', layout: 'berths', icon: '❄️' },
    { value: 'First AC', label: 'First AC', layout: 'berths', icon: '👑' }
  ],

  FLIGHT: [
    { value: 'Economy', label: 'Economy', layout: '3+3', icon: '✈️' },
    { value: 'Premium Economy', label: 'Premium Economy', layout: '2+2', icon: '⭐' },
    { value: 'Business', label: 'Business', layout: '1+1', icon: '💼' },
    { value: 'First', label: 'First Class', layout: '1+1', icon: '👑' }
  ]
};

export function getTransportClasses(type) {
  return TRANSPORT_CLASSES[type] || [];
}

export function getDefaultClass(type) {
  return getTransportClasses(type)[0]?.value || '';
}

export function isSleeperClass(type, travelClass) {
  const c = String(travelClass || '').toLowerCase();

  return type === 'BUS'
    ? c.includes('sleeper')
    : type === 'TRAIN'
      ? c.includes('sleeper') ||
        c.includes('tier') ||
        c.includes('1a') ||
        c.includes('2a') ||
        c.includes('3a')
      : false;
}

export function getSeatLayout(type, travelClass) {
  if (isSleeperClass(type, travelClass)) {
    return {
      mode: 'BERTH',
      columns: ['LOWER', 'UPPER']
    };
  }

  if (type === 'FLIGHT') {
    const c = String(travelClass || '').toLowerCase();

    if (c.includes('business') || c.includes('first')) {
      return { mode: 'SEAT', columns: ['A', 'AISLE', 'B'] };
    }

    if (c.includes('premium')) {
      return { mode: 'SEAT', columns: ['A', 'B', 'AISLE', 'C', 'D'] };
    }

    return {
      mode: 'SEAT',
      columns: ['A', 'B', 'C', 'AISLE', 'D', 'E', 'F']
    };
  }

  if (type === 'TRAIN') {
    return {
      mode: 'SEAT',
      columns: ['A', 'B', 'C', 'AISLE', 'D', 'E']
    };
  }

  return {
    mode: 'SEAT',
    columns: ['A', 'B', 'AISLE', 'C', 'D']
  };
}
