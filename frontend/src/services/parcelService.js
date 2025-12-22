import api from './api';

const parcelService = {
    receive: (studentId, courier) => api.post('/parcels/receive', { student_id: studentId, courier }),
    getPending: () => api.get('/parcels/pending'),
    getMyParcels: (studentId) => api.get(`/parcels/my-parcels/${studentId}`),
    collect: (parcelId) => api.post(`/parcels/collect/${parcelId}`),
};

export default parcelService;
