import axios from 'axios';

const API_URL = `http://${window.location.hostname}:8080/api/`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const ticketService = {
    // User functions
    createTicket: async (formData) => {
        // formData should be a FormData object for multipart support
        const response = await axios.post(`${API_URL}tickets`, formData, {
            ...getAuthHeaders(),
            headers: {
                ...getAuthHeaders().headers,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    getMyTickets: async () => {
        const response = await axios.get(`${API_URL}tickets/my`, getAuthHeaders());
        return response.data;
    },

    getTicketById: async (id) => {
        const response = await axios.get(`${API_URL}tickets/${id}`, getAuthHeaders());
        return response.data;
    },

    addComment: async (ticketId, commentData) => {
        const response = await axios.post(`${API_URL}tickets/${ticketId}/comments`, commentData, getAuthHeaders());
        return response.data;
    },

    editComment: async (commentId, commentData) => {
        const response = await axios.put(`${API_URL}tickets/comments/${commentId}`, commentData, getAuthHeaders());
        return response.data;
    },

    deleteComment: async (commentId) => {
        const response = await axios.delete(`${API_URL}tickets/comments/${commentId}`, getAuthHeaders());
        return response.data;
    },

    // Admin functions
    getAllTickets: async () => {
        const response = await axios.get(`${API_URL}admin/tickets`, getAuthHeaders());
        return response.data;
    },

    searchTickets: async (query) => {
        const response = await axios.get(`${API_URL}admin/tickets/search?query=${query}`, getAuthHeaders());
        return response.data;
    },

    filterTickets: async (filters) => {
        const params = new URLSearchParams(filters);
        const response = await axios.get(`${API_URL}admin/tickets/filter?${params.toString()}`, getAuthHeaders());
        return response.data;
    },

    assignTechnician: async (ticketId, technicianId) => {
        const response = await axios.put(`${API_URL}admin/tickets/${ticketId}/assign`, { technicianId }, getAuthHeaders());
        return response.data;
    },

    updateTicketStatus: async (ticketId, statusData) => {
        const response = await axios.put(`${API_URL}admin/tickets/${ticketId}/status`, statusData, getAuthHeaders());
        return response.data;
    },

    // Technician functions
    getAssignedTickets: async () => {
        const response = await axios.get(`${API_URL}technician/tickets/my`, getAuthHeaders());
        return response.data;
    },

    updateTechnicianStatus: async (ticketId, statusData) => {
        const response = await axios.put(`${API_URL}technician/tickets/${ticketId}/status`, statusData, getAuthHeaders());
        return response.data;
    },
    
    getTechnicianStats: async () => {
        const response = await axios.get(`${API_URL}technician/tickets/stats`, getAuthHeaders());
        return response.data;
    }
};
