import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8080/api`;

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export const notificationService = {
    getNotifications: async () => {
        const response = await axios.get(`${API_URL}/notifications`, { headers: getAuthHeader() });
        return response.data;
    },

    getUnreadCount: async () => {
        const response = await axios.get(`${API_URL}/notifications/unread-count`, { headers: getAuthHeader() });
        return response.data;
    },

    markAsRead: async (id) => {
        const response = await axios.put(`${API_URL}/notifications/${id}/read`, {}, { headers: getAuthHeader() });
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await axios.put(`${API_URL}/notifications/read-all`, {}, { headers: getAuthHeader() });
        return response.data;
    },
    
    clearAll: async () => {
        const response = await axios.delete(`${API_URL}/notifications/clear-all`, { headers: getAuthHeader() });
        return response.data;
    }
};
