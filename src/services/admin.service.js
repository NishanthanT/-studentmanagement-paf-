import axios from 'axios';

const API_URL = `http://${window.location.hostname}:8080/api/v1/`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const adminService = {
  getDashboardStats: async () => {
    const response = await axios.get(`${API_URL}admin/dashboard/stats`, getAuthHeaders());
    return response.data;
  },

  getUsers: async (searchTerm, role, status) => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('searchTerm', searchTerm);
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    
    const url = (searchTerm || role || status) 
      ? `${API_URL}admin/users/search?${params.toString()}` 
      : `${API_URL}admin/users`;
      
    const response = await axios.get(url, getAuthHeaders());
    return response.data;
  },

  getUserDetails: async (userId) => {
    const response = await axios.get(`${API_URL}admin/users/${userId}/details`, getAuthHeaders());
    return response.data;
  },

  updateRole: async (userId, role) => {
    const response = await axios.put(`${API_URL}admin/users/${userId}/role`, { role }, getAuthHeaders());
    return response.data;
  },

  updateStatus: async (userId, status) => {
    const response = await axios.put(`${API_URL}admin/users/${userId}/status`, { status }, getAuthHeaders());
    return response.data;
  },

  deleteUser: async (userId, reason) => {
    const config = getAuthHeaders();
    if (reason) {
      config.params = { reason };
    }
    const response = await axios.delete(`${API_URL}admin/users/${userId}`, config);
    return response.data;
  },

  exportUsersPdf: async (searchTerm, role, status) => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('searchTerm', searchTerm);
    if (role) params.append('role', role);
    if (status) params.append('status', status);

    const config = getAuthHeaders();
    config.responseType = 'blob';

    const response = await axios.get(`${API_URL}admin/reports/users?${params.toString()}`, config);
    return response.data;
  },

  exportBookingsPdf: async (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const config = getAuthHeaders();
    config.responseType = 'blob';

    const response = await axios.get(`${API_URL}admin/reports/bookings?${params.toString()}`, config);
    return response.data;
  },

  exportTicketsPdf: async (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const config = getAuthHeaders();
    config.responseType = 'blob';

    const response = await axios.get(`${API_URL}admin/reports/tickets?${params.toString()}`, config);
    return response.data;
  },

  getActivityLogs: async () => {
    const response = await axios.get(`${API_URL}admin/logs`, getAuthHeaders());
    return response.data;
  }
};
