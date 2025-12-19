import api from './api';

const rentService = {
    getAll: async () => {
        const response = await api.get('/rent/');
        return response.data;
    },
    getPending: async () => {
        const response = await api.get('/rent/pending');
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/rent/', data);
        return response.data;
    }
};

export default rentService;
