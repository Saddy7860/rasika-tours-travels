import api from './api';

export const getAllFlights = () => api.get('/flights');
export const searchFlights = (from, to, date) => api.get('/flights/search', { params: { from, to, date } });
export const getFlightById = (id) => api.get(`/flights/${id}`);
