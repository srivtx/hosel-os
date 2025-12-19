import api from './api';

const complaintService = {
    getAll: async () => {
        const response = await api.get('/complaints/');
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/complaints/', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/complaints/${id}`, data);
        return response.data;
    }
};

export default complaintService;
