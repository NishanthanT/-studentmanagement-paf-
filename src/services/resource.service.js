import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const resourceService = {
    getAllResources: async (keyword = '', type = '') => {
        let params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (type) params.append('type', type);
        
        const response = await axios.get(`${API_URL}resources?${params.toString()}`, getAuthHeaders());
        return response.data;
    },
    
    getResourceById: async (id) => {
        const response = await axios.get(`${API_URL}resources/${id}`, getAuthHeaders());
        return response.data;
    },

    createResource: async (resourceData) => {
        const response = await axios.post(`${API_URL}admin/resources`, resourceData, getAuthHeaders());
        return response.data;
    },
    
    updateResource: async (id, resourceData) => {
        const response = await axios.put(`${API_URL}admin/resources/${id}`, resourceData, getAuthHeaders());
        return response.data;
    },
    
    deleteResource: async (id) => {
        const response = await axios.delete(`${API_URL}admin/resources/${id}`, getAuthHeaders());
        return response.data;
    }
};
