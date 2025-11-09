// frontend/src/config/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de REQUEST - Se ejecuta antes de cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 [API REQUEST] Token agregado a headers');
      console.log('📤 [API REQUEST]', config.method.toUpperCase(), config.url);
    } else {
      console.log('⚠️ [API REQUEST] Sin token en localStorage');
      console.log('📤 [API REQUEST]', config.method.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [API REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// Interceptor de RESPONSE - Se ejecuta después de cada petición
api.interceptors.response.use(
  (response) => {
    console.log('✅ [API RESPONSE] Success:', {
      method: response.config.method.toUpperCase(),
      url: response.config.url,
      status: response.status
    });
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const message = error.response?.data?.message || error.message;
    
    console.error('❌ [API RESPONSE ERROR]', {
      status,
      url,
      message
    });
    
    // Si el token es inválido o expiró (401)
    if (status === 401) {
      console.log('🔒 [API 401] Token inválido/expirado - Limpiando sesión...');
      
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirigir al login solo si no estamos ya ahí
      if (!window.location.pathname.includes('/login')) {
        console.log('🔄 [API 401] Redirigiendo a /login');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;