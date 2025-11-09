import { createContext, useState, useContext, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error al parsear usuario:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 [AUTH LOGIN] Iniciando login para:', email);
      
      const response = await api.post('/auth/login', { email, password });
      
      console.log('📦 [AUTH LOGIN] Respuesta completa:', response);
      console.log('📦 [AUTH LOGIN] Response.data:', response.data);

      // ✅ Verificar que la respuesta sea exitosa
      if (response.data && response.data.success) {
        const { token, user: userData } = response.data.data;
        
        console.log('✅ [AUTH LOGIN] Login exitoso:', {
          token: token ? 'presente' : 'ausente',
          user: userData
        });

        // Guardar token y usuario
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Configurar header de autorización
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Actualizar estado
        setUser(userData);
        
        return { success: true, user: userData };
      } else {
        console.error('❌ [AUTH LOGIN] Respuesta no exitosa:', response.data);
        return { 
          success: false, 
          message: response.data?.message || 'Error en el inicio de sesión' 
        };
      }
    } catch (error) {
      console.error('❌ [AUTH LOGIN] Error en login:', error);
      console.error('❌ [AUTH LOGIN] Error response:', error.response?.data);
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al iniciar sesión. Por favor, intente nuevamente.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;