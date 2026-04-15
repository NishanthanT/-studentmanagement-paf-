import axios from 'axios';

const API_URL = `http://${window.location.hostname}:8080/api/v1/users/`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const userService = {
  getCurrentProfile: async () => {
    const response = await axios.get(`${API_URL}profile`, getAuthHeaders());
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await axios.put(`${API_URL}profile`, profileData, getAuthHeaders());
    return response.data;
  }
};
