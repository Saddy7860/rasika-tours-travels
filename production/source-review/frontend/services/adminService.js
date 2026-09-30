import api from './api';

const adminService = {

  // Dashboard Statistics
  getBookingStats: () =>
    api.get('/bookings/admin/stats').then(res => res.data),

  // Bookings
  getAllBookings: () => api.get('/bookings/admin/all').then(res => res.data),

  updateRefundStatus: (id, refundStatus) =>
    api.put(`/bookings/admin/${id}/refund`, { refundStatus }).then(res => res.data),

  // Buses
  getAllBuses: () => api.get('/buses').then(res => res.data),
  createBus: (bus) => api.post('/buses', bus).then(res => res.data),
  updateBus: (id, bus) => api.put(`/buses/${id}`, bus).then(res => res.data),
  deleteBus: (id) => api.delete(`/buses/${id}`),

  // Trains
  getAllTrains: () => api.get('/trains').then(res => res.data),
  createTrain: (train) => api.post('/trains', train).then(res => res.data),
  updateTrain: (id, train) => api.put(`/trains/${id}`, train).then(res => res.data),
  deleteTrain: (id) => api.delete(`/trains/${id}`),

  // Flights
  getAllFlights: () => api.get('/flights').then(res => res.data),
  createFlight: (flight) => api.post('/flights', flight).then(res => res.data),
  updateFlight: (id, flight) => api.put(`/flights/${id}`, flight).then(res => res.data),
  deleteFlight: (id) => api.delete(`/flights/${id}`),
  // Passport Requests

  getAllPassportRequests: () =>
    api.get('/passport/admin/all').then(res => res.data),

  updatePassportStatus: (id, status, remarks) =>
    api.put(`/passport/admin/${id}/status`, { status, remarks })
      .then(res => res.data),

  // Contact Messages

  getAllContactMessages: () =>
    api.get('/contact/admin/all').then(res => res.data),

  markContactMessageAsRead: (id) =>
    api.put(`/contact/admin/${id}/read`).then(res => res.data),

  replyToContactMessage: (id, adminReply) =>
    api.put(`/contact/admin/${id}/reply`, { adminReply })
      .then(res => res.data),

};

export default adminService;
