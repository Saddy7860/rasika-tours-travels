import api from './api';

export const getAllTrains = () => api.get('/trains');
export const searchTrains = (from, to, date) => api.get('/trains/search', { params: { from, to, date } });
export const getTrainById = (id) => api.get(`/trains/${id}`);
