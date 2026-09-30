import api from './api';

const dashboardService = {
  getMyBookings: () =>
    api.get('/bookings/my-bookings').then(res => res.data),

  getMyPassportRequests: () =>
    api.get('/passport/my-requests').then(res => res.data),
};

export default dashboardService;
