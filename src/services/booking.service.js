import axios from 'axios';

// Separating admin and user endpoints makes things easier to track
const ADMIN_API_URL = `http://${window.location.hostname}:8080/api/admin/bookings`;
const USER_API_URL = `http://${window.location.hostname}:8080/api/v1/bookings`;

// helper to grab the auth token for secure requests
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

// fetch all bookings for the admin table
const getAllBookings = () => {
  return axios.get(ADMIN_API_URL, getAuthHeaders());
};

const searchBookings = (query) => {
  return axios.get(`${ADMIN_API_URL}/search`, {
    params: { query },
    ...getAuthHeaders() // spread headers so auth gets passed with the params
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

// admin needs to give a reason when rejecting
const rejectBooking = (id, reason) => {
  return axios.put(`${ADMIN_API_URL}/${id}/reject`, { reason }, getAuthHeaders());
};

// User-specific booking operations

// submits a new booking request 
const createBooking = (bookingData) => {
  return axios.post(USER_API_URL, bookingData, getAuthHeaders());
};

// gets only the current logged-in user's bookings
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

