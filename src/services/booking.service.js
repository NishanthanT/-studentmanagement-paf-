import axios from 'axios';

const ADMIN_API_URL = 'http://localhost:8080/api/admin/bookings';
const USER_API_URL = 'http://localhost:8080/api/v1/bookings';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

const getAllBookings = () => {
  return axios.get(ADMIN_API_URL, getAuthHeaders());
};

const searchBookings = (query) => {
  return axios.get(`${ADMIN_API_URL}/search`, {
    params: { query },
    ...getAuthHeaders()
  });
};

const filterBookings = (filters) => {
  return axios.get(`${ADMIN_API_URL}/filter`, {
    params: filters,
    ...getAuthHeaders()
  });
};

const approveBooking = (id) => {
  return axios.put(`${ADMIN_API_URL}/${id}/approve`, {}, getAuthHeaders());
};

const rejectBooking = (id, reason) => {
  return axios.put(`${ADMIN_API_URL}/${id}/reject`, { reason }, getAuthHeaders());
};

// User-specific booking operations
const createBooking = (bookingData) => {
  return axios.post(USER_API_URL, bookingData, getAuthHeaders());
};

const getMyBookings = () => {
  return axios.get(`${USER_API_URL}/my`, getAuthHeaders());
};

const cancelBooking = (id) => {
  return axios.put(`${USER_API_URL}/${id}/cancel`, {}, getAuthHeaders());
};

const updateBooking = (id, bookingData) => {
  return axios.put(`${USER_API_URL}/${id}`, bookingData, getAuthHeaders());
};

export const adminBookingService = {
  getAllBookings,
  searchBookings,
  filterBookings,
  approveBooking,
  rejectBooking
};

export const bookingService = {
  createBooking,
  getMyBookings,
  cancelBooking,
  updateBooking
};

