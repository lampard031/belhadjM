import axios from 'axios';

// For production deployment, this will be the Hostinger domain
// For development, it uses the React environment variable
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Empty string for same-origin requests on Hostinger
  : process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session-based auth
});

// Cars API
export const carsAPI = {
  getAll: () => api.get('/cars'),
  getFeatured: () => api.get('/cars/featured'),
  getById: (id) => api.get(`/cars/${id}`),
  create: (carData) => api.post('/cars', carData),
  update: (id, carData) => api.put('/cars', { ...carData, id }),
  delete: (id) => api.delete('/cars', { data: { id } }),
};

// Jet-skis API
export const jetskisAPI = {
  getAll: () => api.get('/jetskis'),
  getFeatured: () => api.get('/jetskis/featured'),
  getById: (id) => api.get(`/jetskis/${id}`),
  create: (jetskiData) => api.post('/jetskis', jetskiData),
  update: (id, jetskiData) => api.put('/jetskis', { ...jetskiData, id }),
  delete: (id) => api.delete('/jetskis', { data: { id } }),
};

// Admin API
export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  logout: () => api.post('/admin/logout'),
  getStatus: () => api.get('/admin/status'),
  getStats: () => api.get('/admin/stats'),
};

// Error handler for API responses
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    console.error('API Error:', error.response.data);
    throw new Error(error.response.data.message || error.response.data.error || 'API Error');
  } else if (error.request) {
    // Request was made but no response received
    console.error('Network Error:', error.request);
    throw new Error('Erro de rede - verifique sua conexão');
  } else {
    // Something else happened
    console.error('Error:', error.message);
    throw new Error(error.message);
  }
};

export default api;