import axios from 'axios';

const API_URL = `http://${window.location.hostname}:8080/api/v1/auth/`;

export const authService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}login`, { email, password });
    return response.data;
  },

  signup: async (userData) => {
    const response = await axios.post(`${API_URL}signup`, userData);
    return response.data;
  },

  googleLogin: async (tokenId) => {
    const response = await axios.post(`${API_URL}google`, { token: tokenId });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axios.post(`${API_URL}forgot-password`, { email });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await axios.post(`${API_URL}verify-otp`, { email, otpCode: otp });
    return response.data;
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await axios.post(`${API_URL}reset-password`, { email, otpCode: otp, newPassword });
    return response.data;
  }
};
