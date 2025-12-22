import axios from 'axios';

const API_URL = 'http://localhost:8000/marketplace';

const getAuthHeader = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return {};
    const user = JSON.parse(userStr);
    return { 'X-Student-ID': user.id };
};

const getAvailableItems = async () => {
    return await axios.get(`${API_URL}/items`, {
        headers: getAuthHeader()
    });
};

const getMyItems = async () => {
    return await axios.get(`${API_URL}/my-items`, {
        headers: getAuthHeader()
    });
};

const createItem = async (itemData) => {
    return await axios.post(`${API_URL}/items`, itemData, {
        headers: getAuthHeader()
    });
};

const markAsSold = async (itemId) => {
    return await axios.put(`${API_URL}/items/${itemId}/sold`, {}, {
        headers: getAuthHeader()
    });
};

const deleteItem = async (itemId) => {
    return await axios.delete(`${API_URL}/items/${itemId}`, {
        headers: getAuthHeader()
    });
};

export default {
    getAvailableItems,
    getMyItems,
    createItem,
    markAsSold,
    deleteItem
};
