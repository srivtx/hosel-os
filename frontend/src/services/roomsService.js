import api from './api';

const roomsService = {
    getAll: async () => {
        const response = await api.get('/rooms/');
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/rooms/${id}`);
        return response.data;
    },
    seed: async () => {
        const response = await api.post('/seed');
        return response.data;
    }
};

export default roomsService;
