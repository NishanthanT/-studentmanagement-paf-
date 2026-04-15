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

    createResource: async (resourceData, imageFile) => {
        const formData = new FormData();
        formData.append('resource', new Blob([JSON.stringify(resourceData)], { type: 'application/json' }));
        if (imageFile) {
            formData.append('image', imageFile);
        }
        const response = await axios.post(`${API_URL}admin/resources`, formData, {
            ...getAuthHeaders(),
            headers: {
                ...getAuthHeaders().headers,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    
    updateResource: async (id, resourceData, imageFile) => {
        const formData = new FormData();
        formData.append('resource', new Blob([JSON.stringify(resourceData)], { type: 'application/json' }));
        if (imageFile) {
            formData.append('image', imageFile);
        }
        const response = await axios.put(`${API_URL}admin/resources/${id}`, formData, {
            ...getAuthHeaders(),
            headers: {
                ...getAuthHeaders().headers,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    
    deleteResource: async (id) => {
        const response = await axios.delete(`${API_URL}admin/resources/${id}`, getAuthHeaders());
        return response.data;
    },

    // Resource Type APIs
    getAllResourceTypes: async () => {
        const response = await axios.get(`${API_URL}resource-types`, getAuthHeaders());
        return response.data;
    },

    createResourceType: async (typeData) => {
        const response = await axios.post(`${API_URL}resource-types`, typeData, getAuthHeaders());
        return response.data;
    },

    updateResourceType: async (id, typeData) => {
        const response = await axios.put(`${API_URL}resource-types/${id}`, typeData, getAuthHeaders());
        return response.data;
    },

    deleteResourceType: async (id) => {
        const response = await axios.delete(`${API_URL}resource-types/${id}`, getAuthHeaders());
        return response.data;
    }
};
