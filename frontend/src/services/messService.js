import api from './api';

const messService = {
    getCredits: (studentId) => api.get(`/mess/credits/${studentId}`),

    // Enroll: sends a formData with image
    enroll: (studentId, imageFile) => {
        const formData = new FormData();
        formData.append('file', imageFile);
        return api.post(`/mess/enroll/${studentId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // Verify: sends a formData with snapshot
    verify: (imageBlob) => {
        const formData = new FormData();
        formData.append('file', imageBlob, 'snapshot.jpg');
        return api.post('/mess/verify', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

export default messService;
