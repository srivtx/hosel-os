import api from './api';

const studentsService = {
    getAll: async () => {
        const response = await api.get('/students/');
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/students/${id}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/students/', data);
        return response.data;
    },
    // Room related calls
    createRoom: async (data) => {
        const response = await api.post('/students/rooms/', data);
        return response.data;
    },
    getAllRooms: async () => {
        const response = await api.get('/students/rooms/');
        return response.data;
    }
};

export default studentsService;
