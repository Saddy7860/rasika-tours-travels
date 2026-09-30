import api from './api';

export const getAllBuses = () => api.get('/buses');
export const searchBuses = (from, to, date) => api.get('/buses/search', { params: { from, to, date } });
export const getBusById = (id) => api.get(`/buses/${id}`);
