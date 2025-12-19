import api from './api';

const attendanceService = {
    markAttendance: (latitude, longitude, studentId) => api.post(`/attendance/mark?student_id=${studentId}`, { latitude, longitude }),
    getTodayStatus: (studentId) => api.get(`/attendance/today/${studentId}`),
    setLocation: (latitude, longitude) => api.post('/attendance/set-location', { latitude, longitude }),
    getReport: (date) => api.get(`/attendance/report${date ? `?date=${date}` : ''}`),
};

export default attendanceService;
