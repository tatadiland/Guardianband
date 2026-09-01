import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach JWT token to every request and handle FormData
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If data is FormData, don't set Content-Type header
    // Let browser set it to multipart/form-data automatically
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    
    return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ─── Auth ───────────────────────────────────────────────
export const authAPI = {
    register: (data: { name: string; email: string; number: string; password: string }) =>
        api.post('/api/users/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/api/users/login', data),
    getMe: () => api.get('/api/users/me'),
    updateMe: (data: Record<string, unknown>) => api.put('/api/users/me', data),
};

// ─── Child ──────────────────────────────────────────────
export const childAPI = {
    getMyChild: () => api.get('/api/children/user/me'),
    createChild: (data: Record<string, unknown>) => api.post('/api/children', data),
    updateChild: (id: number, data: Record<string, unknown>) => api.put(`/api/children/${id}`, data),
    deleteChild: (id: number) => api.delete(`/api/children/${id}`),
};

// ─── Routines ───────────────────────────────────────────
export const routineAPI = {
    getRoutines: (childId: number) => api.get(`/api/routines/child/${childId}`),
    createRoutine: (childId: number, data: Record<string, unknown>) =>
        api.post(`/api/routines/child/${childId}`, data),
    updateRoutine: (id: number, data: Record<string, unknown>) =>
        api.put(`/api/routines/${id}`, data),
    deleteRoutine: (id: number) => api.delete(`/api/routines/${id}`),
};

// ─── Alerts ─────────────────────────────────────────────
export const alertAPI = {
    getAlerts: (childId: number) => api.get(`/api/alerts/child/${childId}`),
    markRead: (id: number) => api.put(`/api/alerts/${id}/read`),
};

// ─── Health ─────────────────────────────────────────────
export const healthAPI = {
    getHealthData: (childId: number) => api.get(`/api/health/child/${childId}`),
};

// ─── Device ─────────────────────────────────────────────
export const deviceAPI = {
    getDevice: (childId: number) => api.get(`/api/devices/child/${childId}`),
    linkDevice: (childId: number, data: { name: string; hardwareId: string }) =>
        api.post(`/api/devices/child/${childId}`, data),
};

// ─── Location ───────────────────────────────────────────
export const locationAPI = {
    getLastLocation: (deviceId: number) => api.get(`/api/locations/device/${deviceId}`),
    updateLocation: (deviceId: number, data: { latitude: number; longitude: number }) =>
        api.post(`/api/locations/device/${deviceId}`, data),
};

// ─── Geofence ───────────────────────────────────────────
export const geofenceAPI = {
    getGeofence: (childId: number) => api.get(`/api/geofences/child/${childId}`),
    saveGeofence: (childId: number, data: { name?: string; latitude: number; longitude: number; radius: number }) =>
        api.post(`/api/geofences/child/${childId}`, data),
    deleteGeofence: (childId: number) => api.delete(`/api/geofences/child/${childId}`),
};

// ─── AI Assistant ───────────────────────────────────────
export const aiAPI = {
    ask: (message: string) => api.post('/api/ai/ask', { message }),
};

// ─── Utilities ───────────────────────────────────────────
export { BASE_URL };

export default api;
