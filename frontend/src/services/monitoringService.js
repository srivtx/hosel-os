import api from './api';

const monitoringService = {
    simulate: () => api.post('/monitoring/simulate'),
    getStudentStats: (studentId) => api.get(`/monitoring/stats/${studentId}`),
    getAdminStats: () => api.get('/monitoring/admin-stats'),
};

export default monitoringService;
