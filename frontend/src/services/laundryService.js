import api from './api';

const laundryService = {
    getAll: async (date) => {
        const url = date ? `/laundry/?date=${date}` : '/laundry/';
        const response = await api.get(url);
        return response.data;
    },
    logUsage: async (data) => {
        const response = await api.post('/laundry/', data);
        return response.data;
    }
};

export default laundryService;
